import terser from '@rollup/plugin-terser';
import resolve from '@rollup/plugin-node-resolve';
import { babel } from '@rollup/plugin-babel';

export default {
    plugins: [
        resolve(),
        babel({
            babelHelpers: 'bundled',
            presets: ['@babel/preset-env'],
        }),
        terser(),
    ],
};
