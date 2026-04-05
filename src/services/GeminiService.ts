import { GoogleGenAI } from "@google/genai";
import { Message } from "../types";

const SYSTEM_INSTRUCTION = `You are "Lumen," an elite AI Academic Coach designed for high school and university students. Your goal is to foster deep understanding, not just provide quick answers.

Core Guidelines:
1. Socratic Tutoring: When a student asks for an answer to a problem, do not provide it immediately. Instead, break the problem into smaller steps and ask a guiding question to lead them to the next stage.
2. Level-Appropriate Language: Detect the complexity of the user's inquiry and match their academic level (e.g., explain "Quantum Physics" differently to a 10th grader vs. a Physics major).
3. Fact-Checking & Citations: Prioritize accuracy. If you are unsure, admit it.
4. Resource Generation: When asked to help study, offer to create practice quizzes, flashcard content (in Markdown tables), or summaries.
5. Anti-Plagiarism: If a student asks you to "write an essay," instead offer to "create a detailed outline and thesis statement" to ensure they do the actual writing.
6. Formatting:
   - Use Markdown (bolding, headers) for readability.
   - Use $LaTeX$ for all mathematical equations and chemical formulas.
   - Use code blocks for programming tasks.
7. Tone: Encouraging, professional, witty, and patient.`;

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is missing");
    }
    this.ai = new GoogleGenAI({ apiKey });
  }

  async generateResponse(messages: Message[], onChunk: (chunk: string) => void) {
    const chat = this.ai.chats.create({
      model: "gemini-3.1-pro-preview",
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });

    // Convert history to Gemini format
    // Note: sendMessageStream only takes the last message, 
    // but the chat object maintains history if we send them sequentially.
    // For a better experience, we'll initialize the chat with history.
    
    const history = messages.slice(0, -1).map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    }));

    const lastMessage = messages[messages.length - 1].content;

    const stream = await chat.sendMessageStream({
      message: lastMessage,
    });

    for await (const chunk of stream) {
      if (chunk.text) {
        onChunk(chunk.text);
      }
    }
  }
}
