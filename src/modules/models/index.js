/**
 * File: sequelizeModels.js
 * Project: z-ali-fc
 * FilePath: /src/modules/models/sequelizeModels.js
 * Created Date: 2020-04-17 09:18:38
 * Author: Zz
 * -----
 * Last Modified: 2020-07-29 22:07:47
 * Modified By: Zz
 * -----
 * Description:
 */
import { Sequelize } from 'sequelize'
import glob from 'glob'
import { verify } from 'z-error'
import { util } from 'zhz-util'
import config from '../../config'

const {
  database,
  mysqlAccount,
  mysqlPassword,
  mysqlHost,
  mysqlPort,
} = config.database.mysql

const sequelize = new Sequelize(database, mysqlAccount, mysqlPassword, {
  dialect: 'mysql',
  host: mysqlHost,
  port: mysqlPort,
  // logging: (msg) => logger.debug(msg),
  // logging: (msg) => console.log(msg),
})

function createModel(tbName, schema, options = {}) {
  if (!tbName || !schema) return null
  return sequelize.define(
    util.toLine(tbName),
    schema,
    {
      freezeTableName: true,
      underscored: true,
      paranoid: true,
      ...options,
      sequelize,
    },
  )
}

const models = {}
const modelArry = []
const many = []
const one = []
const belongOne = []
const belongMany = []

function verifyShipParams(ship) {
  if (ship) {
    let err = null
    if (Array.isArray(ship)) {
      for (const val of ship) {
        verifyShipParams(val)
      }
    } else {
      err = verify(ship, ['model', 'options'])
      if (err) {
        throw err
      }
    }
  }
}

const schemas = glob.sync(`${__dirname}/../services/*/schema.js`)
for (const v of schemas) {
  const tmp = require(v)
  const {
    options, name, schema,
    hasMany, hasOne,
    belongsToOne, belongsToMany,
  } = tmp

  const err = verify(tmp, ['name', 'schema'])
  if (err) {
    throw err
  }

  verifyShipParams(hasMany)
  verifyShipParams(hasOne)
  verifyShipParams(belongsToOne)
  verifyShipParams(belongsToMany)

  const tmpName = options && options.tableName ? options.tableName : name
  models[name] = createModel(tmpName, schema, options)
  modelArry.push(models[name])

  if (hasMany) {
    if (Array.isArray(hasMany)) {
      hasMany.forEach((val) => {
        many.push({
          obj: models[name],
          sub: val.model,
          options: val.options,
        })
      })
    } else {
      many.push({
        obj: models[name],
        sub: hasMany.model,
        options: hasMany.options,
      })
    }
  }

  if (hasOne) {
    if (Array.isArray(hasOne)) {
      hasOne.forEach((val) => {
        one.push({
          obj: models[name],
          sub: val.model,
          options: val.options,
        })
      })
    } else {
      one.push({
        obj: models[name],
        sub: hasOne.model,
        options: hasOne.options,
      })
    }
  }

  if (belongsToOne) {
    if (Array.isArray(belongsToOne)) {
      belongOne.forEach((val) => {
        one.push({
          obj: models[name],
          sub: val.model,
          options: val.options,
        })
      })
    } else {
      belongOne.push({
        obj: models[name],
        sub: belongsToOne.model,
        options: belongsToOne.options,
      })
    }
  }
  if (belongsToMany) {
    if (Array.isArray(belongsToMany)) {
      belongMany.forEach((val) => {
        many.push({
          obj: models[name],
          sub: val.model,
          options: val.options,
        })
      })
    } else {
      belongMany.push({
        obj: models[name],
        sub: belongsToMany.model,
        options: belongsToMany.options,
      })
    }
  }
}

export default models

export {
  many,
  one,
  belongOne,
  belongMany,
  sequelize,
}
