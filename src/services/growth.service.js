const { GrowthRepository, ChildrenRepository } = require("../repositories");
const {
  calculateWFA,
  calculateHFA,
  calculateWFH,
} = require("../utils/growth_standards");

const { v4: uuidv4 } = require("uuid");

async function addGrowth(params) {
  const { children_id, date, weight, height, head_circum, arm_circum, note } =
    params;

  const childExist = await ChildrenRepository.getChildrenById(children_id);
  if (!childExist) {
    throw new Error(404);
  }

  const month = new Date(date).getMonth();
  const year = new Date(date).getFullYear();

  const growthExist = await GrowthRepository.getGrowthByMonthYearAndChildId(
    children_id,
    month,
    year
  );

  if (growthExist.length >= 1) {
    throw new Error(409);
  }

  let gapYear =
    new Date(date).getFullYear() -
    new Date(childExist.date_of_birth).getFullYear();
  let gapMonth =
    new Date(date).getMonth() - new Date(childExist.date_of_birth).getMonth();

  if (gapMonth < 0) {
    gapYear--;
    gapMonth += 12;
  }

  const id = uuidv4();

  const age = gapYear * 12 + gapMonth;
  const wfaStatus = calculateWFA(age, parseFloat(weight), childExist.gender);
  const hfaStatus = calculateHFA(age, parseFloat(height), childExist.gender);
  const wfhStatus = calculateWFH(
    age,
    parseFloat(weight),
    parseFloat(height),
    childExist.gender
  );
  console.log("WFHStatus", wfhStatus);

  const growth = await GrowthRepository.addGrowth({
    id,
    children_id,
    date,
    age,
    region: childExist.region,
    weight: parseFloat(weight),
    wfa_status: wfaStatus,
    height: parseFloat(height),
    hfa_status: hfaStatus,
    wfh_status: wfhStatus,
    head_circum: parseFloat(head_circum),
    arm_circum: parseFloat(arm_circum),
    note,
  });

  return growth;
}

async function getGrowth() {
  const growth = await GrowthRepository.getGrowth();
  if (!growth) {
    throw new Error(404);
  }

  return growth;
}

async function getGrowthById(id) {
  const growth = await GrowthRepository.getGrowthById(id);
  if (!growth) {
    throw new Error(404);
  }

  return growth;
}

async function getGrowthByChildId(childId) {
  const childExist = await ChildrenRepository.getChildrenById(childId);
  if (!childExist) {
    throw new Error(404);
  }

  const growth = await GrowthRepository.getGrowthByChildId(childId);
  if (!growth) {
    throw new Error(404);
  }

  return growth;
}

async function getGrowthByMonthYearAndChildId(children_id, date) {
  const month = new Date(date).getMonth();
  const year = new Date(date).getFullYear();

  const growth = await GrowthRepository.getGrowthByMonthYearAndChildId(
    children_id,
    month,
    year
  );
  if (!growth) {
    throw new Error(404);
  }

  return growth;
}

async function getLastGrowthByChildId(children_id) {
  const growth = await GrowthRepository.getLastGrowthByChildId(children_id);
  if (!growth) {
    throw new Error(404);
  }

  return growth;
}

// async function getGrowthOnMonth(date) {
//   const month = new Date(date).getMonth();
//   const year = new Date(date).getFullYear();

//   const growth = await GrowthRepository.getGrowthOnMonth(month, year);
//   if (!growth) {
//     throw new Error(404);
//   }

//   return growth;
// }

async function updateGrowth(data) {
  const {
    id,
    children_id,
    date,
    region,
    weight,
    height,
    head_circum,
    arm_circum,
    note,
  } = data;

  const childExist = await ChildrenRepository.getChildrenById(children_id);
  if (!childExist) {
    throw new Error(404);
  }

  const month = new Date(date).getMonth();
  const year = new Date(date).getFullYear();

  const growthExist = await GrowthRepository.getGrowthByMonthYearAndChildId(
    children_id,
    month,
    year
  );

  if (growthExist.length === 1 && growthExist[0].id !== id) {
    throw new Error(409);
  }

  const growth = await GrowthRepository.getGrowthById(id);
  if (!growth) {
    throw new Error(404);
  }

  let gapYear =
    new Date(date).getFullYear() -
    new Date(childExist.date_of_birth).getFullYear();
  let gapMonth =
    new Date(date).getMonth() - new Date(childExist.date_of_birth).getMonth();

  if (gapMonth < 0) {
    gapYear--;
    gapMonth += 12;
  }

  const age = gapYear * 12 + gapMonth;
  const wfaStatus = calculateWFA(age, parseFloat(weight), childExist.gender);
  const hfaStatus = calculateHFA(age, parseFloat(height), childExist.gender);
  const wfhStatus = calculateWFH(
    age,
    parseFloat(weight),
    parseFloat(height),
    childExist.gender
  );

  return GrowthRepository.updateGrowth({
    id,
    date,
    age,
    region: growth.region,
    weight: parseFloat(weight),
    wfa_status: wfaStatus,
    height: parseFloat(height),
    hfa_status: hfaStatus,
    wfh_status: wfhStatus,
    head_circum: parseFloat(head_circum),
    arm_circum: parseFloat(arm_circum),
    note,
  });
}

async function deleteGrowth(id) {
  const growth = await GrowthRepository.getGrowthById(id);
  if (!growth) {
    throw new Error(404);
  }

  await GrowthRepository.deleteGrowth(id);

  return growth;
}

module.exports = {
  addGrowth,
  getGrowth,
  getGrowthById,
  getGrowthByChildId,
  getGrowthByMonthYearAndChildId,
  // getGrowthOnMonth,
  updateGrowth,
  getLastGrowthByChildId,
  deleteGrowth,
};
