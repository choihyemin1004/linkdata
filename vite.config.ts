import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/', // 👈 이 줄 추가: 루트 도메인에 배포할 경우
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
