const fs = require('fs')
const dotenv = require("dotenv")
dotenv.config()
function writeFile(str, fileName) {
  // 去除最后一个逗号
  // var r = /,+$/;
  // str = str.replace(/,([^,]*?)$/g, `$1`)
  // console.log(fileName)
  fs.writeFile(
    `./src/api/${fileName}.js`,
    str,
    err => {
      if (err) throw err
      // console.log('写入完成')
    }
  )
}

const axios = require("axios")
// const host = process.env.NODE_ENV === 'production' ? process.env.VUE_APP_API_BASE_URL : 'http://61.143.60.85:8085/'
const host = 'http://61.143.60.85:8085/'
// console.log(process.env)
// console.log(process.env.NODE_ENV)
// console.log(process.env.VUE_APP_API_BASE_URL)
// console.log(process.env.VUE_APP_DEV_URL)
const services = [
  { basePath: 'evidenceweb', rap2MockId: '301520' },
  { basePath: 'upms', rap2MockId: '303323' },
  // { basePath: 'auth', rap2MockId: '303322' },
]

for (let index = 0; index < services.length; index++) {
  axios({
    method: 'get',
    url: `${host}${services[index].basePath}/v2/api-docs`,
    headers: { 'Authorization': 'Basic dGVzdDp0ZXN0MTIz' },
  })
    .then(function (res) {
      // console.log(res.data)
      if (res.status === 200) {
        const openApi = res.data
        const apis = res.data.paths
        let str = ''
        // console.log(openApi.basePath)
        str += `/** \n`
        str += `* ${openApi.info.title} \n`
        str += `* ${openApi.info.version} \n`
        str += `* ${openApi.info.description} \n`
        str += `* basePath: '${openApi.basePath}' \n`
        str += `*/ \n`
        str += `\n`
        str += `import request from '@/utils/request'\n`
        str += `let prefix = '${openApi.basePath}'\n`
        str += `// prefix = 'http://rap2api.taobao.org/app/mock/${services[index].rap2MockId}' //api前缀,mock地址, 后端api联调或正式环境注释掉\n`
        // str += `export default api \n`
        for (let i in apis) {
          const api = apis[i]
          let path = i
          let url = i.replace('{', '${parameters.')
          for (let j in api) {
            let funNames = path.split('/')
            for(let k = 0; k< funNames.length;k++){
              if(funNames[k] === ''){
                funNames.splice(k,1)
              }
              if(funNames[k] === 'v1'){
                funNames.splice(k,1)
              }
            }
            console.log(funNames)
            let funName = ''
            str += `/** \n`
            str += `* ${api[j].summary}\n`
            str += `* 地址: ${i}\n`
            str += `* 类型: ${j}\n`
            str += `*/ \n`
            funName += `${j}`
            for (let n = 0; n < funNames.length; n++) {
              if (funNames[n].indexOf('{') == -1) {
                funName += `${funNames[n].slice(0, 1).toUpperCase()}${funNames[n].slice(1).toLowerCase()}`
              } else {
                // let s = funNames[n].replace('{', '${parameters.')
                let a = funNames[n].replace(/\{|}/g, '')
                funName += `By${a.slice(0, 1).toUpperCase()}${a.slice(1)}`
              }
            }
            str += `export function ${funName}(parameters) {\n`
            str += `  return request({\n`
            str += `    url: \`\${prefix}${url}\`,\n`
            str += `    method: '${j.toUpperCase()}',\n`
            if (j === 'get') {
              str += `    params: parameters,\n`
            }
            if (j === 'post' || j === 'put' || j === 'delete') {
              str += `    data: parameters,\n`
            }
            str += `  })\n`
            str += `}\n\n`
          }
        }
        // console.log(`\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n`)
        // console.log(`================================================================`)
        // console.log(str)
        writeFile(str, openApi.basePath)
      }
    });
}