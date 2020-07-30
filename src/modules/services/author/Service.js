/**
 * File: ServiceUtil.js
 * Project: z-ali-fc
 * FilePath: /src/modules/services/author/ServiceUtil.js
 * Created Date: 2020-04-19 15:40:26
 * Author: Zz
 * -----
 * Last Modified: 2020-07-30 09:03:19
 * Modified By: Zz
 * -----
 * Description:
 */
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
      fcService,
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
