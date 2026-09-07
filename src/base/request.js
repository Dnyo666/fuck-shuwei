const axios = require('axios')
const https = require('https')
const cheerio = require('cheerio')

function shouldPaceRequest(url) {
  return /stdElectCourse!batchOperator/i.test(String(url || ''))
}

function isElectUnavailableHtml(html) {
  const text = String(html || '')
  return /不在选课时间内/.test(text) || (/操作\s*失败/.test(text) && /选课/.test(text))
}

function shouldSkipLoginCheck(url) {
  const path = String(url || '')
  return /login(Ext|Page)?\.action/i.test(path) || /courseTableForStd/i.test(path) || /dataQuery\.action/i.test(path)
}

function isExpiredLoginHtml(html, requestUrl) {
  if (typeof html !== 'string') return false
  if (shouldSkipLoginCheck(requestUrl)) return false
  if (isElectUnavailableHtml(html)) return false
  const $ = cheerio.load(html)
  const text = $('body').text()
  const expired = text.includes('过期') && (text.includes('登录') || /name=["']username["']/.test(html))
  const loginForm = /name=["']username["']/.test(html) && /name=["']password["']/.test(html)
  return expired || loginForm
}

function createRequest({ url, delay, insecureTls }) {
  const instance = axios.create({
    baseURL: url,
    timeout: 20000,
    validateStatus: () => true,
    maxRedirects: 5,
    httpsAgent: insecureTls ? new https.Agent({ rejectUnauthorized: false }) : undefined,
  })

  const delayResponse = (response) => {
    const wait = Number(delay) || 0
    if (wait <= 0) return response
    return new Promise((resolve) => {
      setTimeout(() => resolve(response), wait)
    })
  }

  instance.interceptors.response.use(
    (response) => {
      try {
        const requestUrl = response.config.url || ''
        const html = response.data
        if (isExpiredLoginHtml(html, requestUrl)) {
          return Promise.reject(new Error('检测到登录过期...'))
        }
        if (shouldPaceRequest(requestUrl)) {
          return delayResponse(response)
        }
        return response
      } catch (error) {
        return Promise.reject(error)
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
      return Promise.reject(new Error(`${errMsg} ${error.message}`))
    },
  )

  return instance
}

module.exports = {
  createRequest,
  shouldPaceRequest,
  isElectUnavailableHtml,
  isExpiredLoginHtml,
}
