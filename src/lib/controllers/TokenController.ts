import { db } from "$lib/controllers";
import crypto from 'crypto';
import type { DefinedUser } from "./AuthController";

interface Token {
    id: number
    name: string
    token: string
    created_at: Date
}

export class TokenController {
    static async validate(authHeader: string | null): Promise<boolean> {
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return false;
        }
        const token = authHeader.substring(7).trim();
        if (!token) return false;

        try {
            const req = await db.prepare('SELECT COUNT(*) as count FROM api_tokens WHERE token = ?');
            const res = (await req.get(token)) as { count: number };
            return (res?.count ?? 0) > 0;
        } catch (e) {
            console.error('Error validating API token:', e);
            return false;
        }
    }

    static async getFromOwner(owner: DefinedUser): Promise<Token[]> {
        const req = await db.prepare('SELECT id, name, token, created_at FROM api_tokens WHERE user_id = ? ORDER BY id DESC');
        return (await req.all(owner.id))
    }

    static async create(name: string, owner: DefinedUser): Promise<string> {
        const rawToken = 'rage_' + crypto.randomBytes(24).toString('hex');
        const req = await db.prepare('INSERT INTO api_tokens (name, token, user_id) VALUES (?, ?, ?)');
        await req.run(name.trim(), rawToken, owner.id);
        return rawToken
    }

    static async isOwner(id: number, supposedOwner: DefinedUser): Promise<boolean> {
        const reqCheck = await db.prepare('SELECT user_id FROM api_tokens WHERE id = ?');
        const realOwner : { user_id: string } | undefined = (await reqCheck.get(id));
        return realOwner?.user_id === supposedOwner.id;
    }

    static async delete(id: number) {
        const req = await db.prepare('DELETE FROM api_tokens WHERE id = ?');
        await req.run(id);
    }
}
