/**
 * File: toGraphqlQuery.js
 * Project: z-ali-fc
 * FilePath: /src/lib/graphgl/toGraphqlQuery.js
 * Created Date: 2020-04-20 20:51:56
 * Author: Zz
 * -----
 * Last Modified: 2020-07-29 22:07:47
 * Modified By: Zz
 * -----
 * Description:
 */
const lodash = require('lodash')
const zUtil = require('zhz-util')
const util = require('./util')

const zhzUtil = zUtil.util

const defCmd = {
  retrieve: true, // or { input: {}, output: {} }
  list: true, // or { input: {}, output: {} }
  count: true, // or { input: {}, output: {} }
  findAll: true, // or { input: {}, output: {} }
  findOne: true, // or { input: {}, output: {} }
}

module.exports = function toGraphqlQuery(
  dbSchema,
  query = {},
  typePrefix = '',
) {
  if (!dbSchema) {
    return ''
  }
  let fields = 'type Query {\n'
  let tmpTypeName = zhzUtil.fistLetterUpper(typePrefix)
  tmpTypeName += zhzUtil.fistLetterUpper(dbSchema.name)

  const { criteria } = query
  delete query.criteria

  const queryTypeObjName = `${tmpTypeName}QueryCriteria`
  const queryTypeObj = criteria ? util.jsonToFieldType(
    criteria,
    dbSchema.name,
    queryTypeObjName,
    typePrefix,
  ) : util.jsonToFieldType({
    ...dbSchema.schema,
  }, dbSchema.name,
  queryTypeObjName,
  typePrefix,
  false,
  true)

  fields = queryTypeObj + fields

  lodash.each({
    ...defCmd,
    ...query,
  }, (v, k) => {
    switch (k) {
      case 'retrieve': {
        if (v !== false) {
          const outputType = `${tmpTypeName}Response`
          fields += util.formatStr(`${zhzUtil.fistLetterLower(k)}${tmpTypeName}(id: String): ${outputType}`)
        }
        break
      }
      case 'findOne': {
        if (v !== false) {
          let inputType = queryTypeObjName
          if (typeof v === 'object' && typeof v.input === 'object') {
            inputType = util.getTypeName(v.input) || `${zhzUtil.fistLetterUpper(k)}${tmpTypeName}Input`

            const input = util.jsonToFieldType(v.input, dbSchema.name, inputType, typePrefix)
            if (input) {
              fields = input + fields
            }
          }
          let outputType = `${tmpTypeName}Response`
          if (typeof v === 'object' && typeof v.output === 'object') {
            outputType = util.getTypeName(v.output) || `${zhzUtil.fistLetterUpper(k)}${tmpTypeName}Output`
            fields = util.jsonToFieldType(v.output, dbSchema.name, outputType, typePrefix) + fields
          }
          fields += util.formatStr(`${zhzUtil.fistLetterLower(k)}${tmpTypeName}(params: ${inputType}): ${outputType}`)
        }
        break
      }
      case 'count': {
        if (v !== false) {
          let inputType = queryTypeObjName
          if (typeof v === 'object' && typeof v.input === 'object') {
            inputType = util.getTypeName(v.input) || `${zhzUtil.fistLetterUpper(k)}${tmpTypeName}Input`

            const input = util.jsonToFieldType(v.input, dbSchema.name, inputType, typePrefix)
            if (input) {
              fields = input + fields
            }
          }
          const outputType = `Count${tmpTypeName}Response`
          fields += util.formatStr(`${k}${tmpTypeName}(params: ${inputType}): ${outputType}`)
        }
        break
      }
      case 'list': {
        if (v !== false) {
          let inputType = queryTypeObjName
          const outputType = `List${tmpTypeName}Response`
          fields += util.formatStr(`${k}${tmpTypeName}(params: ${inputType}): ${outputType}`)
          if (typeof v === 'object' && v.input) {
            inputType = util.getTypeName(v.input) || `${tmpTypeName}StatusInput`
            fields = util.jsonToFieldType(v.input, dbSchema.name, inputType) + fields
          } else {
            const input = {
              status: {
                type: `${tmpTypeName}Status`,
              },
              id: {
                type: 'String',
              },
            }
            fields = util.jsonToFieldType(input, dbSchema.name, inputType, typePrefix) + fields
          }
        }
        break
      }
      case 'findAll': {
        let inputType = queryTypeObjName
        if (typeof v === 'object' && typeof v.input === 'object') {
          inputType = util.getTypeName(v.input) || `${zhzUtil.fistLetterUpper(k)}${tmpTypeName}Input`

          const input = util.jsonToFieldType(v.input, dbSchema.name, inputType, typePrefix)
          if (input) {
            fields = input + fields
          }
        }
        const outputType = `findAll${tmpTypeName}Response`
        fields += util.formatStr(`${k}${tmpTypeName}(params: ${inputType}): ${outputType}`)
        break
      }
      default: {
        let inputType = zhzUtil.fistLetterUpper(`${k}${tmpTypeName}Input`)
        inputType = util.getTypeName(v.input) || inputType
        let outType = zhzUtil.fistLetterUpper(`${k}${tmpTypeName}Output`)
        outType = util.getTypeName(v.output) || outType
        fields += util.formatStr(`${k}(data: ${inputType}): ${outType}`)
        if (typeof v === 'object') {
          if (v.input) {
            fields = util.jsonToFieldType(v.input, dbSchema.name, inputType, typePrefix) + fields
          }

          if (v.output) {
            fields = util.jsonToFieldType(v.output, dbSchema.name, outType, typePrefix) + fields
          }
        }
        break
      }
    }
  })
  fields += '}\n'
  return fields
}
