const { DataTypes } = require("sequelize");
const { db } = require("../config");
const User = require("./user.model");

const Officers = db.define(
  "officers",
  {
    user_id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    full_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    gender: {
      type: DataTypes.CHAR(1),
      allowNull: false,
    },
    date_of_birth: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone_number: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    address: {
      type: DataTypes.TEXT,
    },
    region: {
      type: DataTypes.ENUM("RW1", "RW2", "RW3", "RW4", "RW5", "Village"),
      allowNull: false,
    },
  },
  {
    tableName: "officers",
    freezeTableName: true,
    timestamps: true,
  }
);

Officers.belongsTo(User, { foreignKey: "user_id" });

module.exports = Officers;
