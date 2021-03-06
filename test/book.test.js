/**
 * File: book.test.js
 * Project: z-ali-fc
 * FilePath: /test/book.test.js
 * Created Date: 2020-06-29 14:27:18
 * Author: Zz
 * -----
 * Last Modified: 2020-08-05 16:41:34
 * Modified By: Zz
 * -----
 * Description:
 */
import test from 'ava'
import { util } from 'zhz-util'
import { fcService } from '../src'
import config from '../src/config'

const role = `${config.serviceName}.book`
const resource = {
  name: Math.random().toString(),
  authorId: 1,
}
let id = ''

test.before(async (t) => {
  const response = await fcService.actAsync({
    role,
    cmd: 'create',
  }, {
    params: resource,
  })
  t.is(response.code, 0)
  id = response.data.id
  util.avaTest(t, response.data, resource, { status: 'ENABLED' })
})

test.serial(`role: ${role}, cmd: retrieve`, async (t) => {
  const response = await fcService.actAsync({
    role,
    cmd: 'retrieve',
  }, {
    params: {
      id,
    },
  })
  t.is(response.code, 0)
  util.avaTest(t, response.data, resource, { status: 'ENABLED' })
})

test.serial(`role: ${role}, cmd: findAll`, async (t) => {
  const response = await fcService.actAsync({
    role,
    cmd: 'findAll',
  }, {
    params: {
      authorId: 1,
    },
  })
  t.is(response.code, 0)
})

test.after(async (t) => {
  const response = await fcService.actAsync({
    role,
    cmd: 'destroy',
  }, {
    params: {
      id,
    },
  })
  t.is(response.code, 0)
})
