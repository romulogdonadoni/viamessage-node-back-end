const sequelize = require("../config/sequelizeConfig");
const { Sequelize, DataTypes } = require("sequelize");

const UserModel = sequelize.define(
  "user",
  {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
    },
    img_profile: DataTypes.STRING,
    tagname: DataTypes.STRING,
    username: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
  },
  {
    freezeTableName: true,
    timestamps: false,
    tableName: "user",
  }
);

module.exports = UserModel;
