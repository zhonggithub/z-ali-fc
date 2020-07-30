/**
 * File: test.test.js
 * Project: z-ali-fc
 * FilePath: /test/test.test.js
 * Created Date: 2020-06-30 20:29:40
 * Author: Zz
 * -----
 * Last Modified: 2020-07-30 09:12:31
 * Modified By: Zz
 * -----
 * Description:
 */
import test from 'ava'
import { util } from 'zhz-util'
import { fcService } from '../src'
import config from '../src/config'

const role = `${config.serviceName}.test`

test.serial(`role: ${role}, cmd: test`, async (t) => {
  const response = await fcService.actAsync({
    role,
    cmd: 'test',
  }, {
    params: {
      id: 'aaa',
    },
  })
  t.is(response.code, 0)
  util.avaTest(t, response.data, { id: 'aaa' })
})
