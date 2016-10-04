import TranslatorBot from './TranslatorBot'

const host = 'localhost'
const port = 9000
const log = true

const bot = new TranslatorBot()
bot.init({host, port, log})

console.info('Starting bot...')
