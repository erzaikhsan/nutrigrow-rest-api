const { AuthService } = require("../services");
const logger = require("../utils/logger");
const {
  handle401Response,
  handle500Response,
  handle409Response,
  handle403Response,
} = require("../utils/response");

async function login(req, res) {
  try {
    const result = await AuthService.login(req.body);
    res.status(200).json({
      success: true,
      message: "Login Successful",
      data: result,
    });
  } catch (err) {
    if (err.message == 401) {
      return handle401Response(res);
    }
    if (err.message == 403) {
      return handle403Response(res);
    }
    logger.error({ status: 500, error: err });
    handle500Response(res);
  }
}

async function verifyAccount(req, res) {
  try {
    const result = await AuthService.verifyAccount(req.body);
    res.status(201).json({
      success: true,
      message: "Verify Account Successful",
      data: result,
    });
  } catch (err) {
    if (err.message == 409) {
      return handle409Response(res);
    }
    if (err.message == 401) {
      return handle401Response(res);
    }
    logger.error({ status: 500, error: err });
    handle500Response(res);
  }
}

async function registerParent(req, res) {
  try {
    const {
      email,
      password,
      full_name,
      gender,
      date_of_birth,
      phone_number,
      address,
      region,
    } = req.body;
    const result = await AuthService.registerParent({
      email,
      password,
      full_name,
      gender,
      date_of_birth,
      phone_number,
      address,
      region,
    });
    res.status(201).json({
      success: true,
      message: "Parent Register Successful",
      data: result,
    });
  } catch (err) {
    logger.error({ status: 500, error: err });
    handle500Response(res);
  }
}

async function registerOfficer(req, res) {
  try {
    const result = await AuthService.registerOfficer(req.body);
    res.status(201).json({
      success: true,
      message: "Officer Register Successful",
      data: result,
    });
  } catch (err) {
    if (err.message == 409) {
      return handle409Response(res);
    }
    logger.error({ status: 500, error: err });
    handle500Response(res);
  }
}

async function sendOtp(req, res) {
  try {
    const { email, password } = req.body;
    const send = await AuthService.sendOtpToEmail(email, password);
    res
      .status(200)
      .json({ success: true, message: "OTP sent to email", data: send });
  } catch (err) {
    if (err.message == 409) {
      return handle409Response(res);
    }
    logger.error({ status: 500, error: err });
    handle500Response(res);
  }
}

async function deactiveAccount(req, res) {
  try {
    const result = await AuthService.deactiveAccount(req.params.id);
    res.status(200).json({
      success: true,
      message: "Account deactivated successfully",
      data: result,
    });
  } catch (err) {
    if (err.message == 404) {
      return handle409Response(res);
    }
    logger.error({ status: 500, error: err });
    handle500Response(res);
  }
}

async function activeAccount(req, res) {
  try {
    const result = await AuthService.activeAccount(req.params.id);
    res.status(200).json({
      success: true,
      message: "Account activated successfully",
      data: result,
    });
  } catch (err) {
    if (err.message == 404) {
      return handle409Response(res);
    }
    logger.error({ status: 500, error: err });
    handle500Response(res);
  }
}

module.exports = {
  login,
  verifyAccount,
  registerParent,
  registerOfficer,
  sendOtp,
  deactiveAccount,
  activeAccount,
};
