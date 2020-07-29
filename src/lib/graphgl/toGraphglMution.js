/**
 * File: toGraphglMution.js
 * Project: z-ali-fc
 * FilePath: /src/lib/graphgl/toGraphglMution.js
 * Created Date: 2020-04-20 16:08:18
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
  create: true, // or { input: {}, output: {} }
  update: true, // or { input: {}, output: {} }
  updateStatus: true, // or { input: {}, output: {} }
  destroy: true, // or { input: {}, output: {} }
}

module.exports = function toGraphglMution(
  dbSchema,
  mution = {},
  typePrefix = '',
) {
  if (!dbSchema) {
    return ''
  }
  let fields = 'type Mutation {\n'
  let tmpTypeName = zhzUtil.fistLetterUpper(typePrefix)
  tmpTypeName += zhzUtil.fistLetterUpper(dbSchema.name)

  lodash.each({
    ...defCmd,
    ...mution,
  }, (v, k) => {
    switch (k) {
      case 'create': case 'update': {
        if (v !== false) {
          let inputType = `${zhzUtil.fistLetterUpper(k)}${tmpTypeName}Input`
          let outputType = `${tmpTypeName}Response`
          if (typeof v === 'object') {
            inputType = util.getTypeName(v.input) || inputType
            fields = util.jsonToFieldType(v.input, dbSchema.name, inputType, typePrefix) + fields

            outputType = util.getTypeName(v.output) || (v.output ? `${zhzUtil.fistLetterUpper(k)}${tmpTypeName}Output` : outputType)
            fields = util.jsonToFieldType(v.output, dbSchema.name, outputType, typePrefix) + fields
          }
          if (k === 'create' && ((typeof v === 'object' && !v.input) || v === true)) {
            fields = util.jsonToFieldType(
              dbSchema.schema,
              dbSchema.name,
              inputType,
              typePrefix,
              false,
            ) + fields
          } else if (k === 'update' && ((typeof v === 'object' && !v.input) || v === true)) {
            fields = util.jsonToFieldType(
              {
                ...dbSchema.schema,
                id: {
                  type: 'String',
                  allowNull: false,
                },
              },
              dbSchema.name,
              inputType,
              typePrefix,
              false,
            ) + fields
          }

          fields += util.formatStr(`${zhzUtil.fistLetterLower(k)}${tmpTypeName}(data: ${inputType}): ${outputType}`)
        }
        break
      }
      case 'destroy': {
        if (v !== false) {
          const outputType = `${tmpTypeName}Response`
          fields += util.formatStr(`${k}${tmpTypeName}(id: String): ${outputType}`)
        }
        break
      }
      case 'updateStatus': {
        if (v !== false) {
          const inputType = util.getTypeName(v.input) || `Update${tmpTypeName}StatusInput`
          const outputType = `${tmpTypeName}Response`
          fields += util.formatStr(`update${tmpTypeName}Status(data: ${inputType}): ${outputType}`)
          if (typeof v === 'object' && v.input) {
            fields = util.jsonToFieldType(v.input, dbSchema.name, inputType, typePrefix) + fields
          } else {
            const input = {
              status: {
                type: `${tmpTypeName}Status`,
                allowNull: false,
              },
              id: {
                type: 'String',
                allowNull: false,
              },
            }
            fields = util.jsonToFieldType(input, dbSchema.name, inputType, typePrefix) + fields
          }
        }
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
