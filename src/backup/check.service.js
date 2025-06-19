const { CheckRepository, ParentRepository } = require("../repositories");
const { calculateHFA } = require("../utils/growth_standards");
// const tf = require("@tensorflow/tfjs");
const { v4: uuidv4 } = require("uuid");
// const path = require("path");

// async function loadModel(age, height, gender) {
//   // Perbaiki path model.json
//   // const modelPath =
//   //   "file://" + path.resolve(__dirname, "../backend/src/utils/model.json");

//   // console.log("Model Path:", modelPath);
//   const model = await tf.loadLayersModel(
//     "file://D:/AMIKOM/SKRIPSI/OnWork/App/backend/src/utils/model.json"
//   );

//   // Buat tensor input
//   const input = tf.tensor2d([[age, height, gender]], [1, 3]);

//   // Prediksi
//   const prediction = model.predict(input);
//   const result = prediction.dataSync(); // Mengambil hasil prediksi dalam bentuk array

//   console.log("Hasil Prediksi:", result);
//   return result[0]; // Ambil nilai pertama dari hasil prediksi
// }

// const tf = require('@tensorflow/tfjs-node');

// async function loadModel() {
//   try {
//     const model = await tf.loadLayersModel('file://tfjs_model/model.json');
//     return model;
//   } catch (error) {
//     console.error('Error loading model:', error);
//     throw error;
//   }
// }

// async function predict(input) {
//   try {
//     const model = await loadModel();
//     // Pastikan input dalam format yang benar
//     const tensorInput = tf.tensor2d([input], [1, 3]);
//     const prediction = await model.predict(tensorInput).array();
//     return prediction[0];
//   } catch (error) {
//     console.error('Error making prediction:', error);
//     throw error;
//   }
// }

async function addCheckUp(params) {
  const { parents_id, gender, age, height } = params;

  const parentExist = await ParentRepository.getParentById(parents_id);
  if (!parentExist) {
    throw new Error(409);
  }

  const id = uuidv4();
  const childAge = parseInt(age);
  const hfaStatus = calculateHFA(childAge, height, gender);

  // const hfaStatus = await loadModel(childAge, height, gender);

  const check = await CheckRepository.addCheckUp({
    id,
    parents_id,
    gender,
    age,
    height,
    hfa_status: hfaStatus,
  });

  return check;
}

async function getCheckUpById(id) {
  const check = await CheckRepository.getCheckUpById(id);
  if (!check) {
    throw new Error(404);
  }

  return check;
}

async function getCheckUpByParentId(parentId) {
  const parent = await ParentRepository.getParentById(parentId);
  if (!parent) {
    throw new Error(404);
  }

  const check = await CheckRepository.getCheckUpByParentId(parentId);
  if (!check) {
    throw new Error(404);
  }

  return check;
}

module.exports = {
  addCheckUp,
  getCheckUpById,
  getCheckUpByParentId,
};
