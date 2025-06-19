const { DataTypes } = require("sequelize");
const { db } = require("../config");
const Parent = require("./parent.model");

const Children = db.define(
  "children",
  {
    children_id: {
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
    full_name: {
      type: DataTypes.STRING(75),
      allowNull: false,
    },
    gender: {
      type: DataTypes.CHAR(1),
      allowNull: false,
    },
    place_of_birth: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    date_of_birth: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    father: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    mother: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    region: {
      type: DataTypes.ENUM("RW1", "RW2", "RW3", "RW4", "RW5"),
      allowNull: false,
    },
    birth_weight: {
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
    birth_height: {
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
    birth_head_circum: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
  },
  {
    tableName: "children",
    freezeTableName: true,
    timestamps: true,
  }
);

Children.belongsTo(Parent, { foreignKey: "parents_id" });

module.exports = Children;
