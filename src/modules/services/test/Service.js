/**
 * File: service.js
 * Project: z-ali-fc
 * FilePath: /src/modules/services/test/service.js
 * Created Date: 2020-06-30 20:26:07
 * Author: Zz
 * -----
 * Last Modified: 2020-07-29 22:07:46
 * Modified By: Zz
 * -----
 * Description:
 */
import { ServiceBase, util } from 'zhz-util'

import config from '../../../config'

class TestService extends ServiceBase {
  constructor(seneca) {
    // 定义服务前缀
    const resourceName = 'test'
    const role = `${config.serviceName}.${resourceName}`

    super(role, seneca, false)
  }

  didLoadCmd = () => {
    this.addAsync('test', this.test)
  }

  test = async (msg) => util.responseSuccess(msg.params)
}

module.exports = TestService
