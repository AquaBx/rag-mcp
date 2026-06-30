import { connect } from "@tursodatabase/database";
import fs from "node:fs";

fs.mkdirSync("./db", { recursive: true });

const SCHEMA = `CREATE TABLE IF NOT EXISTS memories (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    title           TEXT NOT NULL,
    content         TEXT NOT NULL,
    embedding       F8_BLOB(768)
);
CREATE TABLE IF NOT EXISTS api_tokens (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    name            TEXT NOT NULL,
    token           TEXT NOT NULL UNIQUE,
    user_id        TEXT NOT NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`

export const db = await connect("./db/agent.db");
await db.exec("PRAGMA journal_mode=WAL;");
await db.exec(SCHEMA);

import { FeatureExtractionPipeline, pipeline } from '@huggingface/transformers';

const modelName = 'onnx-community/embeddinggemma-300m-ONNX';

let extractor: FeatureExtractionPipeline;

async function getExtractor() {
    if (!extractor) {
        console.log("Downloading")
        extractor = await pipeline('feature-extraction', modelName, { dtype: "q8" });
        console.log("Downloaded")
    }
    return extractor;
}

export async function embedDocument(title: string, content: string): Promise<number[]> {
    const ext = await getExtractor();

    const formattedText = `title: ${title} | text: ${content}`

    const output = await ext(formattedText, {
        pooling: 'mean',
        normalize: true
    });

    return Array.from(output.data) as number[]
}

export async function embedQuery(query: string): Promise<number[]> {
    const ext = await getExtractor();

    const formattedText = `task: Given the following query, retrieve relevant document that reply this query | query: ${query}`

    const output = await ext(formattedText, {
        pooling: 'mean',
        normalize: true
    });

    return Array.from(output.data) as number[]
}