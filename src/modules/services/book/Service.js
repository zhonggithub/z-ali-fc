import { mysqlSeneca } from 'zhz-util'
import models from '../../models'
import config from '../../../config'

class BookService extends mysqlSeneca.Service {
  constructor(fcService, cache) {
    const resourceName = 'book'
    const role = `${config.serviceName}.${resourceName}`

    super({
      seneca: fcService,
      role,
      model: new mysqlSeneca.SequelizeModel(models.Book),
      cache,
      resourceName,
    })
  }
}

module.exports = BookService
