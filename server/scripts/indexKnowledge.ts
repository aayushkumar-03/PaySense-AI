import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { embedAndStore } from '../services/ragService';
import { knowledgeBase } from '../data/knowledgeBase';

async function indexKnowledge() {
  console.log(`\nPaySense AI — Indexing Financial Knowledge Base`);
  console.log(`================================================`);
  console.log(`Total documents: ${knowledgeBase.length}\n`);

  const docs = knowledgeBase.map((kb, i) => {
    console.log(`Indexing document ${i + 1}/${knowledgeBase.length}: ${kb.title}...`);
    return {
      id: kb.id,
      text: `${kb.title}\n\n${kb.text}`,
      metadata: { title: kb.title, tags: kb.tags.join(',') }
    };
  });

  await embedAndStore(docs);

  console.log(`\n✅ Knowledge base indexed successfully into Pinecone index: ${process.env.PINECONE_INDEX || 'paysense-rag'}`);
  process.exit(0);
}

indexKnowledge().catch(err => {
  console.error('❌ Indexing failed:', err);
  process.exit(1);
});
