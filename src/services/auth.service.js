const {
  UserRepository,
  ParentRepository,
  OfficerRepository,
  AuthRepository,
} = require("../repositories");
const { secretKey } = require("../config");
const { compareSync } = require("bcrypt");
const { sign } = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const nodemailer = require("nodemailer");

async function login({ email, password }) {
  const user = await UserRepository.getUserByEmail(email);
  if (!user) {
    throw new Error(401);
  }

  if (user.dataValues.is_active === false) {
    throw new Error(403);
  }

  const isPasswordCorrect = compareSync(password, user.dataValues.password);
  if (!isPasswordCorrect) {
    throw new Error(401);
  }

  let data;
  if (user.dataValues.role === "Parent") {
    data = await ParentRepository.getParentById(user.dataValues.id);
  } else {
    data = await OfficerRepository.getOfficerById(user.dataValues.id);
  }

  const authUser = { id: user.dataValues.id, role: user.dataValues.role };

  const token = sign(authUser, secretKey, { expiresIn: "24h" });

  return {
    id: user.dataValues.id,
    role: user.dataValues.role,
    region: data.dataValues.region,
    token,
  };
}

async function sendOtpToEmail(email, password) {
  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  const expires_at = new Date(Date.now() + 10 * 60 * 1000);

  const emailExist = await UserRepository.getUserByEmail(email);
  if (emailExist) {
    throw new Error(409);
  }

  await AuthRepository.addNewOtp({ email, otp, expires_at });

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "nutrigrowapp@gmail.com",
      pass: "loca rlnj cejc rdjq",
    },
  });

  await transporter.sendMail({
    from: '"NutriGrow" <nutrigrowapp@gmail.com>',
    to: email,
    subject: "Your OTP Code",
    text: `Verify your NutriGrow register! Your OTP Code is: ${otp}`,
  });
  return { email: email, password: password };
}

async function registerAccountParent(params) {
  const { email, password, otp } = params;

  const emailExist = await UserRepository.getUserByEmail(email);
  if (emailExist) {
    throw new Error(409);
  }

  const otpRecord = await AuthRepository.getOtpByEmail(email);
  if (
    !otpRecord ||
    otpRecord.otp !== otp ||
    new Date() > otpRecord.expires_at
  ) {
    throw new Error(401);
  }

  const id = uuidv4();
  const role = "Parent";
  const hashedPass = await bcrypt.hash(password, 10);
  const register = await ParentRepository.registerAccount({
    id,
    email,
    password: hashedPass,
    role,
    is_active: false,
  });
  return register;
}

async function registerParent(params) {
  const {
    email,
    full_name,
    gender,
    date_of_birth,
    phone_number,
    address,
    region,
  } = params;

  const parentExist = await UserRepository.getUserByEmail(email);
  if (!parentExist) {
    throw new Error(409);
  }

  const register = await ParentRepository.registerParent({
    id: parentExist.dataValues.id,
    email,
    password: parentExist.dataValues.password,
    role: parentExist.dataValues.role,
    full_name,
    gender,
    date_of_birth,
    phone_number,
    address,
    region,
  });
  return register;
}

async function registerOfficer(params) {
  const {
    email,
    password,
    full_name,
    gender,
    date_of_birth,
    phone_number,
    address,
    region,
  } = params;

  const emailExist = await UserRepository.getUserByEmail(email);
  if (emailExist) {
    throw new Error(409);
  }
  const id = uuidv4();
  const role = "Officer";
  const hashedPass = await bcrypt.hash(password, 10);
  const register = await OfficerRepository.registerOfficer({
    id,
    email,
    password: hashedPass,
    role,
    is_active: true,
    full_name,
    gender,
    date_of_birth,
    phone_number,
    address,
    region,
  });
  return register;
}

async function deactiveAccount(id) {
  const user = await UserRepository.getUserById(id);
  if (!user) {
    throw new Error(404);
  }

  return UserRepository.deactiveAccount({
    id: id,
    email: user.dataValues.email,
    password: user.dataValues.password,
    role: user.dataValues.role,
    is_active: false,
  });
}

async function activeAccount(id) {
  const user = await UserRepository.getUserById(id);
  if (!user) {
    throw new Error(404);
  }

  return UserRepository.activeAccount({
    id: id,
    email: user.dataValues.email,
    password: user.dataValues.password,
    role: user.dataValues.role,
    is_active: true,
  });
}

module.exports = {
  login,
  registerAccountParent,
  registerParent,
  registerOfficer,
  sendOtpToEmail,
  deactiveAccount,
  activeAccount,
};
