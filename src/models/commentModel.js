const sequelize = require('../config/sequelizeConfig');
const { Sequelize, DataTypes } = require('sequelize');

const CommentModel = sequelize.define(
    "comment",
    {
        id: {
            type: Sequelize.UUID,
            primaryKey: true,
        },
        comment: DataTypes.STRING,
        post_id: Sequelize.UUID,
        user_id: Sequelize.UUID,
    },
    {
        freezeTableName: true,
        timestamps: false,
        tableName: "comments",
    }
);

module.exports = CommentModel