import { z } from 'zod';
import type { RequestHandler } from './$types';
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { TokenController } from '$lib/controllers/TokenController';
import { MemoryController, MemorySchema } from '$lib/controllers/MemoryController';

function createServer() {
    const server = new McpServer({ name: 'rage-memex', version: '1.0.0' });

    server.registerTool(
        'update-memory',
        {
            title: 'Update Memory',
            description: 'Modify an existing memory (title and content) in the database. Call this tool automatically whenever you want to update, edit, or correct a stored memory, fact, user preference, or piece of context. CRITICAL: The content parameter must not exceed 512 tokens (approx. 2000 characters). Summarize or split into multiple memories if the content is longer.',
            inputSchema: z.object({
                id: z.number().describe('The unique ID of the memory to update'),
                title: z.string().describe('A concise and descriptive title summarizing the memory'),
                content: z.string().describe('The updated content of the memory. MUST be 512 tokens or fewer (approx. 2000 characters). Summarize or split if necessary.'),
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
            description: 'Save and persist new information, facts, notes, context, or user preferences in the database. Call this tool automatically whenever you want to remember new information or context for future sessions. CRITICAL: The content parameter must not exceed 512 tokens (approx. 2000 characters). Summarize or split into multiple memories if the content is longer.',
            inputSchema: z.object({
                title: z.string().describe('A concise and descriptive title summarizing the memory'),
                content: z.string().describe('The content of the memory to persist. MUST be 512 tokens or fewer (approx. 2000 characters). Summarize or split if necessary.'),
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
            description: 'Retrieve the title and content of a specific memory by its unique ID.',
            inputSchema: z.object({
                id: z.number().describe('The unique ID of the memory to retrieve'),
            }),
            outputSchema: z.object({ result: MemorySchema.optional().nullable() }),
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
            description: 'Search for saved memories based on semantic similarity. Use this tool to retrieve relevant context or past information when answering user queries.',
            inputSchema: z.object({
                query: z.string().describe('The semantic search query to match against memories'),
                count: z.number().describe('The number of matching memories to return (default is 1, max is 20)'),
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
            description: 'Delete a specific memory by its unique ID.',
            inputSchema: z.object({
                id: z.number().describe('The unique ID of the memory to delete'),
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