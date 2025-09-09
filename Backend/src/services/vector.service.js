// Import the Pinecone library
const { Pinecone } = require('@pinecone-database/pinecone');
const { mapValues } = require('@pinecone-database/pinecone/dist/pinecone-generated-ts-fetch/db_control');

// Initialize a Pinecone client with your API key
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });


const vectorChatGPTIndex = pc.Index('vector-chatgpt');

async function createMemory({vectors, metadata, messageId}) {
  if (!messageId) {
    throw new Error('A messageId must be provided to create a memory.');
  }
  
  await vectorChatGPTIndex.upsert([{
    id: messageId,
    values: vectors,
    metadata
  }]);
}
async function queryMemory({queryVector, limit = 5, metadata}) {
  try {
    const data = await vectorChatGPTIndex.query({
      vector: queryVector,
      topK: limit,
      filter: metadata ? { metadata } : undefined,
      includeMetadata: true
    });
    
    return data.matches;
  } catch (error) {
    console.error('Vector DB query failed:', error.message);
    return []; // Return empty array if query fails
  }
}

module.exports = {
  createMemory,
  queryMemory
};
