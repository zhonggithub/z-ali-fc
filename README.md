# Basic Usage

```javascipt
const { util, ServiceBase, ServiceImp, ServiceUtilBase, mysqlSeneca, mongodbSeneca } = require('zhz-util');
```

## Docs

- [util](https://github.com/zhonggithub/zhz-util/blob/master/apidocs/docs/util.md)
- [ServiceBase](https://github.com/zhonggithub/zhz-util/blob/master/apidocs/docs/ServiceBase.md)
- [Service](https://github.com/zhonggithub/zhz-util/blob/master/apidocs/docs/Service.md)
- [ModelBase](https://github.com/zhonggithub/zhz-util/blob/master/apidocs/docs/ModelBase.md)

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

