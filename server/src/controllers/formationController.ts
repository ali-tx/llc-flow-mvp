import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getAgentResponse, Message } from '../services/claude';
import { saveFormation, getFormation } from '../services/db';

const conversations: Record<string, Message[]> = {};

export const startFormation = async (req: Request, res: Response) => {
  const { state } = req.body;
  const sessionId = uuidv4();
  
  const initialMessage = `Hi! I'll help you form an LLC in ${state}. Let's start—what's your business name?`;
  
  conversations[sessionId] = [
    { role: 'assistant', content: initialMessage }
  ];

  await saveFormation(sessionId, state, { messages: conversations[sessionId] });
  
  res.json({ sessionId, initialMessage });
};

export const handleMessage = async (req: Request, res: Response) => {
  const { sessionId } = req.params;
  const { userMessage } = req.body;

  if (!conversations[sessionId]) {
    return res.status(404).json({ error: 'Session not found' });
  }

  // Add user message
  conversations[sessionId].push({ role: 'user', content: userMessage });

  try {
    const agentResponse = await getAgentResponse(conversations[sessionId]);
    
    // Add assistant response
    conversations[sessionId].push({ role: 'assistant', content: agentResponse });

    // Check if the agent outputted JSON (requiresSubmission)
    let rawContent = agentResponse.trim();
    const jsonMatch = rawContent.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
    
    if (jsonMatch) {
      rawContent = jsonMatch[1].trim();
    } else {
      // Fallback: Just grab everything from the first '{' to the last '}'
      const startIdx = rawContent.indexOf('{');
      const endIdx = rawContent.lastIndexOf('}');
      if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
        rawContent = rawContent.substring(startIdx, endIdx + 1);
      }
    }

    const isJson = rawContent.startsWith('{') && rawContent.endsWith('}');
    
    let formData = null;
    if (isJson) {
      try {
        formData = JSON.parse(rawContent);
      } catch (e) {
        console.error('Failed to parse agent JSON:', e);
      }
    }

    res.json({ 
      agentResponse, 
      requiresSubmission: isJson,
      formData 
    });
  } catch (error) {
    res.status(500).json({ error: 'AI Agent failed to respond' });
  }
};

export const generateDocument = async (req: Request, res: Response) => {
  const { sessionId } = req.params;
  const { formData } = req.body;
  
  const pdfUrl = `/api/formations/${sessionId}/pdf`;
  const jsonUrl = `/api/formations/${sessionId}/json`;

  res.json({ 
    success: true,
    pdfUrl,
    jsonUrl
  });
};
