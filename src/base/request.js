const axios = require('axios')
const https = require('https')
const cheerio = require('cheerio')

function createRequest({ url, delay, insecureTls }) {
  const instance = axios.create({
    baseURL: url,
    timeout: 20000,
    validateStatus: () => true,
    maxRedirects: 5,
    httpsAgent: insecureTls ? new https.Agent({ rejectUnauthorized: false }) : undefined,
  })

  const delayResponse = (response) => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(response), delay || 0)
    })
  }

  const delayError = (error) => {
    return new Promise((_, reject) => {
      setTimeout(() => reject(error), delay || 0)
    })
  }

  instance.interceptors.response.use(
    (response) => {
      try {
        const requestUrl = response.config.url || ''
        if (/login(Ext|Page)?\.action/i.test(requestUrl) || /courseTableForStd/i.test(requestUrl)) {
          return delayResponse(response)
        }

        const html = response.data
        if (typeof html !== 'string') {
          return delayResponse(response)
        }
        const $ = cheerio.load(html)
        const text = $('body').text()
        const expired = text.includes('过期') && (text.includes('登录') || /name=["']username["']/.test(html))
        const loginForm = /name=["']username["']/.test(html) && /name=["']password["']/.test(html)

        if (expired || loginForm) {
          return delayError(new Error('检测到登录过期...'))
        }

        return delayResponse(response)
      } catch (error) {
        return delayError(error)
      }
    },
    (error) => {
      let errMsg = '请求失败，请稍后重试'
      if (error.code === 'ECONNABORTED') {
        errMsg = '请求超时，请检查网络'
      } else if (error.response) {
        const status = error.response.status
        switch (status) {
          case 400:
            errMsg = '请求参数错误'
            break
          case 401:
            errMsg = '未授权，请登录'
            break
          case 404:
            errMsg = '请求资源不存在'
            break
          case 500:
            errMsg = '服务器内部错误'
            break
          default:
            errMsg = `请求失败（状态码：${status}）`
        }
      } else if (error.request) {
        errMsg = '网络错误，请检查地址是否正确'
      }
      return delayError(new Error(`${errMsg} ${error.message}`))
    },
  )

  return instance
}

module.exports = { createRequest }
