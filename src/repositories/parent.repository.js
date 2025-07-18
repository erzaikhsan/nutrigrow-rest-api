const { UserModel } = require("../models");
const { Op } = require("sequelize");

// async function registerAccount(params) {
//   const { id, email, password, role, is_active } = params;

//   const addAccount = await UserModel.create({
//     id,
//     email,
//     password,
//     role,
//     is_active,
//   });

//   return addAccount;
// }

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
    active_period,
  } = params;

  // await UserModel.update(
  //   {
  //     id,
  //     email,
  //     password,
  //     role,
  //     is_active: true,
  //   },
  //   {
  //     where: {
  //       id: id,
  //     },
  //   }
  // );

  const addParent = await UserModel.create({
    id,
    email,
    password,
    role,
    is_active: true,
    full_name,
    gender,
    date_of_birth,
    phone_number,
    address,
    region,
    active_period,
  });

  return addParent;
}

async function getParents() {
  return UserModel.findAll({
    attributes: [
      "id",
      "full_name",
      "gender",
      "date_of_birth",
      "phone_number",
      "address",
      "region",
    ],
    order: [["full_name", "ASC"]],
    where: {
      role: "Parent",
    },
  });
}

async function getParentAccount(id) {
  const profile = await UserModel.findByPk(id, {
    attributes: [
      "id",
      "is_active",
      "full_name",
      "gender",
      "date_of_birth",
      "phone_number",
      "address",
      "region",
      "active_period",
    ],
  });

  return profile;
}

async function getParentById(id) {
  return UserModel.findByPk(id, {
    attributes: [
      "id",
      "full_name",
      "gender",
      "date_of_birth",
      "phone_number",
      "address",
      "region",
      "active_period",
    ],
  });
}

async function getParentByName(name) {
  return UserModel.findAll({
    attributes: [
      "id",
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
      role: "Parent",
    },
  });
}

async function getParentByNameAndRegion(name, region) {
  return UserModel.findAll({
    attributes: [
      "id",
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
      role: "Parent",
      region: region,
    },
  });
}

async function getParentsByRegion(region) {
  return UserModel.findAll({
    attributes: [
      "id",
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
      role: "Parent",
    },
  });
}

async function updateParent(id, data) {
  const {
    full_name,
    gender,
    date_of_birth,
    phone_number,
    address,
    region,
    active_period,
  } = data;

  const [rowsUpdated, updatedData] = await UserModel.update(
    {
      full_name,
      gender,
      date_of_birth,
      phone_number,
      address,
      region,
      active_period,
    },
    {
      where: {
        id: id,
      },
      returning: true,
    }
  );

  return updatedData[0];
}

async function deleteParent(id) {
  await UserModel.destroy({
    where: {
      id: id,
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
  // registerAccount,
  getParents,
  getParentAccount,
  getParentById,
  getParentByName,
  getParentByNameAndRegion,
  getParentsByRegion,
  updateParent,
  deleteParent,
};
