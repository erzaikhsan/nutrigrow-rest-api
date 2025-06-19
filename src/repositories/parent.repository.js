const { ParentModel, UserModel } = require("../models");
const { Op } = require("sequelize");

async function registerAccount(params) {
  const { id, email, password, role, is_active } = params;

  const addAccount = await UserModel.create({
    id,
    email,
    password,
    role,
    is_active,
  });

  return addAccount;
}

async function registerParent(params) {
  const {
    id,
    email,
    password,
    role,
    full_name,
    gender,
    date_of_birth,
    phone_number,
    address,
    region,
  } = params;

  await UserModel.update(
    {
      id,
      email,
      password,
      role,
      is_active: true,
    },
    {
      where: {
        id: id,
      },
    }
  );

  const addParent = await ParentModel.create({
    user_id: id,
    full_name,
    gender,
    date_of_birth,
    phone_number,
    address,
    region,
  });

  return addParent;
}

async function getParents() {
  return ParentModel.findAll({
    attributes: [
      "user_id",
      "full_name",
      "gender",
      "date_of_birth",
      "phone_number",
      "address",
      "region",
    ],
    order: [["full_name", "ASC"]],
  });
}

async function getParentAccount(id) {
  const profile = await ParentModel.findByPk(id, {
    attributes: [
      "user_id",
      "full_name",
      "gender",
      "date_of_birth",
      "phone_number",
      "address",
      "region",
    ],
  });
  const dataIsActive = await UserModel.findByPk(id, {
    attributes: ["is_active"],
  });

  return {
    ...profile.dataValues,
    is_active: dataIsActive.is_active,
  };
}

async function getParentById(id) {
  return ParentModel.findByPk(id, {
    attributes: [
      "user_id",
      "full_name",
      "gender",
      "date_of_birth",
      "phone_number",
      "address",
      "region",
    ],
  });
}

async function getParentByName(name) {
  return ParentModel.findAll({
    attributes: [
      "user_id",
      "full_name",
      "gender",
      "date_of_birth",
      "phone_number",
      "address",
      "region",
    ],
    where: {
      full_name: {
        [Op.iLike]: `%${name}%`,
      },
    },
  });
}

async function getParentsByRegion(region) {
  return ParentModel.findAll({
    attributes: [
      "user_id",
      "full_name",
      "gender",
      "date_of_birth",
      "phone_number",
      "address",
      "region",
    ],
    order: [["full_name", "ASC"]],
    where: {
      region,
    },
  });
}

async function updateParent(id, data) {
  const { full_name, gender, date_of_birth, phone_number, address, region } =
    data;

  const [rowsUpdated, updatedData] = await ParentModel.update(
    {
      full_name,
      gender,
      date_of_birth,
      phone_number,
      address,
      region,
    },
    {
      where: {
        user_id: id,
      },
      returning: true,
    }
  );

  return updatedData[0];
}

async function deleteParent(id) {
  await ParentModel.destroy({
    where: {
      user_id: id,
    },
  });

  return await UserModel.destroy({
    where: {
      id: id,
    },
  });
}

module.exports = {
  registerParent,
  registerAccount,
  getParents,
  getParentAccount,
  getParentById,
  getParentByName,
  getParentsByRegion,
  updateParent,
  deleteParent,
};
