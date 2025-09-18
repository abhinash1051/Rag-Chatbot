// backend/src/utils/vectorStore.js

const jinaai = require("jinaai");

const jinaClient = new jinaai({
  apiKey: process.env.JINA_API_KEY,
});

let storedEmbeddings = [];

async function generateEmbedding(text) {
  try {
    const response = await jinaClient.embeddings.create({
      input: text,
      model: "jina-embeddings-v2-base-en"
    });
    return response.data[0].embedding;
  } catch (err) {
    console.error("Error generating embedding:", err);
    return [];
  }
}

async function storeEmbeddings(articles) {
  console.log("🔄 Generating embeddings for news articles...");
  storedEmbeddings = [];
  for (const article of articles) {
    const embedding = await generateEmbedding(article.content);
    storedEmbeddings.push({
      text: article.content,
      title: article.title,
      embedding,
    });
  }
  console.log(`✅ Stored ${storedEmbeddings.length} articles with embeddings.`);
}

async function retrieveRelevantPassages(query, topK = 3) {
  if (storedEmbeddings.length === 0) {
    console.warn("⚠️ No stored embeddings. Returning empty results.");
    return [];
  }

  const queryEmbedding = await generateEmbedding(query);

  const results = storedEmbeddings.map((item) => {
    const score = cosineSimilarity(queryEmbedding, item.embedding);
    return { ...item, score };
  });

  results.sort((a, b) => b.score - a.score);
  return results.slice(0, topK);
}

function cosineSimilarity(vecA, vecB) {
  if (!vecA.length || !vecB.length) return 0;

  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const normA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const normB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));

  return normA && normB ? dotProduct / (normA * normB) : 0;
}

module.exports = { storeEmbeddings, retrieveRelevantPassages };
