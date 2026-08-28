const { DataTypes } = require("sequelize");
const { db } = require("../config");

const Event = db.define(
  "events",
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    date: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    start_time: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    end_time: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    place: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    region: {
      type: DataTypes.ENUM("RW1", "RW2", "RW3", "RW4", "RW5", "Village"),
      allowNull: false,
    },
  },
  {
    tableName: "events",
    freezeTableName: true,
    timestamps: true,
  }
);

module.exports = Event;
