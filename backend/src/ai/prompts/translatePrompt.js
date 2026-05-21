// Prompt for translating the generated summary into one of the
// supported languages, including "Roman" (transliterated) variants.

// Maps the language codes the frontend sends to clear instructions for Gemini.
const LANGUAGE_INSTRUCTIONS = {
  hindi: "Translate into Hindi, written in Devanagari script.",
  hindi_roman: "Translate into Hindi, but write it using the Roman/English alphabet (Hinglish style), not Devanagari.",
  kannada: "Translate into Kannada, written in Kannada script.",
  kannada_roman: "Translate into Kannada, but write it using the Roman/English alphabet, not Kannada script.",
  tamil: "Translate into Tamil, written in Tamil script.",
  tamil_roman: "Translate into Tamil, but write it using the Roman/English alphabet, not Tamil script.",
  telugu: "Translate into Telugu, written in Telugu script.",
  telugu_roman: "Translate into Telugu, but write it using the Roman/English alphabet, not Telugu script.",
  bengali: "Translate into Bengali, written in Bengali script.",
  bengali_roman: "Translate into Bengali, but write it using the Roman/English alphabet, not Bengali script.",
  english: "Keep the text in clear, well-written English.",
};

export function getSupportedLanguages() {
  return Object.keys(LANGUAGE_INSTRUCTIONS);
}

export function buildTranslatePrompt(summaryText, languageKey) {
  const instruction = LANGUAGE_INSTRUCTIONS[languageKey];

  if (!instruction) {
    throw new Error(`Unsupported language: ${languageKey}`);
  }

  return `${instruction}
Only return the translated text, nothing else.

Text to translate:
${summaryText}

Translated text:`;
}
