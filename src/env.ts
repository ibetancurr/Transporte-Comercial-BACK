import { existsSync } from 'node:fs';

// Must run before AppModule imports read database/JWT environment variables.
if (existsSync('.env')) process.loadEnvFile('.env');
