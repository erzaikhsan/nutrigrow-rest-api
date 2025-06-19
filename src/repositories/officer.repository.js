const { OfficerModel, UserModel } = require("../models");
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
  } = params;

  await UserModel.create({
    id,
    email,
    password,
    role,
    is_active,
  });

  const addOfficer = await OfficerModel.create({
    user_id: id,
    full_name,
    gender,
    date_of_birth,
    phone_number,
    address,
    region,
  });

  return addOfficer;
}

async function getOfficers(uid) {
  return OfficerModel.findAll({
    attributes: [
      "user_id",
      "full_name",
      "gender",
      "date_of_birth",
      "phone_number",
      "address",
      "region",
    ],
    order: [["region", "ASC"]],
    where: {
      user_id: { [Op.ne]: uid },
    },
  });
}

async function getOfficerAccount(id) {
  const profile = await OfficerModel.findByPk(id, {
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

async function getOfficerById(id) {
  return OfficerModel.findByPk(id, {
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

async function getOfficersByRegion(region) {
  return OfficerModel.findAll({
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

async function updateOfficer(id, data) {
  const { full_name, gender, date_of_birth, phone_number, address, region } =
    data;

  const [rowsUpdated, updatedData] = await OfficerModel.update(
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

async function deleteOfficer(id) {
  await OfficerModel.destroy({
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
  registerOfficer,
  getOfficers,
  getOfficerAccount,
  getOfficerById,
  getOfficersByRegion,
  updateOfficer,
  deleteOfficer,
};
