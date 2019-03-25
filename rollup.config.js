import resolve from 'rollup-plugin-node-resolve';

export default {
	input: 'src/main.js',
	output: {
		file: 'public/bundle.js',
    format: 'esm',
    globals: {
      neverland: "hookable"
    },
		sourcemap: true
	},
	plugins: [
		resolve()
	]
};
