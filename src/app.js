import {Bot} from '../node_modules/netflux/dist/netflux.es2015.js'
let yandex = require('yandex-translate')(process.env.YANDEX_TRANSLATE_API_KEY)
let Coordinator = require('mute-client').Coordinator
let Utils = require('mute-utils')

const bot = new Bot()
const host = 'localhost'
const port = 9000

let coordinator
let str = ''

bot.listen({host, port, log: true})
bot.onWebChannel = wc => {
  wc.onMessage = (id, msg, isBroadcast) => {
    let data = JSON.parse(msg)
    switch (data.event) {
      case 'sendDoc':
        data.data.replicaNumber = wc.replicaNumber
        coordinator = new Coordinator(data.data.docID)
        coordinator.join(data.data)
        str = data.data.ropes.str
        console.log('DATA: ', data)
        console.log('CONTENCT: ' + str)
        break
      case 'sendOps':
        data.data.replicaNumber = wc.replicaNumber
        Utils.pushAll(coordinator.bufferLogootSOp, data.data.logootSOperations)
        console.log('TEXT: ', data.data)
        console.log('NEW: ' + coordinator.ropes.str)
        break
    }
  }
  wc.replicaNumber = 10000
  wc.username = 'Eve translator'
  let userInfo = {
    peerId : wc.myId,
    replicaNumber : wc.replicaNumber,
    username : wc.username
  };
  wc.send(JSON.stringify(new Data('queryUserInfo', userInfo)));
  wc.sendTo(wc.members[0], JSON.stringify(new Data('joinDoc', wc.myId)));
  wc.send(JSON.stringify(new Data('broadcastCollaboratorUsername', {
    replicaNumber: userInfo.replicaNumber,
    username: userInfo.username
  })))
}

class Data {
  constructor (event, data) {
    this.event = event
    this.data = data
  }
}
