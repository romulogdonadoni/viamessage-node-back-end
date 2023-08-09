const sequelize = require("../config/sequelizeConfig");
const { Sequelize, DataTypes } = require("sequelize");

const FollowModel = sequelize.define(
  "follow",
  {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
    },
    followedUser: DataTypes.STRING,
    user_id: Sequelize.UUID,
  },
  {
    freezeTableName: true,
    timestamps: false,
    tableName: "follows",
  }
);

module.exports = FollowModel;
