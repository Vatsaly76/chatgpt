// Import the Pinecone library
const { Pinecone } = require('@pinecone-database/pinecone');
const { mapValues } = require('@pinecone-database/pinecone/dist/pinecone-generated-ts-fetch/db_control');

// Initialize a Pinecone client with your API key
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });


const vectorChatGPTIndex = pc.Index('vector-chatgpt');

async function createMemory({vectors, metadata}) {
  await vectorChatGPTIndex.upsert([ {
    id: metadata.id,
    values: vectors,
    metadata: metadata
  } ])
}
async function queryMemory({queryVector, limit = 5, metadata}) {
  const data = await vectorChatGPTIndex.query({
    vector: queryVector,
    top_k: limit,
    filter: metadata ? { metadata } : undefined,
    includeMetadata: true
  });
  return data.matches;
}

module.exports = {
  createMemory,
  queryMemory
};
