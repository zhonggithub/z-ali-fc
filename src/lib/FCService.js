/**
 * File: FCService.js
 * Project: z-ali-fc
 * FilePath: /src/lib/FCService.js
 * Created Date: 2020-07-29 16:54:37
 * Author: Zz
 * -----
 * Last Modified: 2020-07-29 22:07:46
 * Modified By: Zz
 * -----
 * Description:
 */
import { util } from 'zhz-util'
import FCClient from '@alicloud/fc2'

export default class FCService {
  constructor(logger) {
    this.services = {}
    this.remote = {}
    this.logger = logger
  }

  addRemoteService(serviceName, options) {
    const { accountId } = options
    delete options.accountId
    this.remote[serviceName] = new FCClient(accountId, options)
  }

  async addAsync({ role, cmd }, fun) {
    if (!this.services[role]) {
      this.services[role] = { [cmd]: fun }
    } else {
      this.services[role][cmd] = fun
    }
  }

  async actAsync({ role, cmd }, msg) {
    const err = util.isValidData({ role, cmd }, ['role', 'cmd'], {
      role: util.notEmptyStr,
      cmd: util.notEmptyStr,
    })
    if (err) {
      throw err
    }
    return this.services[role][cmd](msg)
  }
}
