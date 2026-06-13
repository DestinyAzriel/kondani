// vite.config.js
import { defineConfig } from "file:///D:/kondani/vue-project/node_modules/vite/dist/node/index.js";
import vue from "file:///D:/kondani/vue-project/node_modules/@vitejs/plugin-vue/dist/index.mjs";
var vite_config_default = defineConfig({
  plugins: [
    vue()
    // VitePWA({
    //   registerType: 'autoUpdate',
    //   devOptions: {
    //     enabled: true
    //   },
    //   manifest: {
    //     name: 'Kondani',
    //     short_name: 'Kondani',
    //     description: 'Verified Dating for Real Malawians',
    //     theme_color: '#e91e63',
    //     background_color: '#ffffff',
    //     display: 'standalone',
    //     scope: '/',
    //     start_url: '/',
    //     icons: [
    //       {
    //         src: 'icons/icon-192x192.png',
    //         sizes: '192x192',
    //         type: 'image/png'
    //       },
    //       {
    //         src: 'icons/icon-512x512.png',
    //         sizes: '512x512',
    //         type: 'image/png'
    //       }
    //     ]
    //   },
    //   workbox: {
    //     globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
    //     runtimeCaching: [
    //       {
    //         urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
    //         handler: 'NetworkFirst',
    //         options: {
    //           cacheName: 'api-cache',
    //           expiration: {
    //             maxEntries: 50,
    //             maxAgeSeconds: 60 * 60 // 1 hour
    //           }
    //         }
    //       },
    //       {
    //         urlPattern: ({ url }) => url.pathname.startsWith('/avatars/'),
    //         handler: 'CacheFirst',
    //         options: {
    //           cacheName: 'avatar-cache',
    //           expiration: {
    //             maxEntries: 100,
    //             maxAgeSeconds: 7 * 24 * 60 * 60 // 7 days
    //           }
    //         }
    //       }
    //     ]
    //   }
    // })
  ]
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxrb25kYW5pXFxcXHZ1ZS1wcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFxrb25kYW5pXFxcXHZ1ZS1wcm9qZWN0XFxcXHZpdGUuY29uZmlnLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi9rb25kYW5pL3Z1ZS1wcm9qZWN0L3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcbmltcG9ydCB2dWUgZnJvbSAnQHZpdGVqcy9wbHVnaW4tdnVlJ1xuLy8gaW1wb3J0IHsgVml0ZVBXQSB9IGZyb20gJ3ZpdGUtcGx1Z2luLXB3YSdcblxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHBsdWdpbnM6IFtcbiAgICB2dWUoKSxcbiAgICAvLyBWaXRlUFdBKHtcbiAgICAvLyAgIHJlZ2lzdGVyVHlwZTogJ2F1dG9VcGRhdGUnLFxuICAgIC8vICAgZGV2T3B0aW9uczoge1xuICAgIC8vICAgICBlbmFibGVkOiB0cnVlXG4gICAgLy8gICB9LFxuICAgIC8vICAgbWFuaWZlc3Q6IHtcbiAgICAvLyAgICAgbmFtZTogJ0tvbmRhbmknLFxuICAgIC8vICAgICBzaG9ydF9uYW1lOiAnS29uZGFuaScsXG4gICAgLy8gICAgIGRlc2NyaXB0aW9uOiAnVmVyaWZpZWQgRGF0aW5nIGZvciBSZWFsIE1hbGF3aWFucycsXG4gICAgLy8gICAgIHRoZW1lX2NvbG9yOiAnI2U5MWU2MycsXG4gICAgLy8gICAgIGJhY2tncm91bmRfY29sb3I6ICcjZmZmZmZmJyxcbiAgICAvLyAgICAgZGlzcGxheTogJ3N0YW5kYWxvbmUnLFxuICAgIC8vICAgICBzY29wZTogJy8nLFxuICAgIC8vICAgICBzdGFydF91cmw6ICcvJyxcbiAgICAvLyAgICAgaWNvbnM6IFtcbiAgICAvLyAgICAgICB7XG4gICAgLy8gICAgICAgICBzcmM6ICdpY29ucy9pY29uLTE5MngxOTIucG5nJyxcbiAgICAvLyAgICAgICAgIHNpemVzOiAnMTkyeDE5MicsXG4gICAgLy8gICAgICAgICB0eXBlOiAnaW1hZ2UvcG5nJ1xuICAgIC8vICAgICAgIH0sXG4gICAgLy8gICAgICAge1xuICAgIC8vICAgICAgICAgc3JjOiAnaWNvbnMvaWNvbi01MTJ4NTEyLnBuZycsXG4gICAgLy8gICAgICAgICBzaXplczogJzUxMng1MTInLFxuICAgIC8vICAgICAgICAgdHlwZTogJ2ltYWdlL3BuZydcbiAgICAvLyAgICAgICB9XG4gICAgLy8gICAgIF1cbiAgICAvLyAgIH0sXG4gICAgLy8gICB3b3JrYm94OiB7XG4gICAgLy8gICAgIGdsb2JQYXR0ZXJuczogWycqKi8qLntqcyxjc3MsaHRtbCxpY28scG5nLHN2Z30nXSxcbiAgICAvLyAgICAgcnVudGltZUNhY2hpbmc6IFtcbiAgICAvLyAgICAgICB7XG4gICAgLy8gICAgICAgICB1cmxQYXR0ZXJuOiAoeyB1cmwgfSkgPT4gdXJsLnBhdGhuYW1lLnN0YXJ0c1dpdGgoJy9hcGkvJyksXG4gICAgLy8gICAgICAgICBoYW5kbGVyOiAnTmV0d29ya0ZpcnN0JyxcbiAgICAvLyAgICAgICAgIG9wdGlvbnM6IHtcbiAgICAvLyAgICAgICAgICAgY2FjaGVOYW1lOiAnYXBpLWNhY2hlJyxcbiAgICAvLyAgICAgICAgICAgZXhwaXJhdGlvbjoge1xuICAgIC8vICAgICAgICAgICAgIG1heEVudHJpZXM6IDUwLFxuICAgIC8vICAgICAgICAgICAgIG1heEFnZVNlY29uZHM6IDYwICogNjAgLy8gMSBob3VyXG4gICAgLy8gICAgICAgICAgIH1cbiAgICAvLyAgICAgICAgIH1cbiAgICAvLyAgICAgICB9LFxuICAgIC8vICAgICAgIHtcbiAgICAvLyAgICAgICAgIHVybFBhdHRlcm46ICh7IHVybCB9KSA9PiB1cmwucGF0aG5hbWUuc3RhcnRzV2l0aCgnL2F2YXRhcnMvJyksXG4gICAgLy8gICAgICAgICBoYW5kbGVyOiAnQ2FjaGVGaXJzdCcsXG4gICAgLy8gICAgICAgICBvcHRpb25zOiB7XG4gICAgLy8gICAgICAgICAgIGNhY2hlTmFtZTogJ2F2YXRhci1jYWNoZScsXG4gICAgLy8gICAgICAgICAgIGV4cGlyYXRpb246IHtcbiAgICAvLyAgICAgICAgICAgICBtYXhFbnRyaWVzOiAxMDAsXG4gICAgLy8gICAgICAgICAgICAgbWF4QWdlU2Vjb25kczogNyAqIDI0ICogNjAgKiA2MCAvLyA3IGRheXNcbiAgICAvLyAgICAgICAgICAgfVxuICAgIC8vICAgICAgICAgfVxuICAgIC8vICAgICAgIH1cbiAgICAvLyAgICAgXVxuICAgIC8vICAgfVxuICAgIC8vIH0pXG4gIF1cbn0pIl0sCiAgIm1hcHBpbmdzIjogIjtBQUEwUCxTQUFTLG9CQUFvQjtBQUN2UixPQUFPLFNBQVM7QUFJaEIsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUztBQUFBLElBQ1AsSUFBSTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUF3RE47QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
