import { Pinecone } from '@pinecone-database/pinecone';

// Lazy-initialize so missing keys don't crash the server on startup
let pineconeClient: Pinecone | null = null;
const INDEX_NAME = process.env.PINECONE_INDEX || 'paysense-rag';

function getPineconeClient(): Pinecone | null {
  if (!process.env.PINECONE_API_KEY) return null;
  if (!pineconeClient) {
    pineconeClient = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
  }
  return pineconeClient;
}

async function getEmbedding(text: string): Promise<number[] | null> {
  const client = getPineconeClient();
  if (!client) return null;

  try {
    const response = await client.inference.embed(
      'multilingual-e5-large',
      [text],
      { inputType: 'query' }
    );
    const embedding = response.data[0];
    return 'values' in embedding ? (embedding.values as number[]) : null;
  } catch (err) {
    console.error('Embedding error:', err);
    return null;
  }
}

export async function embedAndStore(
  documents: Array<{ id: string; text: string; metadata: object }>
): Promise<void> {
  const client = getPineconeClient();
  if (!client) {
    console.warn('Pinecone not configured — skipping indexing');
    return;
  }

  const index = client.index(INDEX_NAME);
  const BATCH_SIZE = 10;

  for (let i = 0; i < documents.length; i += BATCH_SIZE) {
    const batch = documents.slice(i, i + BATCH_SIZE);
    const vectors = [];

    for (const doc of batch) {
      const values = await getEmbedding(doc.text);
      if (!values) continue;
      vectors.push({
        id: doc.id,
        values,
        metadata: { ...doc.metadata, text: doc.text }
      });
    }

    if (vectors.length > 0) {
      await index.upsert(vectors);
      console.log(`Upserted batch ${Math.floor(i / BATCH_SIZE) + 1}`);
    }
  }
}

export async function retrieveRelevantContext(
  query: string,
  topK: number = 4
): Promise<string> {
  const client = getPineconeClient();
  if (!client) return '';

  try {
    const queryEmbedding = await getEmbedding(query);
    if (!queryEmbedding) return '';

    const index = client.index(INDEX_NAME);
    const results = await index.query({
      vector: queryEmbedding,
      topK,
      includeMetadata: true
    });

    const relevant = results.matches
      .filter(m => (m.score ?? 0) > 0.7)
      .map(m => m.metadata?.text as string)
      .filter(Boolean);

    if (relevant.length === 0) return '';

    return relevant.join('\n\n---\n\n');
  } catch (err) {
    console.error('RAG retrieval error — falling back gracefully:', err);
    return ''; // Graceful fallback — AI still works without RAG
  }
}
