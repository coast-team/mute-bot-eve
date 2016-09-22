import nodeResolve from 'rollup-plugin-node-resolve'

export default {
  entry: 'src/app.js',
  dest: 'app.js',
  format: 'cjs',
  plugins: [
    nodeResolve({
      jsnext: true
    })
  ]
}
