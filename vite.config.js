import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), { name: 'reco-local-api', configureServer(server) {
      Object.assign(process.env, Object.fromEntries(Object.entries(env).filter(([key]) => !key.startsWith('VITE_'))));
      server.middlewares.use('/api', async (req, res) => {
        const { default: handler } = await server.ssrLoadModule('/server/handler.js');
        req.url = '/api' + req.url;
        await handler(req, res);
      });
    }}]
  };
});
