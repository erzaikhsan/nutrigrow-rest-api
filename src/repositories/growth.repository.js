const { GrowthModel } = require("../models");
const { Op } = require("sequelize");

async function addGrowth(params) {
  const {
    id,
    children_id,
    date,
    age,
    region,
    weight,
    wfa_status,
    height,
    hfa_status,
    wfh_status,
    head_circum,
    arm_circum,
    note,
  } = params;

  const growth = await GrowthModel.create({
    id,
    children_id,
    date,
    age,
    region,
    weight,
    wfa_status,
    height,
    hfa_status,
    wfh_status,
    head_circum,
    arm_circum,
    note,
  });

  return growth;
}

async function getGrowth() {
  return GrowthModel.findAll({
    attributes: [
      "id",
      "children_id",
      "date",
      "age",
      "region",
      "weight",
      "wfa_status",
      "height",
      "hfa_status",
      "wfh_status",
      "head_circum",
      "arm_circum",
      "note",
    ],
  });
}

async function getGrowthById(id) {
  return GrowthModel.findByPk(id, {
    attributes: [
      "id",
      "children_id",
      "date",
      "age",
      "region",
      "weight",
      "wfa_status",
      "height",
      "hfa_status",
      "wfh_status",
      "head_circum",
      "arm_circum",
      "note",
    ],
  });
}

async function getGrowthByChildId(childId) {
  return GrowthModel.findAll({
    attributes: [
      "id",
      "children_id",
      "date",
      "age",
      "region",
      "weight",
      "wfa_status",
      "height",
      "hfa_status",
      "wfh_status",
      "head_circum",
      "arm_circum",
      "note",
    ],
    order: [["date", "DESC"]],
    where: {
      children_id: childId,
    },
  });
}

async function getGrowthByRegion(region) {
  return GrowthModel.findAll({
    attributes: [
      "id",
      "children_id",
      "date",
      "age",
      "region",
      "weight",
      "wfa_status",
      "height",
      "hfa_status",
      "wfh_status",
      "head_circum",
      "arm_circum",
      "note",
    ],
    order: [["date", "DESC"]],
    where: {
      region,
    },
  });
}

async function getGrowthByMonthYearAndChildId(children_id, month, year) {
  return GrowthModel.findAll({
    attributes: [
      "id",
      "children_id",
      "date",
      "age",
      "region",
      "weight",
      "wfa_status",
      "height",
      "hfa_status",
      "wfh_status",
      "head_circum",
      "arm_circum",
      "note",
    ],
    where: {
      children_id,
      date: {
        [Op.gte]: new Date(year, month, 1),
        [Op.lt]: new Date(year, month + 1, 1),
      },
    },
  });
}

async function getLastGrowthByChildId(children_id) {
  return GrowthModel.findOne({
    where: {
      children_id,
    },
    order: [["date", "DESC"]],
    attributes: [
      "id",
      "children_id",
      "date",
      "age",
      "region",
      "weight",
      "wfa_status",
      "height",
      "hfa_status",
      "wfh_status",
      "head_circum",
      "arm_circum",
      "note",
    ],
  });
}

async function getGrowthOnMonth(month, year, region) {
  return GrowthModel.findAll({
    attributes: [
      "id",
      "children_id",
      "date",
      "age",
      "region",
      "weight",
      "wfa_status",
      "height",
      "hfa_status",
      "wfh_status",
      "head_circum",
      "arm_circum",
      "note",
    ],
    where: {
      date: {
        [Op.gte]: new Date(year, month, 1),
        [Op.lt]: new Date(year, month + 1, 1),
      },
      region: region,
    },
  });
}

async function getGrowthOnMonthByChildId(childId, month, year) {
  return GrowthModel.count({
    where: {
      children_id: childId,
      date: {
        [Op.gte]: new Date(year, month, 1),
        [Op.lt]: new Date(year, month + 1, 1),
      },
    },
  });
}

async function updateGrowth(data) {
  const {
    id,
    date,
    age,
    region,
    weight,
    wfa_status,
    height,
    hfa_status,
    wfh_status,
    head_circum,
    arm_circum,
    note,
  } = data;

  const [rowsUpdated, updatedData] = await GrowthModel.update(
    {
      date,
      age,
      region,
      weight,
      wfa_status,
      height,
      hfa_status,
      wfh_status,
      head_circum,
      arm_circum,
      note,
    },
    {
      where: {
        id,
      },
      returning: true,
    }
  );

  return updatedData[0];
}

async function deleteGrowth(id) {
  return await GrowthModel.destroy({
    where: {
      id: id,
    },
  });
}

module.exports = {
  addGrowth,
  getGrowth,
  getGrowthById,
  getGrowthByChildId,
  getGrowthByRegion,
  getGrowthByMonthYearAndChildId,
  getGrowthOnMonth,
  getGrowthOnMonthByChildId,
  updateGrowth,
  getLastGrowthByChildId,
  deleteGrowth,
};
