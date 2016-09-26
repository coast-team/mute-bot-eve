import TranslatorBot from './TranslatorBot'
let yandex = require('yandex-translate')(process.env.YANDEX_TRANSLATE_API_KEY)

const host = 'localhost'
const port = 9000
const log = true

const bot = new TranslatorBot({host, port, log})

console.log('Starting bot...')
