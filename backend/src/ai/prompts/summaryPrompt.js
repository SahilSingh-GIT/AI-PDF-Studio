// Prompts used for the map-reduce style summary flow:
// 1. Summarize each chunk on its own (map)
// 2. Combine all the small summaries into one final summary (reduce)

export function buildChunkSummaryPrompt(chunkText) {
  return `Summarize the following section of a document in 3-5 sentences.
Keep the important facts and skip filler words.

Section:
${chunkText}

Summary:`;
}

export function buildFinalSummaryPrompt(chunkSummaries) {
  const combined = chunkSummaries
    .map((s, i) => `${i + 1}. ${s}`)
    .join("\n");

  return `Below are summaries of different sections of the same document,
in order. Combine them into one clear, well-structured overall summary.
Use short paragraphs. Do not just repeat the list, actually merge the ideas.

You MUST reply with ONLY valid JSON (no markdown, no explanation) using exactly this shape:

{
  "overview": "A 1-2 sentence high-level overview of the document",
  "summary": "A detailed 2-3 paragraph summary merging the ideas",
  "mainTopics": ["Topic 1", "Topic 2", "Topic 3"],
  "keyTakeaways": ["Key point 1", "Key point 2", "Key point 3"]
}

Section summaries:
${combined}

JSON:`;
}
