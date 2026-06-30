import { Manifold } from '@kanaries/ml';
import { db, embedDocument, embedQuery } from "$lib/controllers";
import { z } from 'zod';

export const MemorySchema = z.object({
    id: z.number(),
    content: z.string(),
    title: z.string(),
    distance: z.optional(z.number()),
});

export type Memory = z.infer<typeof MemorySchema>;

export class MemoryController {
    static async search(query: string, count: number = 1): Promise<(Memory)[]> {
        const embedding = await embedQuery(query)

        const req = await db.prepare(`SELECT id, content, title, vector_distance_cos(embedding, vector8(?)) AS distance FROM memories WHERE embedding IS NOT NULL ORDER BY distance ASC LIMIT ?;`)
        return await req.all(JSON.stringify(embedding), count)
    }

    static async getById(id: number): Promise<Memory | undefined> {
        const req = await db.prepare(`SELECT id, content, title FROM memories WHERE id = ?`)
        return await req.get(id)
    }

    static async delete(id: number) {
        const req = await db.prepare('DELETE FROM memories WHERE id = ?');
        await req.run(id);
    }

    static async update(id: number, title: string, content: string) {
        const embedding = await embedDocument(title, content)

        const req = await db.prepare(`UPDATE memories SET title = ?, content = ?, embedding = vector8(?) WHERE id = ?`)
        const resp = await req.run(title, content, JSON.stringify(embedding), id)
    }

    static async tsne() {
        const req = await db.prepare(`SELECT id, title, vector_extract(embedding) AS embedding FROM memories`);
        const resp = await req.all();

        if (!resp || resp.length === 0) {
            return [];
        }

        const embeddings: number[][] = resp.map(el =>
            JSON.parse(el.embedding as string)
        );

        const calculatedPerplexity = Math.min(10, Math.max(1, resp.length - 1));

        const tsne = new Manifold.TSNE({
            nComponents: 2,
            perplexity: calculatedPerplexity,
            nIter: 500
        });

        const result = tsne.fitTransform(embeddings);

        return result.map((el, i) => {
            return {
                id: resp[i].id,
                title: resp[i].title,
                coordinates: el
            };
        });
    }

    static async create(title: string, content: string): Promise<number> {
        const embedding = await embedDocument(title, content)

        const req = await db.prepare(`INSERT INTO memories (title, content, embedding) VALUES (?, ?, vector8(?))`)
        const resp = await req.run(title, content, JSON.stringify(embedding))
        const id = resp.lastInsertRowid

        return id;
    }

    static async getAll(): Promise<Memory[]> {
        const req = await db.prepare(`SELECT id, content, title FROM memories`)
        return await req.all()
    }
}