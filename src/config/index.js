/**
 * File: index.js
 * Project: z-ali-fc
 * FilePath: /src/config/index.js
 * Created Date: 2017-01-22 08:59:15
 * Author: Zz
 * -----
 * Last Modified: 2020-07-29 22:07:46
 * Modified By: Zz
 * -----
 * Description:
 */

import Pkg from '../../package.json'
import './env'

const port = process.env.PORT || 3000

const database = process.env.DATABASE || ''
const mysqlAccount = process.env.MYSQL_ACCOUNT || ''
const mysqlPassword = process.env.MYSQL_PASSWORD || ''
const mysqlHost = process.env.MYSQL_HOST || '127.0.0.1'
const mysqlPort = process.env.MYSQL_PORT || 3306

const redisCacheTTL = process.env.REDIS_CACHE_TTL || 60
const redisPrefix = process.env.REDIS_PREFIX || Pkg.name
const redisHost = process.env.REDIS_HOST || '127.0.0.1'
const redisPort = process.env.REDIS_PORT || '6379'
const redisDB = process.env.REDIS_DB || '0'
const redisPassword = process.env.REDIS_PASSWORD || ''

export default {
  name: Pkg.name,
  env: process.env.NODE_ENV,
  port,
  version: Pkg.version,
  serviceName: 'seneca',
  cache: {
    options: {
      host: redisHost,
      port: redisPort,
      db: redisDB,
      password: redisPassword,
      keyPrefix: `${redisPrefix}:cache:`,
    },
    ttl: redisCacheTTL,
  },
  redis: {
    host: redisHost,
    port: redisPort,
    db: redisDB,
    password: redisPassword,
    keyPrefix: `${redisPrefix}:redis:`,
  },
  database: {
    mysql: {
      database,
      mysqlAccount,
      mysqlPassword,
      mysqlHost,
      mysqlPort,
    },
  },
  service: {

  },
}
