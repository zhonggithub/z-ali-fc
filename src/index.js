/**
 * File: app.js
 * Project: z-ali-fc
 * FilePath: /src/app.js
 * Created Date: 2019-06-14 09:52:10
 * Author: Zz
 * -----
 * Last Modified: 2020-08-06 17:15:01
 * Modified By: Zz
 * -----
 * Description:
 */
import lodash from 'lodash'
import glob from 'glob'
import bunyan from 'bunyan'
import { setLocal as zsetLocal } from 'z-error'
import {
  util, RedisCache, setLocal, FCService,
} from 'zhz-util'
import config from './config'
import models, {
  sequelize, many, one,
  belongOne, belongMany,
} from './modules/models'

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

const logger = bunyan.createLogger({
  name: config.name,
  level: config.logLevel,
})
const cache = new RedisCache(config.cache)
const fcService = new FCService(logger)

if (!module.parent) {
  exports.my_initializer = function (context, callback) {
    callback(null, '')
  }
}

sequelize.sync().then(() => {
  logger.info('模型加载成功')
}).catch((err) => {
  logger.error('模型同步失败', err)
  throw err
})

const services = glob.sync(`${__dirname}/modules/services/*/Service.js`)
lodash.each(services, (v) => {
  const ResourceService = require(v)
  const tmp = new ResourceService(fcService, cache)
  tmp.loadCmd()
})
lodash.each(config.service, (v, k) => {
  if (v) {
    fcService.addRemoteService(k, v)
  }
})

module.exports.handler = (event, context, callback) => {
  const eventStr = Buffer.from(event).toString()
  logger.info(`recv the request data: ${eventStr}`)

  try {
    const eventData = JSON.parse(eventStr)
    const { role, cmd, params } = eventData
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
