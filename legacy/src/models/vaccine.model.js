const { DataTypes } = require("sequelize");
const { db } = require("../config");
const Children = require("./children.model");

const Vaccine = db.define(
  "vaccines",
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
    vaccine_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    place: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "vaccines",
    freezeTableName: true,
    timestamps: true,
  }
);

Vaccine.belongsTo(Children, { foreignKey: "children_id" });

module.exports = Vaccine;
