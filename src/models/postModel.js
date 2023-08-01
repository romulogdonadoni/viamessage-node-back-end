const sequelize = require('../config/sequelizeConfig');
const { Sequelize, DataTypes } = require('sequelize');

const PostModel = sequelize.define(
    "post",
    {
        id: {
            type: Sequelize.UUID,
            primaryKey: true,
        },
        img: DataTypes.STRING,
        description: DataTypes.STRING,
        privacy: DataTypes.STRING,
        user_id: Sequelize.UUID,
    },
    {
        createdAt: true,
        updatedAt: false,
        freezeTableName: true,
        timestamps: true,
        tableName: "posts",
    }
);

module.exports = PostModel