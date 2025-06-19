const { DataTypes } = require("sequelize");
const { db } = require("../config");
const Children = require("./children.model");

const Growth = db.define(
  "growth",
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
    children_id: {
      type: DataTypes.STRING,
      references: {
        model: Children,
        key: "children_id",
      },
    },
    date: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    age: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    region: {
      type: DataTypes.ENUM("RW1", "RW2", "RW3", "RW4", "RW5"),
      allowNull: false,
    },
    weight: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    wfa_status: {
      type: DataTypes.ENUM(
        "Severely Underweight",
        "Underweight",
        "Normal",
        "Overweight and Obese",
        "Unknown"
      ),
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
    wfh_status: {
      type: DataTypes.ENUM(
        "Severely Wasting",
        "Wasting",
        "Normal",
        "Overweight and Obese",
        "Unknown"
      ),
      allowNull: false,
    },
    head_circum: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    arm_circum: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    note: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "growth",
    freezeTableName: true,
    timestamps: true,
  }
);

Growth.belongsTo(Children, { foreignKey: "children_id" });

module.exports = Growth;
