import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // shadcn/ui components export both components and variants, which triggers this warning
      // This is intentional design pattern and doesn't affect production builds
      'react-refresh/only-export-components': [
        'warn',
        { allowExportNames: ['badgeVariants', 'buttonVariants', 'buttonGroupVariants', 'navigationMenuTriggerStyle', 'toggleVariants', 'useSidebar', 'useFormField'] },
      ],
    },
  },
])
