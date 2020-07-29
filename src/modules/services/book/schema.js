/**
 * File: schema.js
 * Project: z-ali-fc
 * FilePath: /src/modules/services/test3/schema.js
 * Created Date: 2020-04-17 09:28:00
 * Author: Zz
 * -----
 * Last Modified: 2020-07-29 22:07:47
 * Modified By: Zz
 * -----
 * Description: 基于sequelize定义Model
 */
import { DataTypes } from 'sequelize'

const Status = {
  ENABLED: 'ENABLED',
  DISABLED: 'DISABLED',
}

module.exports = {
  name: 'Book',
  Status,
  // 模型定义其他参数
  options: {
    paranoid: true,
  },
  schema: {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM,
      values: Object.keys(Status),
      defaultValue: Status.ENABLED,
    },
    authorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
}
