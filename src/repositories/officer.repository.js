const { UserModel } = require("../models");
const { Op } = require("sequelize");

async function registerOfficer(params) {
  const {
    id,
    email,
    password,
    role,
    is_active,
    full_name,
    gender,
    date_of_birth,
    phone_number,
    address,
    region,
    active_period,
  } = params;

  // await UserModel.create({
  //   id,
  //   email,
  //   password,
  //   role,
  //   is_active,
  // });

  const addOfficer = await UserModel.create({
    id,
    email,
    password,
    role,
    is_active,
    full_name,
    gender,
    date_of_birth,
    phone_number,
    address,
    region,
    active_period,
  });

  return addOfficer;
}

async function getOfficers(uid) {
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
    order: [["region", "ASC"]],
    where: {
      id: { [Op.ne]: uid },
      role: "Officer",
    },
  });
}

async function getOfficerAccount(id) {
  const profile = await UserModel.findByPk(id, {
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
  const dataIsActive = await UserModel.findByPk(id, {
    attributes: ["is_active"],
  });

  return {
    ...profile.dataValues,
    is_active: dataIsActive.is_active,
  };
}

async function getOfficerById(id) {
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

async function getOfficersByRegion(region) {
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
      role: "Officer",
    },
  });
}

async function updateOfficer(id, data) {
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

async function deleteOfficer(id) {
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
  registerOfficer,
  getOfficers,
  getOfficerAccount,
  getOfficerById,
  getOfficersByRegion,
  updateOfficer,
  deleteOfficer,
};
