import prettierPlugin from 'eslint-plugin-prettier'
import prettierConfig from 'eslint-config-prettier'

export default [
  {
    ignores: ['node_modules/', 'dist/'], // 無視するファイル・フォルダ
  },
  {
    languageOptions: {
      ecmaVersion: 'latest', // 最新のECMAScriptを使用
      sourceType: 'module',
    },
    plugins: {
      prettier: prettierPlugin, // prettier プラグインを明示的に追加
    },
    rules: {
      ...prettierConfig.rules, // Prettier のルールを適用
      'prettier/prettier': 'error', // Prettier のフォーマットエラーを強制
      'no-console': 'warn', // console.log() を警告にする
    },
  },
]
