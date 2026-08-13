// Gemini implementation of AIProvider, built on top of LangChain JS.
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import config from "../../config/env.js";
import { AIProvider } from "./AIProvider.js";
import logger from "../../utils/logger.js";

export class GeminiProvider extends AIProvider {
  getModel() {
    const apiKey = process.env.GEMINI_API_KEY || config.gemini.apiKey;
    if (!apiKey) {
      logger.error('[GeminiProvider] GEMINI_API_KEY is missing');
      throw new Error("GEMINI_API_KEY environment variable is not configured. Please set GEMINI_API_KEY in your server environment settings.");
    }

    if (!this._model || this._apiKey !== apiKey) {
      this._apiKey = apiKey;
      this._model = new ChatGoogleGenerativeAI({
        apiKey,
        model: config.gemini.chatModel || 'gemini-1.5-flash',
        temperature: 0.3,
      });
    }
    return this._model;
  }

  async generateText(prompt) {
    const model = this.getModel();
    const response = await model.invoke(prompt);
    
    let text = response.content;
    if (Array.isArray(text)) {
      text = text
        .filter(part => part.type === 'text' || typeof part === 'string')
        .map(part => typeof part === 'string' ? part : part.text)
        .join('\n');
    }
    
    return text;
  }

  async generateJSON(prompt) {
    const model = this.getModel();
    const response = await model.invoke(prompt);
    
    let rawText = response.content;
    if (Array.isArray(rawText)) {
      rawText = rawText
        .filter(part => part.type === 'text' || typeof part === 'string')
        .map(part => typeof part === 'string' ? part : part.text)
        .join('\n');
    }

    const cleaned = rawText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    try {
      return JSON.parse(cleaned);
    } catch (err) {
      throw new Error(
        `Gemini did not return valid JSON. Raw response: ${rawText}`
      );
    }
  }
}

export const geminiProvider = new GeminiProvider();

