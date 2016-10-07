import {BotServer} from 'netflux'
import RealTimeTranslator from './RealTimeTranslator'
const Yandex = require('yandex-translate')(process.env.YANDEX_TRANSLATE_API_KEY)

const Coordinator = require('./node_modules/mute-client/lib/coordinator.js')
const Utils = require('mute-utils')
const EventEmitter = require('events')

class Data {
  constructor (event, data) {
    this.event = event
    this.data = data
  }
}

class TranslatorBot extends EventEmitter {

  constructor() {
    super()
    this.bot = null
    this.coordinator = null
    this.wc = null
  }

  init(options) {
    this.bot = new BotServer(options)
    this.bot.start()
      .then(() => {
        console.info(`Bot is listening at ${ options.host }:${ options.port }`)
      })
      .catch((err) => {
        console.info(`An error occurred while starting the bot: ${ err }`)
      })

    this.bot.onWebChannel = wc => {
      this.wc = wc
      wc.onMessage = (id, msg, isBroadcast) => {
        this.handleMessage(wc, id, msg, isBroadcast)
      }
      wc.replicaNumber = 10000
      wc.username = 'Eve translator'
      const userInfo = {
        peerId : wc.myId,
        replicaNumber : wc.replicaNumber,
        username : wc.username
      }
      wc.send(JSON.stringify(new Data('queryUserInfo', userInfo)))
      wc.sendTo(wc.members[0], JSON.stringify(new Data('joinDoc', wc.myId)))
      wc.send(JSON.stringify(new Data('broadcastCollaboratorUsername', {
        replicaNumber: userInfo.replicaNumber,
        username: userInfo.username
      })))
    }
  }

  handleMessage(wc, id, msg, isBroadcast) {
    const data = JSON.parse(msg)
    switch (data.event) {
      case 'queryUserInfo':
        this.wc.sendTo(id, JSON.stringify(new Data('addUser', {
            peerId : this.wc.myId,
            replicaNumber : this.wc.replicaNumber,
            username : this.wc.username
        })))
        break
      case 'sendDoc':
        data.data.replicaNumber = wc.replicaNumber
        this.coordinator = new Coordinator(data.data.docID)
        this.coordinator.join(data.data)
        this.coordinator.on('update', () => {
          console.info(`this.coordinator.ropes.str: ${ this.coordinator.ropes.str }`)
          this.seekTextToTranslate()
        })
        this.coordinator.on('operations', (operations) => {
          const reply = new Data('sendOps', {
            replicaNumber: wc.replicaNumber,
            logootSOperations: operations
          })
          wc.send(JSON.stringify(reply));
        })

        this.realTimeTranslator = new RealTimeTranslator(this.coordinator)

        break
      case 'sendOps':
        data.data.replicaNumber = wc.replicaNumber
        Utils.pushAll(this.coordinator.bufferLogootSOp, data.data.logootSOperations)
        break
      default:
        // Mandatory for passing the linter =)
    }
  }

  seekTextToTranslate() {
    const regex = /^\/tl$(.|\n)*?^end\/$/gm
    const doc = this.coordinator.ropes.str

    const matches = doc.match(regex)
    if(matches !== null) {
      matches.forEach( match => {
        // Remove the tag delimiting the begin and the end of the section to translate
        // TODO: Set the index according to the length of the tags
        const str = match.substring(3, match.length-5)

        // TODO: Read the target language from the input
        const target = 'en'

        const lines = str.split('\n')
        // Remove the line containing the source and target language
        lines.splice(0, 1)
        const toTranslate = lines.join('\n')

        Yandex.translate(toTranslate, {to: target}, (err, res) => {
          if (res.code === 200) {
            this.addTextOperations(match, res.text)
          } else {
            console.error('Tranlation error: ', err)
          }
        })
      })
    }
  }

  addTextOperations(match, translation) {
    // TODO: Handle case match occurs several time in the document

    const doc = this.coordinator.ropes.str
    const index = doc.indexOf(match)

    const deleteText = {
      'action': 'removeText',
      'index': index,
      'text': match
    }
    this.coordinator.addBufferTextOp(deleteText)

    const insertText = {
      'action': 'insertText',
      'index': index,
      'text': translation
    }
    this.coordinator.addBufferTextOp(insertText)
  }
}

export default TranslatorBot
