/**
 * File: schema.js
 * Project: z-ali-fc
 * FilePath: /src/modules/services/author/schema.js
 * Created Date: 2020-04-19 15:35:50
 * Author: Zz
 * -----
 * Last Modified: 2020-07-29 22:07:47
 * Modified By: Zz
 * -----
 * Description:
 */
import { DataTypes } from 'sequelize'

const Sex = {
  Man: 'MAN',
  Woman: 'WOMAN',
}

module.exports = {
  name: 'Author',
  Sex,
  // 模型定义其他参数
  options: {
    paranoid: true,
  },
  schema: {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: '名称',
    },
    mobile: {
      type: DataTypes.STRING,
      comment: '手机号',
    },
    sex: {
      type: DataTypes.ENUM,
      values: Object.values(Sex),
      comment: '性别',
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
    },
  },
  hasMany: {
    model: 'Book',
    options: {
      foreignKey: 'authorId',
    },
  },
}
