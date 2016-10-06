const Yandex = require('yandex-translate')(process.env.YANDEX_TRANSLATE_API_KEY)

const Diff = require('diff')

class RealTimeTranslator {

  constructor(coordinator) {
    this.coordinator = coordinator

    this.userTag = '/rt'
    this.botTag = '☺'

    this.tagID = ''
    this.isTranslating = false

    coordinator.on('update', (data) => {
      const str = coordinator.ropes.str
      if(!this.isTranslating) {
        const index = this.indexOfUserTag(str)
        if(index !== -1) {
          console.info('Found the tag!')
          this.replaceTag(index)
        }
      }
      else {
        const index = coordinator.ropes.search({ id: this.tagID, path: []})
        if(index !== -1) {
          this.generateTranslation(index)
        } else {
          // The tag has been removed
          console.info('Tag removed, stop translating...')
          this.tagID = ''
          this.isTranslating = false
        }
      }
    })

    coordinator.on('operations', (operations) => {
      if(!this.isTranslating) {
        operations.forEach( operation => {
          if(this.isInsertingTag(operation)) {
            console.info('Start to translate in real-time')
            this.isTranslating = true
            this.tagID = operation.id

            const index = coordinator.ropes.search({ id: this.tagID, path: []})
            this.generateTranslation(index)
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

  generateTranslation(index) {
    const str = this.coordinator.ropes.str

    const toTranslate = str.substring(0, index)

    // TODO: Read the target language from the input
    const target = 'en'

    Yandex.translate(toTranslate, {to: target}, (err, res) => {
      if (res.code === 200) {
        this.updateTranslation(res.text)
      } else {
        console.error('Tranlation error: ', err)
      }
    })
  }

  updateTranslation(newTranslation) {
    const str = this.coordinator.ropes.str
    const index = this.coordinator.ropes.search({ id: this.tagID, path: []})

    const oldTranslation = str.substring(index+1)

    // Add '\n' to put translation below the tag
    const diffs = Diff.diffChars(oldTranslation, `\n${newTranslation}`)

    let offset = 1

    diffs.forEach( diff => {
      if(diff.added) {
        const insertText = {
          'action': 'insertText',
          'index': index+offset,
          'text': diff.value
        }
        this.coordinator.addBufferTextOp(insertText)
        offset += diff.count
      } else if (diff.removed) {
        const deleteText = {
          'action': 'removeText',
          'index': index+offset,
          'text': diff.value
        }
        this.coordinator.addBufferTextOp(deleteText)
      } else {
        offset += diff.count
      }
    })
  }

  /**
   * Remove the user tag
   * Insert the bot tag instead
   * @param {number} index : Index of the tag
   * @return {undefined}
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
