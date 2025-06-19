const { ParentRepository } = require("../repositories");

async function getParents() {
  const parent = await ParentRepository.getParents();
  if (!parent) {
    throw new Error(404);
  }

  return parent;
}

async function getParentAccount(id) {
  const parent = await ParentRepository.getParentAccount(id);
  if (!parent) {
    throw new Error(404);
  }

  return parent;
}

async function getParentById(id) {
  const parent = await ParentRepository.getParentById(id);
  if (!parent) {
    throw new Error(404);
  }

  return parent;
}

async function getParentByName(name) {
  const parent = await ParentRepository.getParentByName(name);
  if (!parent) {
    throw new Error(404);
  }

  return parent;
}

async function getParentsByRegion(region) {
  const parent = await ParentRepository.getParentsByRegion(region);
  if (!parent) {
    throw new Error(404);
  }

  return parent;
}

async function updateParent(id, data) {
  const parent = await ParentRepository.getParentById(id);
  if (!parent) {
    throw new Error(404);
  }

  return ParentRepository.updateParent(id, data);
}

async function deleteParent(id) {
  const parent = await ParentRepository.getParentById(id);
  if (!parent) {
    throw new Error(404);
  }

  return ParentRepository.deleteParent(id);
}

module.exports = {
  getParents,
  getParentAccount,
  getParentById,
  getParentByName,
  getParentsByRegion,
  updateParent,
  deleteParent,
};
