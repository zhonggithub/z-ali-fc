/**
 * File: service.js
 * Project: z-ali-fc
 * FilePath: /src/modules/services/test/service.js
 * Created Date: 2020-06-30 20:26:07
 * Author: Zz
 * -----
 * Last Modified: 2020-07-30 09:03:37
 * Modified By: Zz
 * -----
 * Description:
 */
import { ServiceBase, util } from 'zhz-util'

import config from '../../../config'

class TestService extends ServiceBase {
  constructor(fcService) {
    // 定义服务前缀
    const resourceName = 'test'
    const role = `${config.serviceName}.${resourceName}`

    super(role, fcService, false)
  }

  didLoadCmd = () => {
    this.addAsync('test', this.test)
  }

  test = async (msg) => util.responseSuccess(msg.params)
}

module.exports = TestService
