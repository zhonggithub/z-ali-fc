/**
 * File: util.js
 * Project: z-ali-fc
 * FilePath: /src/lib/graphgl/util.js
 * Created Date: 2020-04-20 16:44:52
 * Author: Zz
 * -----
 * Last Modified: 2020-07-29 22:07:47
 * Modified By: Zz
 * -----
 * Description:
 */
const { DataTypes } = require('sequelize')
const lodash = require('lodash')
const zUtil = require('zhz-util')

const zhzUtil = zUtil.util

function toFieldType({
  modelName, k, type, allowNull, values,
  typePrefix,
}) {
  const tmp = allowNull === false ? '!' : ''
  const ret = {
    type: '',
    value: '',
  }
  switch (type) {
    case DataTypes.STRING: case String: {
      ret.type = `String${tmp}`
      break
    }
    case DataTypes.INTEGER: case DataTypes.TINYINT: case Number: {
      ret.type = `Int${tmp}`
      break
    }
    case DataTypes.FLOAT: {
      ret.type = `Float${tmp}`
      break
    }
    case DataTypes.BOOLEAN: case Boolean: {
      ret.type = `Boolean${tmp}`
      break
    }
    case DataTypes.ENUM: {
      ret.type = `${zhzUtil.fistLetterUpper(typePrefix)}${zhzUtil.fistLetterUpper(modelName)}${zhzUtil.fistLetterUpper(k)}${tmp}`
      ret.value = `enum ${ret.type} {\n  ${values.toString().replace(',', '\n  ')}\n}`
      break
    }
    case DataTypes.DATE: {
      ret.type = `String${tmp}`
      break
    }
    default: {
      if (typeof type === 'string') {
        ret.type = `${type}${tmp}`
      }
    }
  }
  // 解析k, 判断是不是资源id

  return ret
}

function jsonToFieldType(obj, modelName, typeName, typePrefix = '', enumEnable = true, allowNullDisable = false) {
  if (typeof obj !== 'object' || !modelName || !typeName) {
    return ''
  }
  let tmpTypeFields = ''
  let tmpFields = `type ${zhzUtil.fistLetterUpper(typeName)} {\n`
  lodash.each(obj, (vv, kk) => {
    if (Array.isArray(vv)) {
      if (vv.length !== 1) {
        return
      }
      const itemType = `${zhzUtil.fistLetterUpper(typePrefix)}${zhzUtil.fistLetterUpper(typeName)}${zhzUtil.fistLetterUpper(kk)}`
      const tmpStr = this.jsonToFieldType(vv[0], modelName, itemType, typePrefix)
      tmpFields = tmpStr + tmpFields
      tmpFields += `  ${kk}: [${itemType}]\n`
      return
    }
    const tmpObj = {
      modelName,
      typePrefix,
      k: kk,
      ...vv,
    }
    if (allowNullDisable) {
      tmpObj.allowNull = true
    }
    const tmp = toFieldType(tmpObj)
    tmpFields += `  ${kk}: ${tmp.type}\n`
    if (tmp.value && enumEnable) {
      tmpTypeFields += tmp.value
      tmpTypeFields += '\n'
    }
  })
  tmpFields += '}\n'
  return tmpTypeFields + tmpFields
}

function formatStr(str) {
  return `  ${str}\n`
}

function getTypeName(obj) {
  if (!obj) return ''
  const { $typeName } = obj
  delete obj.$typeName
  return $typeName
}

module.exports = {
  formatStr,
  getTypeName,
  toFieldType,
  jsonToFieldType,
}
