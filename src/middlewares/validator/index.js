const { validationResult } = require("express-validator");
const AuthRequirement = require("./auth.requirement");
const ParentRequirement = require("./parent.requirement");
const OfficerRequirement = require("./officer.requirement");
const ChildrenRequirement = require("./children.requirement");
const GrowthRequirement = require("./growth.requirement");
const UploadRequirement = require("./upload.requirement");
const UserRequirement = require("./user.requirement");
const EventRequirement = require("./event.requirement");

const logger = require("../../utils/logger");

const requirements = {
  ...AuthRequirement,
  ...ParentRequirement,
  ...OfficerRequirement,
  ...ChildrenRequirement,
  ...GrowthRequirement,
  ...UploadRequirement,
  ...UserRequirement,
  ...EventRequirement,
};

function validate(validations) {
  return async (req, res, next) => {
    await Promise.all(validations.map((validation) => validation.run(req)));
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }
    logger.error({ error: errors.array() });

    const error = errors.array()[0].msg;

    if (error === "No file uploaded or file type is incorrect") {
      return res.status(400).json({
        status: "failed",
        message: error,
      });
    }

    return res.status(400).json({
      status: "failed",
      message: "Invalid input",
    });
  };
}

module.exports = {
  requirements,
  validate,
};
