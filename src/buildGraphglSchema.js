/**
 * File: buildGraphglSchema.js
 * Project: z-ali-fc
 * FilePath: /buildGraphglSchema.js
 * Created Date: 2020-04-20 14:46:37
 * Author: Zz
 * -----
 * Last Modified: 2020-07-29 22:07:46
 * Modified By: Zz
 * -----
 * Description:
 */
import glob from 'glob'
import fs from 'fs'
import { toGraphglField, toGraphglMution, toGraphqlQuery } from './lib'

const schemas = glob.sync(`${__dirname}/modules/services/*/schema.js`)
for (const schema of schemas) {
  const tmp = require(schema)
  let graphqlCfg = null
  const graphqlConfigFile = schema.slice(0, schema.length - 9)
  if (fs.existsSync(`${graphqlConfigFile}graphqlCfg.js`)) {
    graphqlCfg = require(`${schema}/../graphqlCfg.js`)
  }

  let str = ''
  str += toGraphglField(tmp, '', true, graphqlCfg)
  str += '\n'

  const resourceName = schema.slice(`${__dirname}/modules/services/`.length - 1, schema.length - 10)

  if (graphqlCfg) {
    str += toGraphglMution(tmp, graphqlCfg.mutation || {})
    str += toGraphqlQuery(tmp, graphqlCfg.query || {})
  } else {
    str += toGraphglMution(tmp)
    str += toGraphqlQuery(tmp)
  }

  // str = `module.exports = \`${str}\`;\n`;
  fs.writeFile(`${__dirname}/../graphql/${resourceName}.gql`, str, 'utf8', (err) => {
    if (err) {
      console.log('创建失败')
    } else {
      console.log('创建成功')
    }
  })
}
