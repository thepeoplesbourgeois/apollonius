import resolve from 'rollup-plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';

export default {
	input: 'src/js/main.js',
	output: {
		file: 'public/bundle.js',
    format: 'esm',
    globals: {
      neverland: "hookable"
    },
		sourcemap: true
	},
	plugins: [
		resolve(),
		terser()
	]
};
