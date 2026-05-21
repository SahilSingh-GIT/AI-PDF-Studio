// Gemini implementation of AIProvider, built on top of LangChain JS.
// If we ever want to switch models (or add a second provider like Ollama),
// only this file (and a new sibling file) need to change.

import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import config from "../../config/env.js";
import { AIProvider } from "./AIProvider.js";

export class GeminiProvider extends AIProvider {
  constructor() {
    super();
    this.model = new ChatGoogleGenerativeAI({
      apiKey: config.gemini.apiKey,
      model: config.gemini.chatModel,
      temperature: 0.3, // a bit of creativity, but mostly factual
    });
  }

  async generateText(prompt) {
    const response = await this.model.invoke(prompt);
    
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
    // We ask the model to only output JSON, then we parse it ourselves.
    // If parsing fails we throw a clear error instead of silently failing.
    const response = await this.model.invoke(prompt);
    
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

// Simple singleton so every service uses the same provider instance.
export const geminiProvider = new GeminiProvider();
