import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react'; 
import Sitemap from 'vite-plugin-sitemap';

export default defineConfig({
  plugins: [
    react(),
    Sitemap({
      hostname: 'https://www.ebtest.org',      
      exclude: ['/admin', '/private'],     
      changefreq: 'daily',
      priority: 0.8,
      generateRobotsTxt: true,           
      robots: [
        { userAgent: '*', allow: '/' },
        { userAgent: '*', disallow: ['/admin', '/private'] }
      ]
    })
  ],
  build: {
    outDir: 'dist'
  }
});
