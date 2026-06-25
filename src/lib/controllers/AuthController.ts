import { db } from "$lib/controllers";
import crypto from 'crypto';

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

    static async getFromOwner(owner: string): Promise<Token[]> {
        const req = await db.prepare('SELECT id, name, token, created_at FROM api_tokens WHERE username = ? ORDER BY id DESC');
        return (await req.all(owner))
    }

    static async create(name: string, owner: string): Promise<string> {
        const rawToken = 'rage_' + crypto.randomBytes(24).toString('hex');
        const req = await db.prepare('INSERT INTO api_tokens (name, token, username) VALUES (?, ?, ?)');
        await req.run(name.trim(), rawToken, owner);
        return rawToken
    }

    static async isOwner(id: string, supposedOwner: string): Promise<boolean> {
        const reqCheck = await db.prepare('SELECT username FROM api_tokens WHERE id = ?');
        const realOwner = await reqCheck.get(id);
        return supposedOwner === realOwner
    }

    static async delete(id: string) {
        const req = await db.prepare('DELETE FROM api_tokens WHERE id = ?');
        await req.run(id);
    }
}


export class AuthController {
    static async authorizeRequest(event: { locals: { user: any }; request: { headers: { get(name: string): string | null } } }): Promise<boolean> {
        if (event.locals.user) {
            return true;
        }
        const authHeader = event.request.headers.get('Authorization');
        return await TokenController.validate(authHeader);
    }
}