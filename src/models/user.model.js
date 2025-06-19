const { DataTypes } = require("sequelize");
const { db } = require("../config");

const User = db.define(
  "users",
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("Parent", "Officer", "Admin"),
      allowNull: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
  },
  {
    tableName: "users",
    freezeTableName: true,
    timestamps: true,
  }
);

module.exports = User;
