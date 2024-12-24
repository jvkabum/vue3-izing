/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
    'vue/setup-compiler-macros': true
  },
  extends: [
    'plugin:vue/vue3-essential',
    'plugin:vue/vue3-strongly-recommended',
    'plugin:vue/vue3-recommended',
    'eslint:recommended',
    '@vue/eslint-config-typescript',
    '@vue/eslint-config-prettier/skip-formatting'
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  plugins: ['vue'],
  rules: {
    // Vue
    'vue/script-setup-uses-vars': 'error',
    'vue/no-unused-vars': 'error',
    'vue/component-name-in-template-casing': ['error', 'PascalCase'],
    'vue/component-definition-name-casing': ['error', 'PascalCase'],
    'vue/custom-event-name-casing': ['error', 'kebab-case'],
    'vue/define-macros-order': ['error', {
      order: ['defineProps', 'defineEmits']
    }],
    'vue/html-closing-bracket-newline': ['error', {
      singleline: 'never',
      multiline: 'always'
    }],
    'vue/html-indent': ['error', 2],
    'vue/max-attributes-per-line': ['error', {
      singleline: 3,
      multiline: 1
    }],
    'vue/multi-word-component-names': 'off',
    'vue/no-setup-props-destructure': 'off',
    'vue/no-v-html': 'off',
    'vue/require-default-prop': 'off',
    'vue/require-explicit-emits': 'off',

    // JavaScript/TypeScript
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-unused-vars': ['error', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_'
    }],
    'no-undef': 'error',
    'no-var': 'error',
    'prefer-const': 'error',
    'arrow-body-style': ['error', 'as-needed'],
    'arrow-parens': ['error', 'as-needed'],
    'object-shorthand': ['error', 'always'],
    'prefer-template': 'error',
    'template-curly-spacing': ['error', 'never'],
    'quotes': ['error', 'single', { 
      avoidEscape: true,
      allowTemplateLiterals: true 
    }],
    'semi': ['error', 'never'],
    'comma-dangle': ['error', 'never'],
    'indent': ['error', 2, { 
      SwitchCase: 1,
      ignoredNodes: ['TemplateLiteral'] 
    }],

    // TypeScript
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': ['error', {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_'
    }]
  },
  globals: {
    defineProps: 'readonly',
    defineEmits: 'readonly',
    defineExpose: 'readonly',
    withDefaults: 'readonly'
  }
}
