// This script runs before the build in Vercel to set up required environment variables
const fs = require('fs');
const path = require('path');

// Create a .env file with essential vars if it doesn't exist
const envFile = path.join(process.cwd(), '.env');

// Required environment variables for production
const productionEnv = `
# Server Configuration
PORT=3000
PUBLIC_URL=${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://internz-valley.vercel.app'}
NODE_ENV=production
VERCEL=1

# Auth Configuration
ACCESS_TOKEN_SECRET=${process.env.ACCESS_TOKEN_SECRET || 'temp-access-token-secret'}
REFRESH_TOKEN_SECRET=${process.env.REFRESH_TOKEN_SECRET || 'temp-refresh-token-secret'}
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d

# Database Configuration (PostgreSQL for production)
DATABASE_URL=${process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/postgres?schema=public'}

# Storage Configuration 
STORAGE_ENDPOINT=${process.env.STORAGE_ENDPOINT || 'localhost'}
STORAGE_PORT=${process.env.STORAGE_PORT || '9000'}
STORAGE_USE_SSL=${process.env.STORAGE_USE_SSL || 'false'}
STORAGE_ACCESS_KEY=${process.env.STORAGE_ACCESS_KEY || 'minioadmin'}
STORAGE_SECRET_KEY=${process.env.STORAGE_SECRET_KEY || 'minioadmin'}
STORAGE_BUCKET=${process.env.STORAGE_BUCKET || 'internzvalley'}
STORAGE_BUCKET_NAME=${process.env.STORAGE_BUCKET_NAME || 'internzvalley'}
STORAGE_REGION=${process.env.STORAGE_REGION || 'us-east-1'}
STORAGE_URL=${process.env.STORAGE_URL || 'http://localhost:9000/internzvalley'}

# Chrome Browser (for printing)
CHROME_PORT=${process.env.CHROME_PORT || '8080'}
CHROME_TOKEN=${process.env.CHROME_TOKEN || 'chrome-token'}
CHROME_URL=${process.env.CHROME_URL || 'ws://localhost:8080'}
`;

// Write the .env file
fs.writeFileSync(envFile, productionEnv.trim());

console.log('Environment variables set up for Vercel build');

// Exit successfully
process.exit(0); 