import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';

// 1. Initialiser le serveur MCP avec le nom et la version de votre outil
const mcpServer = new Server(
    {
        name: 'mon-super-serveur-sveltekit',
        version: '1.0.0',
    },
    {
        capabilities: {
            tools: {}, // On déclare qu'on va fournir des outils (tools)
        },
    }
);

// 2. Définir un outil (Tool) exemple
mcpServer.setRequestHandler(
    async (request) => {
        if (request.method === 'tools/list') {
            return {
                tools: [
                    {
                        name: 'calculer_carre',
                        description: 'Calcule le carré d un nombre fourni.',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                nombre: { type: 'number', description: 'Le nombre à multiplier par lui-même' },
                            },
                            required: ['nombre'],
                        },
                    },
                ],
            };
        }
        throw new Error('Méthode non trouvée');
    }
);

// 3. Gérer l'exécution de l'outil
mcpServer.setRequestHandler(
    async (request) => {
        if (request.method === 'tools/call') {
            const { name, arguments: args } = request.params;

            if (name === 'calculer_carre') {
                const nombre = args?.nombre;
                if (typeof nombre !== 'number') {
                    throw new Error('Argument invalide');
                }
                
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Le carré de ${nombre} est ${nombre * nombre}.`,
                        },
                    ],
                };
            }
        }
        throw new Error('Outil non trouvé');
    }
);

// Stocker le transport pour l'associer aux requêtes POST de messages
let sseTransport = null;

// ENDPOINT GET : Gère la connexion SSE initiale
export async function GET({ url }) {
    // Initialise le transport SSE en pointant vers l'endpoint qui recevra les messages POST
    sseTransport = new SSEServerTransport(`${url.origin}/api/mcp/messages`);

    // On connecte le serveur MCP au transport SSE
    // (L'exécution est asynchrone, on ne bloque pas la réponse HTTP)
    mcpServer.connect(sseTransport);

    // Retourne la réponse SSE standard attendue par le client MCP
    return new Response(sseTransport.sseResponse.body, {
        headers: sseTransport.sseResponse.headers
    });
}