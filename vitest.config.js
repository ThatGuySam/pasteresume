import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

// import astroConfig from './astro.config.mjs'

// https://vitejs.dev/config/
export default defineConfig( {
    // ...astroConfig.vite,
    plugins: [
        tsconfigPaths(),
    ],
} )
