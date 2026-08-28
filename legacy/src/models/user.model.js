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
    active_period: {
      type: DataTypes.DATE,
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

// const User = db.define(
//   "users",
//   {
//     id: {
//       type: DataTypes.STRING,
//       primaryKey: true,
//       allowNull: false,
//     },
//     email: {
//       type: DataTypes.STRING(50),
//       allowNull: false,
//       unique: true,
//     },
//     password: {
//       type: DataTypes.STRING(255),
//       allowNull: false,
//     },
//     role: {
//       type: DataTypes.ENUM("Parent", "Officer", "Admin"),
//       allowNull: false,
//     },
//     is_active: {
//       type: DataTypes.BOOLEAN,
//       allowNull: false,
//     },
//   },
//   {
//     tableName: "users",
//     freezeTableName: true,
//     timestamps: true,
//   }
// );
