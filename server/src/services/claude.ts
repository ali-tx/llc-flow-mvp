import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

dotenv.config();

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY || '',
});

const SYSTEM_PROMPT = `
You are an LLC formation assistant. Your job is to collect data 
about the user's business and help them generate Articles of Organization.

Core Rules:
1. Collect required data through conversation (see Required Data Fields)
2. Ask clarifying questions conversationally (not a form)
3. Never recommend a specific tax structure or business entity type
4. Never give tax or legal advice
5. If asked for legal/tax guidance, respond:
   "I help with LLC formation and data collection. For tax strategy 
   or legal advice, consult a CPA or tax attorney."
6. When you have collected the core business details, you MUST explicitly ask: 
   "Would you like our platform to file this on your behalf, or will you file it yourself?"
7. If the user wants YOU to file on their behalf, you MUST ask for their Email Address so we can follow up with them.

Your tone: Friendly, professional, efficient. Get to the point quickly.

Required Data You Must Collect:
- Business name (verify against user intent)
- State of formation (should match user's state or explicit choice)
- Member names (full legal names)
- Member addresses (complete mailing addresses)
- Ownership percentages (must sum to 100%)
- Principal office address
- Registered agent name (can be a member or external)
- Registered agent address
- Filing Preference ("manual" or "agency")
- User Email Address (ONLY required if Filing Preference is "agency")

After collecting all required data, you MUST generate the JSON payload.
Your JSON must strictly match this exact schema keys so the frontend dashboard can render them:
{
  "businessName": "Exact Name LLC",
  "state": "State Name",
  "principalOfficeAddress": "Full Address",
  "registeredAgentName": "Name of Agent",
  "registeredAgentAddress": "Address of Agent",
  "filingPreference": "agency",
  "clientEmail": "user@example.com",
  "members": [
    { "name": "Member Name", "ownershipPercentage": 100 }
  ]
}

Output ONLY the JSON payload (no explanation) when finished.
`;

export type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export const getAgentResponse = async (messages: Message[]) => {
  // Use recommended "latest aliases" + fallback to older ones just in case
  const preferredModels = [
    process.env.CLAUDE_MODEL, // Optional .env override
    'claude-3-5-sonnet-latest',
    'claude-3-haiku-latest',
    'claude-3-opus-latest',
    'claude-3-7-sonnet-latest',
    'claude-3-5-sonnet-20241022',
    'claude-3-haiku-20240307',
    'claude-2.1'
  ].filter(Boolean) as string[];

  let modelsToTry = preferredModels;

  try {
    const modelsResponse = await (anthropic as any).models.list();
    const available = modelsResponse.data.map((m: any) => m.id);
    const valid = preferredModels.filter(pref => available.includes(pref));
    if (valid.length > 0) {
      modelsToTry = valid.slice(0, 1);
      console.log(`[Claude API] Discovered best model via API check:`, modelsToTry[0]);
    }
  } catch (error) {
    console.warn(`[Claude API] Models endpoint unavailable. Will iterate sequentially through fallbacks: ${modelsToTry.join(', ')}`);
  }

  for (const model of modelsToTry) {
    try {
      console.log(`[Claude API] Attempting to generate with: ${model}`);
      const response = await anthropic.messages.create({
        model: model,
        max_tokens: 2000,
        system: SYSTEM_PROMPT,
        messages: messages.map(m => ({
          role: m.role,
          content: m.content,
        })),
      });

      const content = response.content[0];
      if (content.type === 'text') {
        return content.text;
      }
      return '';
    } catch (error: any) {
      if (error?.status === 404 || error?.message?.includes('not_found_error')) {
        console.warn(`[Claude API] ${model} unavailable (404 Not Found). Attempting next fallback...`);
        continue;
      }
      console.error(`[Claude API] Request failed for model ${model}:`, error);
      throw new Error('Failed to get response from AI agent');
    }
  }

  throw new Error('No available Claude models found. Ensure you have an active Anthropic billing tier.');
};
