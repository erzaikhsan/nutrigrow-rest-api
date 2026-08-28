const { UserRepository } = require("../repositories");

async function getUserById(id) {
  const user = await UserRepository.getUserById(id);
  if (!user) {
    throw new Error(404);
  }
  return user;
}

module.exports = {
  getUserById,
};
