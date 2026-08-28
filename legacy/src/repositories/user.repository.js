const { UserModel } = require("../models");
const { Op } = require("sequelize");

async function getUserByEmail(email) {
  return UserModel.findOne({
    where: {
      email: {
        [Op.iLike]: email,
      },
    },
  });
}

async function getUserById(id) {
  return UserModel.findByPk(id);
}

async function deactiveAccount(data) {
  const { id, email, password, role, is_active } = data;

  const [rowsUpdated, updatedData] = await UserModel.update(
    {
      id,
      email,
      password,
      role,
      is_active,
    },
    {
      where: {
        id,
      },
      returning: true,
    }
  );

  return updatedData[0];
}

async function activeAccount(data) {
  const { id, email, password, role, is_active } = data;

  const [rowsUpdated, updatedData] = await UserModel.update(
    {
      id,
      email,
      password,
      role,
      is_active,
    },
    {
      where: {
        id,
      },
      returning: true,
    }
  );

  return updatedData[0];
}

module.exports = {
  getUserByEmail,
  getUserById,
  deactiveAccount,
  activeAccount,
};
