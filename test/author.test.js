/**
 * File: autor.test.js
 * Project: z-ali-fc
 * FilePath: /test/autor.test.js
 * Created Date: 2019-01-02 10:11:57
 * Author: Zz
 * -----
 * Last Modified: 2020-07-30 09:12:23
 * Modified By: Zz
 * -----
 * Description:
 */
import test from 'ava'
import { util } from 'zhz-util'
import { fcService } from '../src'
import config from '../src/config'

const role = `${config.serviceName}.author`
const resource = {
  name: Math.random().toString(),
  mobile: '13760471840',
  sex: 'MAN',
}
let id = ''

test.before(async (t) => {
  // await util.delay();
  const response = await fcService.actAsync({
    role,
    cmd: 'create',
  }, {
    params: resource,
  })
  t.is(response.code, 0)
  id = response.data.id
  util.avaTest(t, response.data, resource)
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
  util.avaTest(t, response.data, resource)
})

test.serial(`role: ${role}, cmd: test`, async (t) => {
  const response = await fcService.actAsync({
    role,
    cmd: 'test',
  }, {
    params: {
    },
  })
  t.is(response.code, 0)
})

test.serial(`role: ${role}, cmd: retrieve expand`, async (t) => {
  const response = await fcService.actAsync({
    role,
    cmd: 'retrieve',
  }, {
    params: {
      id,
      expand: 'book',
    },
  })
  t.is(response.code, 0)
  util.avaTest(t, response.data, resource)
})

test.serial(`role: ${role}, cmd: findOne`, async (t) => {
  const response = await fcService.actAsync({
    role,
    cmd: 'findOne',
  }, {
    params: {
      mobile: '13760471840',
    },
  })
  t.is(response.code, 0)
  util.avaTest(t, response.data, resource)
})

test.serial(`role: ${role}, cmd: findOne attributes`, async (t) => {
  const response = await fcService.actAsync({
    role,
    cmd: 'findOne',
  }, {
    params: {
      where: {
        mobile: '13760471840',
      },
      attributes: ['id', 'name'],
    },
  })
  t.is(response.code, 0)
  t.is(response.data.name, resource.name)
  t.is(response.data.sex, undefined)
})

test.serial(`role: ${role}, cmd: listAll attributes`, async (t) => {
  const response = await fcService.actAsync({
    role,
    cmd: 'listAll',
  }, {
    params: {
      where: {
        name: 'Bart',
      },
      attributes: ['id', 'name'],
    },
  })
  t.is(response.code, 0)
  response.data.forEach((item) => {
    t.truthy(item.id, `${item.id}`)
    t.truthy(item.name, item.name)
  })
})

test.serial(`role: ${role}, cmd: findAll attributes`, async (t) => {
  const response = await fcService.actAsync({
    role,
    cmd: 'findAll',
  }, {
    params: {
      where: {
        name: 'Bart',
      },
      attributes: ['id', 'name'],
    },
  })
  t.is(response.code, 0)
  response.data.forEach((item) => {
    t.truthy(item.id, `${item.id}`)
    t.truthy(item.name, item.name)
  })
})

test.serial(`role: ${role}, cmd: findAll`, async (t) => {
  const response = await fcService.actAsync({
    role,
    cmd: 'findAll',
  }, {
    params: {
      name: 'Bart',
    },
  })
  t.is(response.code, 0)
})

test.serial(`role: ${role}, cmd: findByIds`, async (t) => {
  const response = await fcService.actAsync({
    role,
    cmd: 'findByIds',
  }, {
    params: {
      ids: [1],
    },
  })
  t.is(response.code, 0)
  t.is(response.data.length, 1)
  t.is(response.data[0].id, 1)
})

const name = Math.random().toString()
test.serial(`role: ${role}, cmd: update`, async (t) => {
  const response = await fcService.actAsync({
    role,
    cmd: 'update',
  }, {
    params: {
      id,
      name,
    },
  })
  t.is(response.code, 0)
  util.avaTest(t, response.data, resource, { name })
})

test.serial(`role: ${role}, cmd: updateStatus`, async (t) => {
  const response = await fcService.actAsync({
    role,
    cmd: 'updateStatus',
  }, {
    params: {
      id,
      status: 0,
    },
  })
  t.is(response.code, 0)
  util.avaTest(t, response.data, resource, { name, status: 0 })
})

test.serial(`role: ${role}, cmd: list`, async (t) => {
  const response = await fcService.actAsync({
    role,
    cmd: 'list',
  }, {
    params: {

    },
  })
  t.is(response.code, 0)
})

test.serial(`role: ${role}, cmd: count`, async (t) => {
  const response = await fcService.actAsync({
    role,
    cmd: 'count',
  }, {
    params: {

    },
  })
  t.is(response.code, 0)
})

test.serial(`role: ${role}, cmd: list。 range query`, async (t) => {
  const response = await fcService.actAsync({
    role,
    cmd: 'list',
  }, {
    params: {
      createdAt: '[2020-06-01,2020-06-15]',
      // expand: { book: true },
      expand: 'book',
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
