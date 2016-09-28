import {Bot} from 'netflux'
import YandexTranslateService from './YandexTranslateService'

const Coordinator = require('mute-client').Coordinator
const Utils = require('mute-utils')
const EventEmitter = require('events')

class TranslatorBot extends EventEmitter {

  constructor(options) {
    super()
    this.bot = new Bot()
    this.initBot(options)
    this.coordinator = null
    this.wc = null
  }

  initBot(options) {
    this.bot.listen(options)
      .then((toto) => {
        console.log(`Bot is listening at ${ options.host }:${ options.port }`)
      })
      .catch((err) => {
        console.log(`An error occurred while starting the bot: ${ err }`)
      })

    this.bot.onWebChannel = wc => {
      this.wc = wc
      wc.onMessage = (id, msg, isBroadcast) => {
        this.handleMessage(wc, id, msg, isBroadcast)
      }
      wc.replicaNumber = 10000
      wc.username = 'Eve translator'
      let userInfo = {
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
    let data = JSON.parse(msg)
    switch (data.event) {
      case 'sendDoc':
        data.data.replicaNumber = wc.replicaNumber
        this.coordinator = new Coordinator(data.data.docID)
        this.coordinator.join(data.data)
        this.coordinator.on('update', (data) => {
          // TODO: Plug the translate method here
          console.log(`this.coordinator.ropes.str: ${ this.coordinator.ropes.str }`)
          this.seekTextToTranslate()
        })
        break
      case 'sendOps':
        data.data.replicaNumber = wc.replicaNumber
        Utils.pushAll(this.coordinator.bufferLogootSOp, data.data.logootSOperations)
        break
    }
  }

  seekTextToTranslate() {
    const regex = /^\/tl$(.|\n)*?^end\/$/gm
    const doc = this.coordinator.ropes.str

    const matches = doc.match(regex)
    if(matches !== null) {
      matches.map( match => {
        // Remove the tag delimiting the begin and the end of the section to translate
        // TODO: Set the index according to the length of the tags
        const str = match.substring(3, match.length-5)

        // TODO: Read the source language from the input
        const source = 'fr'

        // TODO: Read the target language from the input
        const target = 'en'

        const lines = str.split('\n')
        // Remove the line containing the source and target language
        lines.splice(0, 1)
        const toTranslate = lines.join('\n')

        YandexTranslateService.translate(source, target, toTranslate)
          .then( translation => {
            this.addTextOperations(match, translation)
          })
      })
    }
  }

  addTextOperations(match, translation) {
  }
}

class Data {
  constructor (event, data) {
    this.event = event
    this.data = data
  }
}

export default TranslatorBot
