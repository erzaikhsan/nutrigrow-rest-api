const { body, param } = require("express-validator");

const requirements = {
  editPhotoProfile: [
    param("parentId").isString(),
    body("file").custom((value, { req }) => {
      if (!req.file) {
        throw new Error("No file uploaded or file type is incorrect");
      }
      return true;
    }),
  ],

  editBirthCertificate: [
    param("childId").isString(),
    body("file").custom((value, { req }) => {
      if (!req.file) {
        throw new Error("No file uploaded or file type is incorrect");
      }
      return true;
    }),
  ],
};

module.exports = requirements;
