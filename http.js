import axios from 'axios'
import store from '../store/store'
import { Toast } from 'vant'
import router from '../router/router'

//  === baseUrl start === //
let base = ''
let url = window.location.href
if (url.indexOf('info.bjywkd') !== -1) {
  // 正式环境
  base = 'https://info.bjywkd.com'
} else if (url.indexOf('pre.bjywkd') !== -1) {
  // 预发布环境
  base = 'https://pre.bjywkd.com'
} else if (url.indexOf('test.bjywkd') !== -1) {
  // 测试环境
  base = 'https://test.bjywkd.com'
} else {
  // 开发环境
  base = 'https://dev.bjywkd.com'
}
const http = axios.create({
  baseURL: base
})
//  === baseUrl end === //

// === http 拦截器 start === //
http.interceptors.request.use(
  /**
   * http 请求拦截器
   * @param config
   * @returns {AxiosRequestConfig}
   */
  config => {
    const token = store.state.token
    // 判断是否存在token，如果存在的话，则每个http header都加上token
    if (token) config.headers.Authorization = 'Bearer ' + token
    return config
  },
  error => {
    return Promise.reject(error)
  })

http.interceptors.response.use(
  /**
   * http 响应拦截器
   * @param response
   * @returns {any}
   */
  response => {
    // 成功请求到数据
    if (response.status === 200) {
      return response.data
    }
  },
  error => {
    // 响应错误处理(跳转页面的 需要统一拦截处理，其余的可直接反馈错误信息)
    let returnErr = true
    switch (error.response.status) {
      case 401:
        Toast('token过期, 请重新登录')
        setTimeout(() => {
          router.push('/login')
        }, 3000)
        returnErr = false
        break
      case 404:
        Toast('页面走丢了')
        setTimeout(() => {
          router.push('/error')
        }, 2000)
        returnErr = false
        break
      case 500:
        Toast('网络不太好，请稍后再试')
        returnErr = false
        break
      default:
        Toast(error.response.data.message)
        break
    }
    if (returnErr) {
      // 不用跳转页面的都需要把错误信息反馈出去
      return Promise.reject(error.response.data.message)
    } else {
      // 统一拦截的错误（401/404/500）无需在接口catch中再次提示错误信息，反馈信息为空 { message: '' } ，用message是为了模拟其他状态吗时反馈信息也在message字段中）
      // return Promise.reject(new Error({ message: '' }))
      return Promise.reject(error.response.data.message)
    }
    // 返回错误信息
  })
// === http 拦截器 end === //

// === 封装常用http 请求 start === //
function ajaxHttp (url, method, params, headers) {
  let options = {
    headers: headers,
    url: url,
    method: method
  }

  // 参数传递 (method不同，参数传递方式不同)
  if (method === 'GET' || method === 'DELETE') {
    options.params = params
  } else {
    options.data = params
  }

  return http(options).then(res => res)
}

const GET = (url, params) => {
  return ajaxHttp(url, 'GET', params, { 'Content-Type': 'application/json;' })
}

const POST = (url, params) => {
  return ajaxHttp(url, 'POST', params, { 'Content-Type': 'application/json;' })
}

const PUT = (url, params) => {
  return ajaxHttp(url, 'PUT', params, { 'Content-Type': 'application/json;' })
}

const DELETE = (url, params) => {
  return ajaxHttp(url, 'DELETE', params, { 'Content-Type': 'application/json;' })
}

const PATCH = (url, params) => {
  return ajaxHttp(url, 'PATCH', params, { 'Content-Type': 'application/json;' })
}
export {
  base,
  GET,
  POST,
  PUT,
  DELETE,
  PATCH
}
// === 封装常用http 请求 end === //
