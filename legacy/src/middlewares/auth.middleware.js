const { verify } = require("jsonwebtoken");
const { secretKey } = require("../config");
const { UserService } = require("../services");

class AuthMiddleware {
  constructor() {}

  authenticate = async (req, res, next) => {
    const authorization = String(req.headers.authorization);
    if (!authorization || !authorization.includes("Bearer")) {
      res.status(401).json({
        status: "failed",
        message: "Invalid Token",
      });
      return;
    }

    const token = authorization?.slice(7);
    let payload;
    try {
      payload = verify(token, secretKey);
    } catch (err) {
      res.status(401).json({
        status: "failed",
        message: "Invalid or expired token",
      });
      return;
    }

    const user = await UserService.getUserById(payload.id);
    if (!user) {
      res.status(404).json({
        status: "failed",
        message: "User not found",
      });
      return;
    }
    if (user.dataValues.is_active === false) {
      res.status(401).json({
        status: "failed",
        message: "User Account is deactivated",
      });
      return;
    }
    req.userdata = user;

    next();
  };

  authorize = (...roles) => {
    return async (req, res, next) => {
      const userdata = req.userdata;
      if (!userdata) {
        res.status(403).json({
          status: "failed",
          message: "You don't have access",
        });
        return;
      }

      const isRoleValid = roles.includes(userdata.role);
      if (!isRoleValid) {
        res.status(403).json({
          status: "failed",
          message: "You don't have access",
        });
        return;
      }
      next();
    };
  };

  verifyUser = async (req, res, next) => {
    const { id } = req.params;
    const userdata = req.userdata;
    if (userdata.id != id) {
      res.status(403).json({
        status: "failed",
        message: "You don't have access",
      });
      return;
    }
    next();
  };
}

module.exports = AuthMiddleware;
