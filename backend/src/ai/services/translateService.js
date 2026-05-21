// Implements the Translate feature.
// Flow: Summary -> Gemini -> Translation
// Note: per requirements, we ONLY translate the generated summary,
// not the entire document.

import { geminiProvider } from "../providers/GeminiProvider.js";
import { buildTranslatePrompt, getSupportedLanguages } from "../prompts/translatePrompt.js";
import { summarizeDocument } from "./summaryService.js";
import { getPageText } from "./documentService.js";

export async function translateContent(languageKey, sessionId, source = 'summary', pageNumber = null) {
  if (!getSupportedLanguages().includes(languageKey)) {
    throw new Error(
      `Unsupported language "${languageKey}". Supported: ${getSupportedLanguages().join(", ")}`
    );
  }

  let textToTranslate = "";

  if (source === 'summary') {
    const summaryObj = await summarizeDocument(sessionId);
    textToTranslate = `${summaryObj.overview}\n\n${summaryObj.summary}`;
  } else if (source === 'page') {
    textToTranslate = getPageText(pageNumber);
    if (!textToTranslate) {
      throw new Error(`Page ${pageNumber} not found or has no readable text.`);
    }
  } else {
    throw new Error(`Unknown translation source: ${source}`);
  }

  const prompt = buildTranslatePrompt(textToTranslate, languageKey);
  const translatedText = await geminiProvider.generateText(prompt);

  return {
    language: languageKey,
    translatedText,
  };
}
