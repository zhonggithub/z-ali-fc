/**
 * File: buildDoc.js
 * Project: z-ali-fc
 * FilePath: /src/modules/buildDoc.js
 * Created Date: 2020-05-30 23:21:06
 * Author: Zz
 * -----
 * Last Modified: 2020-07-29 22:07:47
 * Modified By: Zz
 * -----
 * Description: api 文档生成
 */
import fs from 'fs'
import path from 'path'
import glob from 'glob'
import lodash from 'lodash'
import { DataTypes } from 'sequelize'
import { util } from 'zhz-util'
import Pkg from '../package.json'

const cfgFile = `${__dirname}/../mkdocs.json`
let mkdocsConfig = {}
if (fs.existsSync(cfgFile)) {
  mkdocsConfig = require(cfgFile)
}

const apiDir = `${process.cwd()}/apidocs`
const apiDoc = `${apiDir}/docs`
if (!fs.existsSync(apiDir)) {
  fs.mkdirSync(apiDir)
  if (!fs.existsSync(apiDoc)) {
    fs.mkdirSync(apiDoc)
  }
}

function createText(title, h) {
  switch (h) {
    case 1: case 'h1': return `# ${title}\r\n`
    case 2: case 'h2': return `## ${title}\r\n`
    case 3: case 'h3': return `### ${title}\r\n`
    case 4: case 'h4': return `#### ${title}\r\n`
    default: return `${title}\r\n`
  }
}

function createTableRow(params, prefix = '') {
  let text = ''
  lodash.each(params, (paramValue, paramKey) => {
    const requireStr = (paramValue.required || (paramValue.allowNull === false)) ? '是' : '否'
    let typeStr = ''
    let tmpCommit = ''

    switch (paramValue.type) {
      case Array: {
        typeStr = 'Array'
        break
      }
      case DataTypes.STRING: case DataTypes.TEXT: case String: {
        typeStr = 'String'
        break
      }
      case DataTypes.INTEGER: case DataTypes.TINYINT: case Number: {
        typeStr = 'Int'
        break
      }
      case DataTypes.FLOAT: {
        typeStr = 'Float'
        break
      }
      case DataTypes.BOOLEAN: case Boolean: {
        typeStr = 'Boolean'
        break
      }
      case DataTypes.DATE: case Date: case 'DateTime': {
        typeStr = 'Date'
        break
      }
      case DataTypes.ENUM: case 'Enum': case 'ENUM': {
        typeStr = `${paramValue.type} ${util.fistLetterUpper(paramKey)}`
        tmpCommit = `可选值: ${paramValue.values.toString().replace(',', ', ')}`
        break
      }
      default: {
        if (Array.isArray(paramValue)) {
          typeStr = 'Array'
          const tmpParamKey = prefix ? `${prefix}.${paramKey}` : paramKey
          const desc = paramValue.desc || paramValue.comment || paramValue.description || ''
          text += `|${tmpParamKey} | ${typeStr} | ${requireStr} | ${desc}${tmpCommit}|\r\n`

          if (typeof paramValue[0] === 'object') {
            text += createTableRow(paramValue[0], paramKey)
          }
          return
        } if (typeof paramValue === 'object' && !paramValue.type) {
          typeStr = 'Object'
          const tmpParamKey = prefix ? `${prefix}.${paramKey}` : paramKey
          const desc = paramValue.desc || paramValue.comment || paramValue.description || ''
          text += `|${tmpParamKey} | ${typeStr} | ${requireStr} | ${desc}${tmpCommit}|\r\n`

          text += createTableRow(paramValue, paramKey)
          return
        }
        typeStr = paramValue.type || paramValue
      }
    }

    const tmpParamKey = prefix ? `${prefix}.${paramKey}` : paramKey
    const desc = paramValue.desc || paramValue.comment || paramValue.description || ''
    text += `|${tmpParamKey} | ${typeStr} | ${requireStr} | ${paramValue.defaultValue || '无'} | ${desc}${tmpCommit}|\r\n`
  })
  return text
}

// type = params || returns || String
function createParamsOrReturnsImp(params, type = 'params', h = 3) {
  if (!params) {
    return ''
  }
  if (typeof params !== 'object') {
    return ''
  }

  let tmpTitle = ''
  let field1Title = '参数'
  switch (type) {
    case 'params': {
      tmpTitle = '参数'
      break
    }
    case 'returns': {
      tmpTitle = '返回值'
      break
    }
    case 'propertys': {
      tmpTitle = '属性'
      field1Title = '属性'
      break
    }
    default: {
      tmpTitle = type
    }
  }

  let text = '\r\n'
  text += createText(tmpTitle, h)
  text += '\r\n'
  text += createText(`|${field1Title}|类型|必填|默认值|描述|`)
  text += createText('|--- | --- | --- | --- | ---|')

  text += createTableRow(params)
  text += '\r\n'
  return text
}

function createParamsOrReturns(params, schema, type = 'params') {
  if (typeof params === 'string' && params === 'schema') {
    return createParamsOrReturnsImp(schema, type)
  } if (typeof params === 'object') {
    return createParamsOrReturnsImp(params, type)
  } if (typeof params === 'boolean') {
    return createParamsOrReturnsImp(schema, type)
  }
  return ''
}

function createApiText(funcType, funcName, params, paramsIsObject = false) {
  let api = ''
  const prefix = funcType || ''
  const apiParamsStr = Object.keys(params).toString().replace(/,/g, ', ')
  if (paramsIsObject) {
    api = `\`${prefix} ${funcName} ({ ${apiParamsStr} })\``
  } else {
    api = `\`${prefix} ${funcName} (${apiParamsStr})\``
  }

  let text = createText(api)
  text += '\r\n'
  return text
}

if (mkdocsConfig && mkdocsConfig.apiCfgFilePath) {
  const pages = []
  // 生成index.md
  let indexText = createText('API约束', 1)
  indexText += createText('api的入参和出参统一采用json格式。')
  indexText += createText('`services`里面对表的操作的统一公布`create`，`retrieve`，`delete`，`update`，`updateStatus`，`list`，`count`，`treeList`，`listAll`这些基本api。不根据每一个业务需求去公布一个api比如以userId去统计订单数量统一在`count`api实现。除非是一些复杂性的业务相关的需求需要单独提供api，例如统计在某场景购买品类商品的男女比例。每一个api都需要做参数的合法性和有效性的校验。api返回的JSON对象格式如下：')
  indexText += `
  \`\`\`
  {
    code: 0,
    message: '',
    status: 200,
    data: {},
  }\`\`\`
  `

  indexText += createParamsOrReturnsImp({
    code: {
      type: 'Number, String',
      comment: '0表示api调用成功，否则表示失败',
      required: true,
    },
    message: {
      type: String,
      comment: 'code=0为SUCCESS；否则为错误描述',
      required: true,
    },
    data: {
      type: 'Object, Array',
      comment: 'api数据的返回值',
    },
    status: {
      type: Number,
      comment: '为http状态码，兼容restfule api用',
    },
  }, '统一返回值')

  indexText += createText('资源list api格式', 2)
  indexText += createText('* 分页。参数`page`表示获取第几页,默认为`1`。`pageSize`表示获取当前页的数据条.数默认为`10`。')
  indexText += createText('* 排序。支持四种格式：array of `{ field: "", order: "DESC" }`；array of `[field, "DESC"]`；object of `{a: -1("DESC"), b: 1("ASC")}`；`sort=-a,b`。例如按创建时间倒序`-createdAt`。')
  indexText += createText('* 关键字查找。`search` 用于查找需要模糊匹配。例如在商品列表中，当`search=可乐`，我们将搜索商品中名称或品牌为可乐的商品。')
  indexText += createText('* 范围查找。范围查找采用数学的范围表达方式 `[` 表示大于等于；`]` 表示小于等于；`(` 表示大于；`)` 表示小于；`{a,b,c...}`表示`in`查询；`!{a,b,c...}!`表示`not in`查询。例如查找库存数量大于等于100，小于200的商品数量，格式为`depotQty=[100,200)`。时间为`[YYYY-MM-DD HH:mm:ss,YYYY-MM-DD HH:mm:ss]`')
  indexText += createText('* 扩展数据。`expand`拿资源相关的扩展数据时，在expand指明需要获取的扩展数据。例如列表员工数据，此时需要获取部门数据：`expand=depantment`，多个扩展数据使用逗号隔开。')
  indexText += createParamsOrReturnsImp({
    pageSize: {
      type: Number,
      comment: '每页条数',
      defaultValue: 10,
    },
    page: {
      type: Number,
      comment: '当前页数',
      defaultValue: 1,
    },
    limit: {
      type: Number,
      comment: '同pageSize',
      defaultValue: 10,
    },
    offset: {
      type: Number,
      comment: '起始条数',
      defaultValue: 0,
    },
    sort: {
      type: 'Array，Object, String',
      comment: '排序。支持三种格式：array of { field: "", order: "DESC" }；array of [[field, "DESC"]]；object of {a: -1("DESC"), b: 1("ASC")}；sort=-a,b',
    },
    search: {
      type: String,
      comment: '搜索关键字',
    },
    expand: {
      type: String,
      comment: '获取指定子资源数据，多个子资源使用逗号隔开。例如：expand=a,b',
    },
  }, 'list api 参数')
  indexText += createParamsOrReturnsImp({
    pageSize: {
      type: Number,
      comment: '每页条数',
      required: true,
    },
    page: {
      type: Number,
      comment: '当前页数',
      required: true,
    },
    total: {
      type: Number,
      comment: '符合条件的总数量',
      required: true,
    },
    limit: {
      type: Number,
      comment: '同pageSize',
      required: true,
    },
    offset: {
      type: Number,
      comment: '起始条数',
      required: true,
    },
    items: {
      type: Array,
      comment: '返回数据项',
    },
  }, 'list api 返回值')

  fs.writeFileSync('./apidocs/docs/index.md', indexText)
  pages.push({
    fileName: 'index.md',
    name: '概要',
  })

  // 通过配置文件生成api文档
  const schemas = glob.sync(`${process.cwd()}/${mkdocsConfig.apiCfgFilePath}`)
  schemas.forEach((mkCfgFile) => {
    const filePath = mkCfgFile.slice(0, mkCfgFile.length - path.basename(mkCfgFile).length)
    const schema = `${filePath}schema.js`
    let schemaCfg = {}
    if (fs.existsSync(schema)) {
      schemaCfg = require(schema)
    }

    const mkdocCfg = require(mkCfgFile)

    let text = createText(mkdocCfg.groupName || mkdocCfg.name, 1)
    text += createText(mkdocCfg.description || mkdocCfg.desc)

    lodash.each(mkdocCfg, (v, k) => {
      switch (k) {
        case 'name': case 'description': case 'desc': {
          return
        }
        default:
      }
      text += '\r\n'

      let apiName = createText(k, 2)
      if (v === true) {
        text += apiName
        switch (k) {
          case 'create': {
            // 参数是db字段；返回值是表数据
            text += createApiText('async', k, schemaCfg.schema, true)
            text += createParamsOrReturnsImp(schemaCfg.schema)
            text += createParamsOrReturnsImp(schemaCfg.schema, 'returns')
            break
          }
          case 'retrieve': {
            // 参数是id；返回值是表数据
            text += createText('通过id获取数据详情')
            text += '\r\n'
            text += createApiText('async', k, schemaCfg.schema, true)
            text += createParamsOrReturnsImp({
              id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                comment: 'id',
              },
            })
            text += createParamsOrReturnsImp(schemaCfg.schema, 'returns')
            break
          }
          case 'update': {
            // 参数是id，db字段；返回值是表数据
            text += createText('通过id更新数据')
            text += '\r\n'
            text += createApiText('async', k, schemaCfg.schema, true)
            text += createParamsOrReturnsImp({
              id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                comment: 'id',
              },
              ...schemaCfg.schema,
            })
            text += createParamsOrReturnsImp(schemaCfg.schema, 'returns')
            break
          }
          case 'logicDel': {
            text += createText('通过id软删除数据')
            text += '\r\n'
            text += createApiText('async', k, schemaCfg.schema, true)
            text += createParamsOrReturnsImp({
              id: {
                type: Number,
                comment: 'id',
                allowNull: false,
              },
            })
            break
          }
          case 'destroy': {
            text += createText('通过id硬删除数据')
            text += '\r\n'
            text += createApiText('async', k, schemaCfg.schema, true)
            text += createParamsOrReturnsImp({
              id: {
                type: Number,
                comment: 'id',
                allowNull: false,
              },
            })
            break
          }
          case 'findOne': {
            text += createText('通过id获取数据详情')
            text += '\r\n'
            text += createApiText('async', k, schemaCfg.schema, true)
            text += createParamsOrReturnsImp({
              params: {
                type: Object,
                comment: '查找条件。通常为表字段',
              },
            })
            text += createParamsOrReturnsImp(schemaCfg.schema, 'returns')
            break
          }
          default:
        }
        return
      }

      if (typeof v === 'object') {
        if (v.name) {
          apiName = createText(v.name, 2)
        }
        text += apiName

        // api 形式，例如：async create({ ...data })
        if (v.params) {
          text += createApiText(v.funcType, k, v.params, v.paramsIsObject)
        }

        // api或自定义类型描述
        if (v.description || v.comment || v.desc) {
          text += createText(v.description || v.comment || v.desc)
        }

        // 自定义类型
        if (v.propertys) {
          text += createParamsOrReturns(v.propertys, {}, 'propertys')
        }

        // api参数
        if (v.params) {
          text += createParamsOrReturns(v.params, schemaCfg.schema)
        }

        // api返回值
        if (v.returns) {
          text += createParamsOrReturns(v.returns, schemaCfg.schema, 'returns')
        }
      }
    })
    fs.writeFileSync(`${apiDoc}/${mkdocCfg.name}.md`, text)

    pages.push({
      fileName: `${mkdocCfg.name}.md`,
      name: mkdocCfg.name,
    })
  })

  // 生成配置文件
  const mkdocsYmlJson = {
    site_name: Pkg.name,
    theme: 'readthedocs',
    ...mkdocsConfig.mkdocs,
  }

  let mkdocsYml = ''
  lodash.each(mkdocsYmlJson, (v, k) => {
    mkdocsYml += `${k}: ${v}\r\n`
  })

  if (!fs.existsSync(`${apiDoc}/index.md`)) {
    const indexPage = pages.find((item) => item.fileName === 'index.md')
    if (!indexPage) {
      fs.renameSync(`${apiDoc}/${pages[0].fileName}`, `${apiDoc}/index.md`)
      pages[0].fileName = 'index.md'
    }
  }

  mkdocsYml += 'pages: \r\n'
  pages.forEach((page) => {
    mkdocsYml += `- [${page.fileName}, ${page.name}]\r\n`
  })

  fs.writeFileSync(`${apiDir}/mkdocs.yml`, mkdocsYml)
} else {
  console.error(`${cfgFile} or apiCfgFilePath not exist`)
}
