/**
 * File: mkdocCfg.js
 * Project: z-ali-fc-mkdocs
 * FilePath: /test/book/mkdocCfg.js
 * Created Date: 2020-05-30 22:59:19
 * Author: Zz
 * -----
 * Last Modified: 2020-07-29 22:07:47
 * Modified By: Zz
 * -----
 * Description:
 */
const { DataTypes } = require('sequelize')

module.exports = {
  name: '书籍',
  groupName: 'Book',
  description: '测试测试',
  create: true,
  retrieve: true,
  update: true,
  updateStatus: {
    params: {
      id: {
        type: Number,
        comment: 'id',
      },
      status: {
        type: DataTypes.ENUM,
        values: ['ENABLED', 'DISABLED'],
        comment: '状态',
      },
    },
    returns: true,
  },
  list: {
    params: {
      pageSize: {
        type: Number,
        comment: '每页条数',
      },
      page: {
        type: Number,
        comment: '当前页数',
      },
      sort: {
        type: String,
        comment: '排序',
      },
      search: {
        type: String,
        comment: '搜索字段',
      },
      expand: {
        type: String,
        comment: '获取子资源数据.',
      },
    },
    returns: {
      pageSize: {
        type: Number,
        comment: '每页条数',
      },
      page: {
        type: Number,
        comment: '当前页数',
      },
      total: {
        type: Number,
        comment: '符合条件的总数量',
      },
      limit: {
        type: Number,
        comment: '同pageSize',
      },
      offset: {
        type: Number,
        comment: '其实条数',
      },
      items: [{
        name: {
          type: String,
          comment: '姓名',
        },
      }],
    },
  },
  retrieveByGroupId: {
    name: '通过groupId获取详情',
    description: '组id',
    params: {
      groupId: {
        type: String,
        comment: '组别id',
      },
      groupName: {
        type: String,
        comment: 'group名称',
      },
      // department: 'Department',
    },
    returns: 'schema',
  },
  getName: {
    params: {
      groupId: {
        type: String,
        comment: '组别id',
        required: true,
      },
    },
    returns: {
      name: {
        type: String,
        comment: '名称',
      },
    },
  },
}
