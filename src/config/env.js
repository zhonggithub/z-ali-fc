/**
 * File: index.js
 * Project: z-ali-fc
 * FilePath: /env/index.js
 * Created Date: 2020-04-17 13:25:34
 * Author: Zz
 * -----
 * Last Modified: 2020-07-29 22:07:46
 * Modified By: Zz
 * -----
 * Description:
 */

import dotenv from 'dotenv'
import path from 'path'

const evnDir = `${__dirname}/../../env`
switch (process.env.NODE_ENV) {
  case 'development': {
    dotenv.config({
      path: path.resolve(`${evnDir}/.env`),
    })
    break
  }
  case 'test': {
    dotenv.config({
      path: path.resolve(`${evnDir}/.test_env`),
    })
    break
  }
  default:
}
