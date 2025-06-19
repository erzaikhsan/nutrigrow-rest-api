const { CheckModel } = require("../models");

async function addCheckUp(params) {
  const { id, parents_id, gender, age, height, hfa_status } = params;

  const check = await CheckModel.create({
    id,
    parents_id,
    gender,
    age,
    height,
    hfa_status,
  });

  return check;
}

async function getCheckUpById(id) {
  return CheckModel.findByPk(id, {
    attributes: ["id", "parents_id", "gender", "age", "height", "hfa_status"],
  });
}

async function getCheckUpByParentId(parents_id) {
  return CheckModel.findAll({
    attributes: ["id", "parents_id", "gender", "age", "height", "hfa_status"],
    order: [["createdAt", "DESC"]],
    where: {
      parents_id,
    },
  });
}

module.exports = {
  addCheckUp,
  getCheckUpById,
  getCheckUpByParentId,
};
