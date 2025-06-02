/** @type { import("eslint").Linter.FlatConfig } */
module.exports = {
	root: true,
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:svelte/recommended',
		'prettier'
	],
	parser: '@typescript-eslint/parser',
	plugins: ['@typescript-eslint'],
	parserOptions: {
		sourceType: 'module',
		ecmaVersion: 2020,
		extraFileExtensions: ['.svelte']
	},
	env: {
		browser: true,
		es2017: true,
		node: true
	},
	overrides: [
		{
			files: ['*.svelte', '*.ts'],
			rules: {
				'no-undef': 'off',
				'@typescript-eslint/no-unused-vars': ['warn']
			},
			parser: 'svelte-eslint-parser',
			parserOptions: {
				parser: '@typescript-eslint/parser'
			}
		}
	],
	rules: {
		// Add your rules here
		'no-unused-vars': 'warn', // or 'off' if you want to ignore
		'@typescript-eslint/no-explicit-any': 'off',
		"linebreak-style": ["error", "unix"]
		// Add other rules based on your preferences
	}
};
