const { DataTypes } = require("sequelize");
const { db } = require("../config");
const Parent = require("../models/parent.model");

const Check = db.define(
  "check",
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
    parents_id: {
      type: DataTypes.STRING,
      references: {
        model: Parent,
        key: "user_id",
      },
    },
    gender: {
      type: DataTypes.CHAR(1),
      allowNull: false,
    },
    age: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    height: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    hfa_status: {
      type: DataTypes.ENUM("Severely Stunted", "Stunted", "Normal", "Unknown"),
      allowNull: false,
    },
  },
  {
    tableName: "check",
    freezeTableName: true,
    timestamps: true,
  }
);

Check.belongsTo(Parent, { foreignKey: "parents_id" });

module.exports = Check;
