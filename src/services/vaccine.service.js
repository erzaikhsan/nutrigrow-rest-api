const { VaccineRepository, ChildrenRepository } = require("../repositories");
const { v4: uuidv4 } = require("uuid");

async function addVaccine(params) {
  const { children_id, date, vaccine_name } = params;

  const childExist = await ChildrenRepository.getChildrenById(children_id);
  if (!childExist) {
    throw new Error(404);
  }

  const vaccineExist = await VaccineRepository.getVaccineByNameAndChildId(
    vaccine_name,
    children_id
  );
  if (vaccineExist.length > 0) {
    throw new Error(409);
  }
  const id = uuidv4();

  const vaccine = await VaccineRepository.addVaccine({
    id,
    children_id,
    date,
    vaccine_name,
  });

  return vaccine;
}

async function getVaccineById(id) {
  const vaccine = await VaccineRepository.getVaccineById(id);
  if (!vaccine) {
    throw new Error(404);
  }

  return vaccine;
}

async function getVaccineByChildId(childId) {
  const childExist = await ChildrenRepository.getChildrenById(childId);
  if (!childExist) {
    throw new Error(404);
  }

  const vaccine = await VaccineRepository.getVaccineByChildId(childId);
  if (!vaccine) {
    throw new Error(404);
  }

  return vaccine;
}

async function updateVaccine(data) {
  const { id, children_id, date, vaccine_name } = data;

  const childExist = await ChildrenRepository.getChildrenById(children_id);
  if (!childExist) {
    throw new Error(404);
  }

  const vaccineExist = await VaccineRepository.getVaccineById(id);
  if (!vaccineExist) {
    throw new Error(404);
  }

  const newVaccine = await VaccineRepository.getVaccineByNameAndChildId(
    vaccine_name,
    children_id
  );

  if (newVaccine.some((vaccine) => vaccine.id !== id)) {
    throw new Error(409);
  }

  return VaccineRepository.updateVaccine({
    id,
    children_id,
    date,
    vaccine_name,
  });
}

async function deleteVaccine(id) {
  const vaccine = await VaccineRepository.getVaccineById(id);
  if (!vaccine) {
    throw new Error(404);
  }

  await VaccineRepository.deleteVaccine(id);

  return vaccine;
}

module.exports = {
  addVaccine,
  getVaccineById,
  getVaccineByChildId,
  updateVaccine,
  deleteVaccine,
};
