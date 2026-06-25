import { z } from 'zod';
import type { RequestHandler } from './$types';
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { TokenController } from '$lib/controllers/AuthController';
import { MemoryController, MemorySchema } from '$lib/controllers/MemoryController';

function createServer() {
    const server = new McpServer({ name: 'rage-memex', version: '1.0.0' });

    server.registerTool(
        'update-memory',
        {
            title: 'Update Memory',
            description: 'Change the title and the content of a memory',
            inputSchema: z.object({
                id: z.number(),
                title: z.string(),
                content: z.string(),
            }),
            outputSchema: z.object({}),
        },
        async ({ id, title, content }) => {
            await MemoryController.update(id, title, content)

            const output = {}

            return {
                content: [{ type: 'text', text: JSON.stringify(output) }],
                structuredContent: output,
            };
        }
    );

    server.registerTool(
        'create-memory',
        {
            title: 'Create Memory',
            description: 'Create a memory from the title and the content. Return the id.',
            inputSchema: z.object({
                title: z.string(),
                content: z.string(),
            }),
            outputSchema: z.object({ id: z.number() }),
        },
        async ({ title, content }) => {
            const output = { id: await MemoryController.create(title, content) }

            return {
                content: [{ type: 'text', text: JSON.stringify(output) }],
                structuredContent: output,
            };
        }
    );

    server.registerTool(
        'get-memory',
        {
            title: 'Get Memory',
            description: 'Return a memory from an id',
            inputSchema: z.object({
                id: z.number(),
            }),
            outputSchema: z.object({ result: MemorySchema }),
        },
        async ({ id }) => {
            const output = { result: await MemoryController.getById(id) }

            return {
                content: [{ type: 'text', text: JSON.stringify(output) }],
                structuredContent: output,
            };
        }
    );
    server.registerTool(
        'search-memory',
        {
            title: 'Search',
            description: 'Return memories based on semantic.',
            inputSchema: z.object({
                query: z.string(),
                count: z.number(),
            }),
            outputSchema: z.object({ results: z.array(MemorySchema) }),
        },
        async ({ query, count }) => {

            const output = { results: await MemoryController.search(query, count) }

            return {
                content: [{ type: 'text', text: JSON.stringify(output) }],
                structuredContent: output,
            };
        }
    );
    server.registerTool(
        'delete-memory',
        {
            title: 'Delete a Memory',
            description: 'Delete a memory',
            inputSchema: z.object({
                id: z.number(),
            }),
            outputSchema: z.object({}),
        },
        async ({ id }) => {
            await MemoryController.delete(id)

            const output = {}

            return {
                content: [{ type: 'text', text: JSON.stringify(output) }],
                structuredContent: output,
            };
        }
    );

    return server;
}
async function handleMcpRequest(request: Request): Promise<Response> {
    if (
        ! await TokenController.validate(request.headers.get("Authorization"))
    ) {
        return new Response("Token not valid", { status: 403 })
    }

    const server = createServer();
    const transport = new WebStandardStreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
        enableJsonResponse: true,
    });

    await server.connect(transport);
    const response = await transport.handleRequest(request);
    transport.close();
    server.close();

    return response;
}

export const POST: RequestHandler = ({ request }) => handleMcpRequest(request);
export const DELETE: RequestHandler = ({ request }) => handleMcpRequest(request);
export const GET: RequestHandler = () => new Response(null, { status: 405 });