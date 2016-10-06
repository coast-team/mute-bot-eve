import nodeResolve from 'rollup-plugin-node-resolve'

export default {
  entry: 'src/index.js',
  dest: 'server.js',
  format: 'cjs',
  plugins: [
    nodeResolve({
      jsnext: true
    })
  ]
}
