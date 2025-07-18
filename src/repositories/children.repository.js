const { ChildrenModel, GrowthModel } = require("../models");
const { Op, fn, col } = require("sequelize");

async function addChildren(params) {
  const {
    children_id,
    parents_id,
    full_name,
    gender,
    place_of_birth,
    date_of_birth,
    father,
    mother,
    order_of_child,
    region,
    growthId,
    age,
    birth_weight,
    wfa_status,
    birth_height,
    hfa_status,
    wfh_status,
    birth_head_circum,
    birth_arm_circum,
  } = params;

  const children = await ChildrenModel.create({
    children_id,
    parents_id,
    full_name,
    gender,
    place_of_birth,
    date_of_birth,
    father,
    mother,
    order_of_child,
    region,
    birth_weight,
    wfa_status,
    birth_height,
    hfa_status,
    wfh_status,
    birth_head_circum,
  });

  await GrowthModel.create({
    id: growthId,
    children_id,
    date: date_of_birth,
    age,
    region,
    weight: birth_weight,
    wfa_status,
    height: birth_height,
    hfa_status,
    wfh_status,
    head_circum: birth_head_circum,
    arm_circum: birth_arm_circum,
    note: "Pengukuran Saat Bayi Lahir",
  });

  return children;
}

async function getChildren() {
  return ChildrenModel.findAll({
    attributes: [
      "children_id",
      "parents_id",
      "full_name",
      "gender",
      "place_of_birth",
      "date_of_birth",
      "father",
      "mother",
      "order_of_child",
      "region",
      "birth_weight",
      "wfa_status",
      "birth_height",
      "hfa_status",
      "wfh_status",
      "birth_head_circum",
    ],
    order: [["full_name", "ASC"]],
  });
}

async function getChildrenById(children_id) {
  return ChildrenModel.findByPk(children_id, {
    attributes: [
      "children_id",
      "parents_id",
      "full_name",
      "gender",
      "place_of_birth",
      "date_of_birth",
      "father",
      "mother",
      "order_of_child",
      "region",
      "birth_weight",
      "wfa_status",
      "birth_height",
      "hfa_status",
      "wfh_status",
      "birth_head_circum",
    ],
  });
}

async function getChildrenByParentId(parents_id) {
  return ChildrenModel.findAll({
    attributes: [
      "children_id",
      "parents_id",
      "full_name",
      "gender",
      "place_of_birth",
      "date_of_birth",
      "father",
      "mother",
      "order_of_child",
      "region",
      "birth_weight",
      "wfa_status",
      "birth_height",
      "hfa_status",
      "wfh_status",
      "birth_head_circum",
    ],
    order: [["full_name", "ASC"]],
    where: {
      parents_id,
    },
  });
}

async function getChildrenByParentIdAndChildrenId(id, parents_id) {
  return ChildrenModel.findAll({
    attributes: [
      "children_id",
      "parents_id",
      "full_name",
      "gender",
      "place_of_birth",
      "date_of_birth",
      "father",
      "mother",
      "order_of_child",
      "region",
      "birth_weight",
      "wfa_status",
      "birth_height",
      "hfa_status",
      "wfh_status",
      "birth_head_circum",
    ],
    where: {
      children_id: id,
      parents_id,
    },
  });
}

async function getChildrenByNameAndParentId(full_name, parents_id) {
  return ChildrenModel.findAll({
    attributes: [
      "children_id",
      "parents_id",
      "full_name",
      "gender",
      "place_of_birth",
      "date_of_birth",
      "father",
      "mother",
      "order_of_child",
      "region",
      "birth_weight",
      "wfa_status",
      "birth_height",
      "hfa_status",
      "wfh_status",
      "birth_head_circum",
    ],
    where: {
      parents_id,
      full_name,
    },
  });
}

async function getChildrenByName(name) {
  return ChildrenModel.findAll({
    attributes: [
      "children_id",
      "parents_id",
      "full_name",
      "gender",
      "place_of_birth",
      "date_of_birth",
      "father",
      "mother",
      "order_of_child",
      "region",
      "birth_weight",
      "wfa_status",
      "birth_height",
      "hfa_status",
      "wfh_status",
      "birth_head_circum",
    ],
    where: {
      full_name: {
        [Op.iLike]: `%${name}%`,
      },
    },
  });
}

async function getChildrenByRegion(region) {
  return ChildrenModel.findAll({
    attributes: [
      "children_id",
      "parents_id",
      "full_name",
      "gender",
      "place_of_birth",
      "date_of_birth",
      "father",
      "mother",
      "order_of_child",
      "region",
      "birth_weight",
      "wfa_status",
      "birth_height",
      "hfa_status",
      "wfh_status",
      "birth_head_circum",
    ],
    order: [["full_name", "ASC"]],
    where: {
      region,
    },
  });
}

async function getChildrenByNameAndRegion(name, region) {
  return ChildrenModel.findAll({
    attributes: [
      "children_id",
      "parents_id",
      "full_name",
      "gender",
      "place_of_birth",
      "date_of_birth",
      "father",
      "mother",
      "order_of_child",
      "region",
      "birth_weight",
      "wfa_status",
      "birth_height",
      "hfa_status",
      "wfh_status",
      "birth_head_circum",
    ],
    where: {
      full_name: {
        [Op.iLike]: `%${name}%`,
      },
      region,
    },
  });
}

async function updateChildren(data) {
  const {
    children_id,
    full_name,
    gender,
    place_of_birth,
    date_of_birth,
    father,
    mother,
    order_of_child,
    region,
    birth_weight,
    wfa_status,
    birth_height,
    hfa_status,
    wfh_status,
    birth_head_circum,
    birth_arm_circum,
    growthId,
    age,
  } = data;

  const [rowsUpdated, updatedData] = await ChildrenModel.update(
    {
      full_name,
      gender,
      place_of_birth,
      date_of_birth,
      father,
      mother,
      order_of_child,
      region,
      birth_weight,
      wfa_status,
      birth_height,
      hfa_status,
      wfh_status,
      birth_head_circum,
    },
    {
      where: {
        children_id,
      },
      returning: true,
    }
  );

  await GrowthModel.update(
    {
      id: growthId,
      children_id,
      date: date_of_birth,
      age,
      weight: birth_weight,
      wfa_status,
      height: birth_height,
      hfa_status,
      wfh_status,
      head_circum: birth_head_circum,
      arm_circum: birth_arm_circum,
      note: "Pengukuran Saat Bayi Lahir",
    },
    {
      where: {
        id: growthId,
      },
    }
  );

  return updatedData[0];
}

module.exports = {
  addChildren,
  getChildren,
  getChildrenById,
  getChildrenByParentId,
  getChildrenByParentIdAndChildrenId,
  getChildrenByNameAndParentId,
  getChildrenByName,
  getChildrenByRegion,
  getChildrenByNameAndRegion,
  updateChildren,
};
