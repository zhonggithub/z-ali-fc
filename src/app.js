/**
 * File: app.js
 * Project: z-ali-fc
 * FilePath: /src/app.js
 * Created Date: 2019-06-14 09:52:10
 * Author: Zz
 * -----
 * Last Modified: 2020-07-29 22:14:15
 * Modified By: Zz
 * -----
 * Description:
 */
import _ from 'lodash'
import glob from 'glob'
import bunyan from 'bunyan'
import { setLocal as zsetLocal } from 'z-error'
import { util, RedisCache, setLocal } from 'zhz-util'
import config from './config'
import models, {
  sequelize, many, one,
  belongOne, belongMany,
} from './modules/models'
import { FCService } from './lib'

const logger = bunyan.createLogger({
  name: config.name,
  level: config.logLevel,
})

zsetLocal('zh-cn', `${__dirname}/lib/local`)
setLocal('zh-cn', `${__dirname}/lib/local`)

for (const v of many) {
  v.obj.hasMany(models[v.sub], {
    as: util.fistLetterLower(`${v.sub}s`),
    constraints: false,
    ...v.options,
  })
}
for (const v of one) {
  v.obj.hasOne(models[v.sub], {
    as: util.fistLetterLower(v.sub),
    constraints: false,
    ...v.options,
  })
}
for (const v of belongOne) {
  v.obj.belongsTo(models[v.sub], {
    constraints: false,
    as: util.fistLetterLower(v.sub),
    ...v.options,
  })
}
for (const v of belongMany) {
  v.obj.belongToMany(models[v.sub], {
    constraints: false,
    as: util.fistLetterLower(`${v.sub}s`),
    ...v.options,
  })
}

const cache = new RedisCache(config.cache)

const fcService = new FCService(logger)

const services = glob.sync(`${__dirname}/modules/services/*/Service.js`)
_.each(services, (v) => {
  const ResourceService = require(v)
  const tmp = new ResourceService(fcService, cache)
  tmp.loadCmd()
})
_.each(config.service, (v, k) => {
  if (v) {
    fcService.addRemoteService(k, v)
  }
})

sequelize.sync().then(() => {
  logger.info('模型加载成功')
}).catch((err) => {
  throw err
})

module.exports.handler = (msg, context, callback) => {
  const msgStr = Buffer.from(msg).toString()
  logger.info(`recv the request data: ${msgStr}`)

  try {
    const msgData = JSON.parse(msgStr)
    const { role, cmd, params } = msgData
    fcService.actAsync({
      role,
      cmd,
    }, {
      params,
      context,
    }).then((result) => callback(null, result)).catch(callback)
  } catch (error) {
    callback(error)
  }
}

export {
  fcService,
  cache,
}
