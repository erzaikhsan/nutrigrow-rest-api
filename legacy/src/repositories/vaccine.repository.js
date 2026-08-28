const { VaccineModel } = require("../models");

async function addVaccine(params) {
  const { id, children_id, date, vaccine_name, place } = params;

  const vaccine = await VaccineModel.create({
    id,
    children_id,
    date,
    vaccine_name,
    place,
  });

  return vaccine;
}

async function getVaccineById(id) {
  return VaccineModel.findByPk(id, {
    attributes: ["id", "children_id", "date", "vaccine_name", "place"],
  });
}

async function getVaccineByNameAndChildId(name, childId) {
  return VaccineModel.findAll({
    attributes: ["id", "children_id", "date", "vaccine_name", "place"],
    where: {
      children_id: childId,
      vaccine_name: name,
    },
  });
}

async function getVaccineByChildId(childId) {
  return VaccineModel.findAll({
    attributes: ["id", "children_id", "date", "vaccine_name", "place"],
    where: {
      children_id: childId,
    },
  });
}

async function updateVaccine(data) {
  const { id, children_id, date, vaccine_name, place } = data;

  const [rowsUpdated, updatedData] = await VaccineModel.update(
    {
      id,
      children_id,
      date,
      vaccine_name,
      place,
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

async function deleteVaccine(id) {
  return await VaccineModel.destroy({
    where: {
      id: id,
    },
  });
}

module.exports = {
  addVaccine,
  getVaccineById,
  getVaccineByNameAndChildId,
  getVaccineByChildId,
  updateVaccine,
  deleteVaccine,
};
