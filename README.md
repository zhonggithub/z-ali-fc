# z-ali-fc
阿里云函数计算框架，通过sequelize进行模型定义

## Docs

- [util](https://github.com/zhonggithub/zhz-util/blob/master/apidocs/docs/util.md)
- [ServiceBase](https://github.com/zhonggithub/zhz-util/blob/master/apidocs/docs/ServiceBase.md)
- [Service](https://github.com/zhonggithub/zhz-util/blob/master/apidocs/docs/Service.md)
- [ModelBase](https://github.com/zhonggithub/zhz-util/blob/master/apidocs/docs/ModelBase.md)

# Basic Usage

* 在src/modules/services创建文件夹author。author负责作者相关的业务
* 在author文件夹下创建schema.js文件，定义author数据模型model
* 在author文件夹内创建Service.js文件，负责业务实现

```javascipt
import validator from 'validator'
import { ZError } from 'z-error'
import { mysqlSeneca, util } from 'zhz-util'
import models, { sequelize } from '../../models'
import config from '../../../config'
import schema from './schema'

const { Sex } = schema

class AuthorService extends mysqlSeneca.Service {
  constructor(fcService, cache) {
    const resourceName = 'author'
    const role = `${config.serviceName}.${resourceName}`

    super({
      seneca: fcService,
      role,
      model: new mysqlSeneca.SequelizeModel(models.Author),
      cache,
      resourceName,
    })
  }

  isValidDataWhenCreate(data) {
    return util.isValidData(data, ['name', 'mobile', 'sex'], {
      name: (val) => util.notEmptyStr(val),
      mobile: (val) => validator.isMobilePhone(val, 'zh-CN'),
      sex: (val) => util.isValueOf(val, Sex),
    })
  }

  // async db2logic(item) {
  //   if (!item) {
  //     return null;
  //   }
  //   const books = await item.getBooks();
  //   const ret = item.toJSON ? item.toJSON() : item;
  //   ret.books = books.map((book) => book.toJSON());
  //   return ret;
  // }

  async beforeDestroy(params) {
    await models.Book.destroy({
      where: {
        authorId: params.id,
      },
    })
  }

  parseExpand2Include(expand) {
    if (!expand) return null
    if (expand.book) {
      return ['books']
    }
    return null
  }

  didLoadCmd = () => {
    this.addAsync('test', this.test)
    this.addAsync('test1', this.test1)
  }

  test = async () => {
    const t = await sequelize.transaction()
    try {
      const user = await this.model.create({
        name: 'Bart',
        mobile: '173793790675',
        sex: 'MAN',
      }, { transaction: t })

      await this.model.create({
        name: 'Lisa',
        authorId: user.id,
      }, { transaction: t })

      await models.Book.create({
        name: 'LisaBook',
        authorId: user.id,
      }, { transaction: t })
      await t.commit()

      const data = await this.db2logic(user)
      return util.responseSuccess(data)
    } catch (error) {
      await t.rollback()
      return this.handleCatchErr(error)
    }
  }

  // test1 = async () => util.responseSuccess({ a: 1 })
  test1 = async (msg) => {
    this.seneca.logger.info(msg)
    return this.handleCatchErr(new ZError('name', 'TEST_UU'))
  }
}

module.exports = AuthorService
```

# API约束
api的入参和出参统一采用json格式。
`services`里面对表的操作的统一公布`create`，`retrieve`，`delete`，`update`，`updateStatus`，`list`，`count`，`treeList`，`listAll`这些基本api。不根据每一个业务需求去公布一个api比如以userId去统计订单数量统一在`count`api实现。除非是一些复杂性的业务相关的需求需要单独提供api，例如统计在某场景购买品类商品的男女比例。每一个api都需要做参数的合法性和有效性的校验。api返回的JSON对象格式如下：

  ```
  {
    code: 0,
    message: '',
    status: 200,
    data: {},
  }```
  
### 统一返回值

|参数|类型|必填|默认值|描述|
|--- | --- | --- | --- | ---|
|code | Number, String | 是 | 无 | 0表示api调用成功，否则表示失败|
|message | String | 是 | 无 | code=0为SUCCESS；否则为错误描述|
|data | Object, Array | 否 | 无 | api数据的返回值|
|status | Int | 否 | 无 | 为http状态码，兼容restfule api用|

## 资源list api格式
* 分页。参数`page`表示获取第几页,默认为`1`。`pageSize`表示获取当前页的数据条.数默认为`10`。
* 排序。支持四种格式：array of `{ field: "", order: "DESC" }`；array of `[field, "DESC"]`；object of `{a: -1("DESC"), b: 1("ASC")}`；`sort=-a,b`。例如按创建时间倒序`-createdAt`。
* 关键字查找。`search` 用于查找需要模糊匹配。例如在商品列表中，当`search=可乐`，我们将搜索商品中名称或品牌为可乐的商品。
* 范围查找。范围查找采用数学的范围表达方式 `[` 表示大于等于；`]` 表示小于等于；`(` 表示大于；`)` 表示小于；`{a,b,c...}`表示`in`查询。例如查找库存数量大于等于100，小于200的商品数量，格式为`depotQty=[100,200)`。时间为`[YYYY-MM-DD HH:mm:ss,YYYY-MM-DD HH:mm:ss]`
* 扩展数据。`expand`拿资源相关的扩展数据时，在expand指明需要获取的扩展数据。例如列表员工数据，此时需要获取部门数据：`expand=depantment`，多个扩展数据使用逗号隔开。

### list api 参数

|参数|类型|必填|默认值|描述|
|--- | --- | --- | --- | ---|
|pageSize | Int | 否 | 1 | 每页条数|
|page | Int | 否 | 10 | 当前页数|
|limit | Int | 否 | 10 | 同pageSize|
|offset | Int | 否 | 无 | 起始条数|
|sort | Array，Object, String | 否 | 无 | 排序。支持三种格式：array of { field: "", order: "DESC" }；array of [[field, "DESC"]]；object of {a: -1("DESC"), b: 1("ASC")}；sort=-a,b|
|search | String | 否 | 无 | 搜索关键字|
|expand | String | 否 | 无 | 获取指定子资源数据，多个子资源使用逗号隔开。例如：expand=a,b|


### list api 返回值

|参数|类型|必填|默认值|描述|
|--- | --- | --- | --- | ---|
|pageSize | Int | 是 | 无 | 每页条数|
|page | Int | 是 | 无 | 当前页数|
|total | Int | 是 | 无 | 符合条件的总数量|
|limit | Int | 是 | 无 | 同pageSize|
|offset | Int | 是 | 无 | 起始条数|
|items | Array | 否 | 无 | 返回数据项|


### 部署后如何使用

```

```javascript
const FCClient = require('@alicloud/fc2')

const client = new FCClient('your account id', {
  accessKeyID: 'your accessKeyID',
  accessKeySecret: 'your accessKeyID',
  region: 'cn-shenzhen',
})
client.invokeFunction('test', 'test', JSON.stringify({
  role: 'seneca.author',
  cmd: 'create',
  params: {
    name: Math.random().toString(),
    mobile: '13760471840',
    sex: 'MAN',
  },
})).then((ret) => {
  console.log(ret)
})
```
