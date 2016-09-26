import {Bot} from 'netflux'

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
        })
        break
      case 'sendOps':
        data.data.replicaNumber = wc.replicaNumber
        Utils.pushAll(this.coordinator.bufferLogootSOp, data.data.logootSOperations)
        break
    }
  }
}

class Data {
  constructor (event, data) {
    this.event = event
    this.data = data
  }
}

export default TranslatorBot