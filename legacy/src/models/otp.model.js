const { DataTypes } = require("sequelize");
const { db } = require("../config");

const Otp = db.define(
  "otps",
  {
    email: {
      type: DataTypes.STRING(50),
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    otp: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    tableName: "otps",
    freezeTableName: true,
    timestamps: true,
  }
);

module.exports = Otp;
