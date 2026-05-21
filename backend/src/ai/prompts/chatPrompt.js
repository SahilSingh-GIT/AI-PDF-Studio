// Builds the prompt used for RAG-based chat answers.

export function buildChatPrompt(question, contextChunks) {
  const context = contextChunks
    .map((chunk, i) => `[Chunk ${i + 1} - Page ${chunk.page}]\n${chunk.text}`)
    .join("\n\n");

  return `You are an assistant helping a user understand a PDF document.
Answer the question using ONLY the context below. If the context does not
contain the answer, say so honestly instead of making things up.

Context:
${context}

Question: ${question}

Answer:`;
}

// Used when similarity is too low and we fall back to a general answer
// instead of forcing an answer from irrelevant context.
export function buildFallbackChatPrompt(question) {
  return `You are a helpful assistant. The user asked a question about a PDF
document, but nothing relevant was found inside the document for this
question. Answer using your general knowledge, and mention that this
answer is not based on the uploaded document.

Question: ${question}

Answer:`;
}
