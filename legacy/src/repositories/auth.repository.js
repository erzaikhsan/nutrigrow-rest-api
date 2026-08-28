const { OtpModel } = require("../models");
const { Op } = require("sequelize");

async function addNewOtp(params) {
  const { email, otp, expires_at } = params;

  const addOtp = await OtpModel.upsert({
    email,
    otp,
    expires_at,
  });

  return addOtp;
}

async function getOtpByEmail(email) {
  return OtpModel.findOne({
    where: {
      email: {
        [Op.iLike]: email,
      },
    },
  });
}

module.exports = {
  addNewOtp,
  getOtpByEmail,
};
