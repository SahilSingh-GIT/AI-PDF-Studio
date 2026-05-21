// Prompt for the Key Insights feature. We ask Gemini to reply with
// JSON only, matching the structure the frontend's KeyInsightsPanel expects.

export function buildKeyInsightsPrompt(documentText) {
  return `Read the document text below and extract key insights.
Reply with ONLY valid JSON (no markdown, no explanation) using this exact shape:

{
  "importantConcepts": [{"title": "Concept Name", "description": "Concept description"}],
  "importantPoints": ["Key point 1", "Key point 2"],
  "commonMistakes": ["Mistake 1", "Mistake 2"],
  "examTips": ["Tip 1", "Tip 2"]
}

If a category does not apply to this document, return an empty array for it.

Document text:
${documentText}

JSON:`;
}
