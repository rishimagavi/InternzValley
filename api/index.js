// Vercel serverless function entry point
const { parse } = require('url');
const path = require('path');
const fs = require('fs');

// Wait for the server to be built if we're in a Vercel build step
let serverModule = null;

/**
 * Attempts to load the server module with better error handling
 */
const getServerModule = async () => {
  if (!serverModule) {
    try {
      // Log the current directory and list available files for debugging
      console.log('Current directory:', process.cwd());
      
      // Try to find the server module in the expected location
      const serverPath = path.join(process.cwd(), 'dist/apps/server/main.js');
      
      if (fs.existsSync(serverPath)) {
        console.log('Server module found at:', serverPath);
        serverModule = require(serverPath);
        
        if (!serverModule || typeof serverModule.handleRequest !== 'function') {
          console.error('Server module loaded but handleRequest function not found');
          console.log('Available exports:', Object.keys(serverModule));
          return null;
        }
      } else {
        console.error('Server module not found at:', serverPath);
        // Try to find where the server module might be
        const distDir = path.join(process.cwd(), 'dist');
        if (fs.existsSync(distDir)) {
          console.log('Contents of dist directory:', fs.readdirSync(distDir));
        }
        return null;
      }
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
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ 
        error: 'Server Initialization Error', 
        message: 'Server module or handleRequest function not found' 
      }));
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
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ 
      error: 'Internal Server Error', 
      message: error.message || 'Unknown error occurred'
    }));
  }
}; 