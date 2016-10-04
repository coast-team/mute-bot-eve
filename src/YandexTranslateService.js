const request = require('request')

class YandexTranslateService {

  static translate(source, target, toTranslate) {
    return new Promise( (resolve, reject) => {
      const apiURL = 'https://translate.yandex.net/api/v1.5/tr.json/translate'

      const data = {
        key: process.env.YANDEX_TRANSLATE_API_KEY,
        text: toTranslate,
        lang: `${source}-${target}`
      }

      request.post({
        url: apiURL,
        qs: data
      }, (err, httpResponse, body) => {
        if(err) {
          console.error(err)
          reject()
        } else {
          const content = JSON.parse(body)
          resolve(content.text.join(''))
        }
      })
    })
  }

}

export default YandexTranslateService
