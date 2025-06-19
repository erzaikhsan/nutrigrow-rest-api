const {
  ChildrenRepository,
  ParentRepository,
  GrowthRepository,
} = require("../repositories");
const {
  calculateWFA,
  calculateHFA,
  calculateWFH,
} = require("../utils/growth_standards");

const { v4: uuidv4 } = require("uuid");

async function addChildren(params) {
  const {
    parents_id,
    full_name,
    gender,
    place_of_birth,
    date_of_birth,
    father,
    mother,
    region,
    birth_weight,
    birth_height,
    birth_head_circum,
  } = params;

  const childExist = await ChildrenRepository.getChildrenByNameAndParentId(
    full_name,
    parents_id
  );
  if (childExist.length > 0) {
    throw new Error(409);
  }

  const id = uuidv4();
  const growthId = uuidv4();

  const age = 0;
  const birth_arm_circum = 0;
  const wfaStatus = calculateWFA(age, parseFloat(birth_weight), gender);
  const hfaStatus = calculateHFA(age, parseFloat(birth_height), gender);
  const wfhStatus = calculateWFH(
    age,
    parseFloat(birth_weight),
    parseFloat(birth_height),
    gender
  );

  const children = await ChildrenRepository.addChildren({
    children_id: id,
    parents_id,
    full_name,
    gender,
    place_of_birth,
    date_of_birth,
    father,
    mother,
    region,
    growthId,
    age,
    birth_weight: parseFloat(birth_weight),
    wfa_status: wfaStatus,
    birth_height: parseFloat(birth_height),
    hfa_status: hfaStatus,
    wfh_status: wfhStatus,
    birth_head_circum: parseFloat(birth_head_circum),
    birth_arm_circum,
  });

  return children;
}

async function getChildren() {
  const children = await ChildrenRepository.getChildren();
  if (!children) {
    throw new Error(404);
  }

  return children;
}

async function getChildrenById(id) {
  const children = await ChildrenRepository.getChildrenById(id);
  if (!children) {
    throw new Error(404);
  }

  return children;
}

async function getChildrenByParentId(parentId) {
  const parent = await ParentRepository.getParentById(parentId);
  if (!parent) {
    throw new Error(404);
  }

  const children = await ChildrenRepository.getChildrenByParentId(parentId);
  if (!children) {
    throw new Error(404);
  }

  return children;
}

async function getChildrenByName(name) {
  const children = await ChildrenRepository.getChildrenByName(name);
  if (!children) {
    throw new Error(404);
  }

  return children;
}

async function getChildrenByRegion(region) {
  const children = await ChildrenRepository.getChildrenByRegion(region);
  if (!children) {
    throw new Error(404);
  }

  return children;
}

async function getChildrenByNameAndRegion(name, region) {
  const children = await ChildrenRepository.getChildrenByNameAndRegion(
    name,
    region
  );
  if (!children) {
    throw new Error(404);
  }

  return children;
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
    region,
    birth_weight,
    birth_height,
    birth_head_circum,
  } = data;

  const childExist = await ChildrenRepository.getChildrenById(children_id);
  if (!childExist) {
    throw new Error(403);
  }

  const month = new Date(childExist.dataValues.date_of_birth).getMonth();
  const year = new Date(childExist.dataValues.date_of_birth).getFullYear();

  const growthExist = await GrowthRepository.getGrowthByMonthYearAndChildId(
    children_id,
    month,
    year
  );
  if (!growthExist) {
    throw new Error(404);
  }

  const age = 0;
  const birth_arm_circum = 0;
  const wfaStatus = calculateWFA(age, parseFloat(birth_weight), gender);
  const hfaStatus = calculateHFA(age, parseFloat(birth_height), gender);
  const wfhStatus = calculateWFH(
    age,
    parseFloat(birth_weight),
    parseFloat(birth_height),
    gender
  );

  const children = await ChildrenRepository.getChildrenById(children_id);
  if (!children) {
    throw new Error(404);
  }

  return ChildrenRepository.updateChildren({
    children_id,
    full_name,
    gender,
    place_of_birth,
    date_of_birth,
    father,
    mother,
    region,
    birth_weight: parseFloat(birth_weight),
    wfa_status: wfaStatus,
    birth_height: parseFloat(birth_height),
    hfa_status: hfaStatus,
    wfh_status: wfhStatus,
    birth_head_circum: parseFloat(birth_head_circum),
    birth_arm_circum,
    growthId: growthExist[0].dataValues.id,
    age,
  });
}

module.exports = {
  addChildren,
  getChildren,
  getChildrenById,
  getChildrenByParentId,
  getChildrenByName,
  getChildrenByRegion,
  getChildrenByNameAndRegion,
  updateChildren,
};
