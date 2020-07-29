/**
 * File: graphqlCfg.js
 * Project: z-ali-fc
 * FilePath: /src/modules/services/author/graphqlCfg.js
 * Created Date: 2020-04-20 17:14:27
 * Author: Zz
 * -----
 * Last Modified: 2020-07-29 22:07:47
 * Modified By: Zz
 * -----
 * Description: graphql的配置文件, 定义方法输入参数，输出参数
 *
 * {
 *    fields: {
 *       books: '[Book]',
 *    },
 *    mutation: {
 *
 *    },
 *    query: {
 *
 *    }
 * }
 */
const { DataTypes } = require('sequelize')

module.exports = {
  fields: {
    books: '[Book]',
  },
  mutation: {
    updateStatus: false,
    create: {
      input: {
        name: {
          type: String,
        },
        age: {
          type: Number,
        },
        status: {
          type: DataTypes.BOOLEAN,
        },
      },
      output: {
        name: {
          type: String,
        },
      },
    },
    addOrUpdate: {
      input: {
        name: {
          type: 'String',
        },
      },
      output: {
        $typeName: 'Author1',
        items: [{
          name: {
            type: 'String',
          },
        }],
      },
    },
  },
}
