import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getAgentResponse, Message } from '../services/claude';
import { saveFormation, getFormation } from '../services/db';
import { generatePdf } from '../services/pdfService';

const conversations: Record<string, Message[]> = {};

export const startFormation = async (req: Request, res: Response) => {
  const sessionId = uuidv4();

  // Seed the conversation with a single user turn that triggers the welcome message
  const seedMessages: Message[] = [
    { role: 'user', content: 'I want to start my LLC' },
  ];

  try {
    const agentResp = await getAgentResponse(seedMessages);
    const assistantMsg: Message = { role: 'assistant', content: JSON.stringify(agentResp) };

    conversations[sessionId] = [...seedMessages, assistantMsg];
    await saveFormation(sessionId, '', { messages: conversations[sessionId] });

    res.json({
      sessionId,
      message: agentResp.message,
      chips: agentResp.chips,
      done: false,
      formData: null,
    });
  } catch (error) {
    console.error('[startFormation] Error:', error);
    // Fallback welcome
    const fallbackMsg = 'Hi! I\'ll help you form your LLC. What kind of business are you starting?';
    const fallbackChips = ['Software / Tech', 'Consulting', 'E-commerce', 'Freelancing', 'Other'];
    const fallbackRaw = JSON.stringify({ message: fallbackMsg, chips: fallbackChips, done: false, formData: null });
    conversations[sessionId] = [
      { role: 'user', content: 'I want to start my LLC' },
      { role: 'assistant', content: fallbackRaw },
    ];
    res.json({ sessionId, message: fallbackMsg, chips: fallbackChips, done: false, formData: null });
  }
};

export const handleMessage = async (req: Request, res: Response) => {
  const { sessionId } = req.params;
  const { userMessage } = req.body;

  if (!conversations[sessionId]) {
    return res.status(404).json({ error: 'Session not found' });
  }

  conversations[sessionId].push({ role: 'user', content: userMessage });

  try {
    const agentResp = await getAgentResponse(conversations[sessionId]);
    conversations[sessionId].push({ role: 'assistant', content: JSON.stringify(agentResp) });

    res.json({
      message: agentResp.message,
      chips: agentResp.chips,
      done: agentResp.done,
      formData: agentResp.formData,
    });
  } catch (error) {
    console.error('[handleMessage] Error:', error);
    res.status(500).json({ error: 'AI Agent failed to respond' });
  }
};

export const generateDocument = async (req: Request, res: Response) => {
  const { sessionId } = req.params;
  const { formData } = req.body;

  if (!formData) {
    return res.status(400).json({ error: 'formData is required' });
  }

  try {
    const state = formData.stateAbbr || formData.state?.substring(0, 2).toUpperCase() || 'DE';
    const pdfBuffer = await generatePdf(state, formData);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${(formData.businessName || 'formation').replace(/\s+/g, '_')}_Certificate.pdf"`,
      'Content-Length': pdfBuffer.length,
    });
    res.send(pdfBuffer);
  } catch (error) {
    console.error('[generateDocument] Error:', error);
    res.status(500).json({ error: 'PDF generation failed' });
  }
};
