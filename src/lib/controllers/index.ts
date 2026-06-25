import { connect } from "@tursodatabase/database";

const SCHEMA = `CREATE TABLE IF NOT EXISTS memories (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    title           TEXT NOT NULL,
    content         TEXT NOT NULL,
    embedding       F8_BLOB(384)
);
CREATE TABLE IF NOT EXISTS api_tokens (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    name            TEXT NOT NULL,
    token           TEXT NOT NULL UNIQUE,
    username        TEXT NOT NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`

export const db = await connect("./db/agent.db");
await db.exec("PRAGMA journal_mode=WAL;");
await db.exec(SCHEMA);

import { pipeline } from '@huggingface/transformers';

const modelName = 'Xenova/all-MiniLM-L6-v2';

let extractor: any = null;

async function getExtractor() {
	if (!extractor) {
		extractor = await pipeline('feature-extraction', modelName);
	}
	return extractor;
}

export async function embed(content: string): Promise<number[]> {
	const ext = await getExtractor();
	const output = await ext(content, { pooling: 'mean', normalize: true });
	const embedding = Array.from(output.data) as number[];

	return embedding
}