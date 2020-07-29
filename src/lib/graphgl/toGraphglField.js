/**
 * File: toGraphField.js
 * Project: z-ali-fc
 * FilePath: /src/lib/graphgl/toGraphField.js
 * Created Date: 2020-04-20 14:33:03
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
const util = require('./util')

const zhzUtil = zUtil.util

module.exports = function toGraphglField(dbSchema, typePrefix = '', allowNullDisable = false, graphqlCfg = null) {
  let typeFields = ''
  let fields = '{\n'
  const tmpSchema = {
    createdAt: {
      type: DataTypes.DATE,
    },
    updatedAt: {
      type: DataTypes.DATE,
    },
    id: {
      type: DataTypes.INTEGER,
    },
    ...dbSchema.schema,
  }
  lodash.each(tmpSchema, (v, k) => {
    const obj = {
      modelName: dbSchema.name,
      typePrefix,
      k,
      ...v,
    }
    if (allowNullDisable) {
      obj.allowNull = true
    }
    const tmp = util.toFieldType(obj)
    fields += `  ${k}: ${tmp.type}\n`
    if (tmp.value) {
      typeFields += tmp.value
      typeFields += '\n'
    }
  })
  // 根据graphqlConfig生成字段
  if (graphqlCfg) {
    const tmpFields = graphqlCfg.fields
    if (tmpFields) {
      lodash.each(tmpFields, (v, k) => {
        const tmp = util.toFieldType({
          modelName: dbSchema.name,
          typePrefix,
          k,
          type: v,
        })
        fields += `  ${k}: ${tmp.type}\n`
      })
    }
  }

  fields += '}'

  const typeName = zhzUtil.fistLetterUpper(typePrefix) + zhzUtil.fistLetterUpper(dbSchema.name)

  let str = `\n${typeFields}\ntype ${typeName} ${fields}\n`
  // 构造返回值type
  str = util.jsonToFieldType({
    code: {
      type: 'String|Int',
    },
    message: {
      type: String,
    },
    data: {
      type: typeName,
    },
  }, dbSchema.name, `${typeName}Response`, typePrefix) + str

  str = util.jsonToFieldType({
    code: {
      type: 'String|Int',
    },
    message: {
      type: String,
    },
    data: {
      type: DataTypes.INTEGER,
    },
  }, dbSchema.name, `Count${typeName}Response`, typePrefix) + str

  str = util.jsonToFieldType({
    code: {
      type: 'String|Int',
    },
    message: {
      type: String,
    },
    data: {
      type: `[${typeName}]`,
    },
  }, dbSchema.name, `findAll${typeName}Response`, typePrefix) + str

  str = util.jsonToFieldType({
    code: {
      type: 'String|Int',
    },
    message: {
      type: String,
    },
    data: {
      type: `List${typeName}ResponseData`,
    },
  }, dbSchema.name, `List${typeName}Response`, typePrefix) + str

  str = util.jsonToFieldType({
    items: {
      type: `[${typeName}]`,
    },
    total: {
      type: DataTypes.INTEGER,
    },
    offset: {
      type: DataTypes.INTEGER,
    },
    limit: {
      type: DataTypes.INTEGER,
    },
    page: {
      type: DataTypes.INTEGER,
    },
    pageSize: {
      type: DataTypes.INTEGER,
    },
  }, dbSchema.name, `List${typeName}ResponseData`, typePrefix) + str
  return str
}
