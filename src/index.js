import TranslatorBot from './TranslatorBot'
const program = require('commander')

let host = process.env.SERVER_HOST || '127.0.0.1'
let port = process.env.SERVER_PORT || 8000

program
  .version('0.1.0', '-v, --version')
  .option('-h, --host <n>', 'specify host (DEFAULT: SERVER_HOST || "127.0.0.1")')
  .option('-p, --port <n>', 'specify port (DEFAULT: SERVER_PORT || 8000)')
  .on('--help', () => {
    console.log(
`  Example:

     $ node server.js -h 192.168.0.1 -p 9000
`)
  })
  .parse(process.argv)

if (program.host) host = program.host
if (program.port) port = program.port
const log = true

const bot = new TranslatorBot()
bot.init({host, port, log})

console.info('Starting bot...')
