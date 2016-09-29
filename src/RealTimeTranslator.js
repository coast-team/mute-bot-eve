class RealTimeTranslator {

  constructor(coordinator) {
    this.coordinator = coordinator
    this.userTag = '/rt'
    this.botTag = '☺'
    this.isTranslating = false

    coordinator.on('update', (data) => {
      const str = coordinator.ropes.str
      if(!this.isTranslating) {
        const index = this.indexOfUserTag(str)
        if(index !== -1) {
          console.log('Found the tag!')
          this.replaceTag(index)
        }
      }
      // TODO: Translate newly inserted text
    })

    coordinator.on('operations', (operations) => {
      if(!this.isTranslating) {
        operations.map( operation => {
          if(this.isInsertingTag(operation)) {
            console.log('Start to translate in real-time')
            this.isTranslating = true
            this.tagID = operation.id

            // TODO: Translate previous text
          }
        })
      }
    })
  }

  indexOfUserTag(str) {
    let index = -1
    const regex = /^\/rt$/mg

    const matches = regex.exec(str)
    if(matches !== null) {
      index = matches.index
    }

    return index
  }

  isInsertingTag(operation) {
    return operation.l === this.botTag
  }

  /**
   * Remove the user tag
   * Insert the bot tag instead
  */
  replaceTag(index) {
    const deleteText = {
      'action': 'removeText',
      'index': index,
      'text': this.userTag
    }
    this.coordinator.addBufferTextOp(deleteText)

    const insertText = {
      'action': 'insertText',
      'index': index,
      'text': this.botTag
    }
    this.coordinator.addBufferTextOp(insertText)
  }
}

export default RealTimeTranslator
