import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';

import path, { dirname } from 'path'
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


export default defineConfig({
  plugins: [react()],
  server: {
    https: {
      key: fs.readFileSync(path.resolve(__dirname, '../backend/utils/cert/key.pem')),
      cert: fs.readFileSync(path.resolve(__dirname, '../backend/utils/cert/cert.pem')),
    },
    port: 5173,
  },
});
