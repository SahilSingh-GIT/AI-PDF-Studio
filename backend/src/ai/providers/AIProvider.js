// This is the "contract" every AI provider must follow.
// Today we only have GeminiProvider, but tomorrow someone could add
// OllamaProvider.js and the rest of the app would not need to change,
// as long as it also implements these two methods.

export class AIProvider {
  // Should return a plain text answer for a given prompt.
  async generateText(prompt) {
    throw new Error("generateText() not implemented");
  }

  // Should return parsed JSON for a prompt that asks the model
  // to reply using JSON only (used for Key Insights).
  async generateJSON(prompt) {
    throw new Error("generateJSON() not implemented");
  }
}
