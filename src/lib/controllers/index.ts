import { connect } from "@tursodatabase/database";
import fs from "node:fs";

fs.mkdirSync("./db", { recursive: true });

const SCHEMA = `CREATE TABLE IF NOT EXISTS memories (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    title           TEXT NOT NULL,
    content         TEXT NOT NULL,
    embedding       F8_BLOB(1024)
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

const modelName = 'onnx-community/Qwen3-Embedding-0.6B-ONNX';

let extractor: FeatureExtractionPipeline;

async function getExtractor() {
    if (!extractor) {
        console.log("Downloading")
        extractor = await pipeline('feature-extraction', modelName, { dtype: "q8" });
        console.log("Downloaded")
    }
    return extractor;
}

export async function embed(content: string, type: "query" | "document"): Promise<number[]> {
    const ext = await getExtractor();

    let formattedText : string
    if (type === "query"){
        formattedText = `Instruct: Given the following query, retrieve relevant document that reply this query\nQuery:${content}`
    }
    else {
        formattedText = content
    }

    const output = await ext(formattedText, {
        pooling: 'last_token',
        normalize: true
    });

    return Array.from(output.data) as number[]
}