// Vercel serverless function entry point
const { parse } = require('url');

// Wait for the server to be built if we're in a Vercel build step
let serverModule = null;
const getServerModule = async () => {
  if (!serverModule) {
    // Dynamic import of the server main.js
    try {
      serverModule = require('../dist/apps/server/main');
    } catch (error) {
      console.error('Failed to load server module:', error);
      return null;
    }
  }
  return serverModule;
};

// Handle all API requests
module.exports = async (req, res) => {
  try {
    // Get the NestJS app module
    const server = await getServerModule();
    
    if (!server || !server.handleRequest) {
      console.error('Server module or handleRequest function not found');
      res.statusCode = 500;
      res.end('Server initialization failed');
      return;
    }

    // Log incoming request
    const { pathname } = parse(req.url);
    console.log(`[Vercel Function] Request: ${req.method} ${pathname}`);
    
    // Forward the request to the NestJS app
    await server.handleRequest(req, res);
  } catch (error) {
    console.error('Error handling request:', error);
    res.statusCode = 500;
    res.end('Internal Server Error');
  }
}; 