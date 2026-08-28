const { OfficerRepository } = require("../repositories");

async function getOfficers(uid) {
  const officer = await OfficerRepository.getOfficers(uid);
  if (!officer) {
    throw new Error(404);
  }

  return officer;
}

async function getOfficerAccount(id) {
  const officer = await OfficerRepository.getOfficerAccount(id);
  if (!officer) {
    throw new Error(404);
  }

  return officer;
}

async function getOfficerById(id) {
  const officer = await OfficerRepository.getOfficerById(id);
  if (!officer) {
    throw new Error(404);
  }

  return officer;
}

async function getOfficersByRegion(region) {
  const officer = await OfficerRepository.getOfficersByRegion(region);
  if (!officer) {
    throw new Error(404);
  }

  return officer;
}

async function updateOfficer(id, data) {
  const officer = await OfficerRepository.getOfficerById(id);
  if (!officer) {
    throw new Error(404);
  }

  return OfficerRepository.updateOfficer(id, data);
}

async function deleteOfficer(id) {
  const officer = await OfficerRepository.getOfficerById(id);
  if (!officer) {
    throw new Error(404);
  }

  return OfficerRepository.deleteOfficer(id);
}

module.exports = {
  getOfficers,
  getOfficerAccount,
  getOfficerById,
  getOfficersByRegion,
  updateOfficer,
  deleteOfficer,
};
