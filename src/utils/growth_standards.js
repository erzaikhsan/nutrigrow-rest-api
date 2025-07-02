const {
  WFA_WHO_REFERENCE,
  HFA_WHO_REFERENCE,
  WFH_WHO_REFERENCE,
} = require("./who_reference");

function calculateWFA(age, weight, gender) {
  const growthData = WFA_WHO_REFERENCE[gender][age];

  if (!growthData) {
    return "Unknown";
  }

  if (weight < growthData.sdNeg3) {
    return "Severely Underweight";
  } else if (weight >= growthData.sdNeg3 && weight < growthData.sdNeg2) {
    return "Underweight";
  } else if (weight >= growthData.sdNeg2 && weight <= growthData.sd2) {
    return "Normal";
  } else if (weight > growthData.sd2) {
    return "Overweight and Obese";
  } else {
    return "Unknown";
  }
}

function calculateHFA(age, height, gender) {
  const growthData = HFA_WHO_REFERENCE[gender][age];

  if (!growthData) {
    return "Unknown";
  }

  if (height < growthData.sdNeg3) {
    return "Severely Stunted";
  } else if (height >= growthData.sdNeg3 && height <= growthData.sdNeg2) {
    return "Stunted";
  } else if (height > growthData.sdNeg2) {
    return "Normal";
  } else {
    return "Unknown";
  }
}

function calculateWFH(age, weight, height, gender) {
  let ageGroup;
  if (age <= 24) {
    ageGroup = "under_2y";
  } else if (age > 24 && age <= 60) {
    ageGroup = "under_5y";
  } else {
    ageGroup = "5y_and_over";
  }

  const roundedHeight = Math.round(height * 2) / 2;

  const growthData = WFH_WHO_REFERENCE[gender][ageGroup][roundedHeight];

  if (!growthData) {
    return "Unknown";
  }

  if (weight < growthData.sdNeg3) {
    return "Severely Wasting";
  } else if (weight >= growthData.sdNeg3 && weight < growthData.sdNeg2) {
    return "Wasting";
  } else if (weight >= growthData.sdNeg2 && weight <= growthData.sd2) {
    return "Normal";
  } else if (weight > growthData.sd2) {
    return "Overweight and Obese";
  } else {
    return "Unknown";
  }
}

// //Labeling
// function calculateWFA(age, weight, gender) {
//   const growthData = WFA_WHO_REFERENCE[gender][age];

//   if (!growthData) {
//     return "Unknown";
//   }

//   if (weight < growthData.sdNeg3) {
//     return "Severely Underweight";
//   } else if (weight >= growthData.sdNeg3 && weight < growthData.sdNeg2) {
//     return "Underweight";
//   } else if (weight >= growthData.sdNeg2 && weight <= growthData.sd2) {
//     return "Normal";
//   } else if (weight >= growthData.sd2 && weight <= growthData.sd3) {
//     return "Risk of Overweight";
//   } else if (weight > growthData.sd3) {
//     return "Overweight";
//   } else {
//     return "Unknown";
//   }
// }

// function calculateHFA(age, height, gender) {
//   const growthData = HFA_WHO_REFERENCE[gender][age];

//   if (!growthData) {
//     return "Unknown";
//   }

//   if (height < growthData.sdNeg3) {
//     return "Severely Stunted";
//   } else if (height >= growthData.sdNeg3 && height < growthData.sdNeg2) {
//     return "Stunted";
//   } else if (height >= growthData.sdNeg2 && height <= growthData.sd2) {
//     return "Normal";
//   } else if (height >= growthData.sd2 && height <= growthData.sd3) {
//     return "Tall";
//   } else if (height > growthData.sd3) {
//     return "Abnormal";
//   } else {
//     return "Unknown";
//   }
// }

// function calculateWFH(age, weight, height, gender) {
//   let ageGroup;
//   if (age <= 24) {
//     ageGroup = "under_2y";
//   } else if (age > 24 && age <= 60) {
//     ageGroup = "under_5y";
//   } else {
//     ageGroup = "5y_and_over";
//   }

//   const growthData = WFH_WHO_REFERENCE[gender][ageGroup][height];

//   if (!growthData) {
//     return "Unknown";
//   }

//   if (weight < growthData.sdNeg3) {
//     return "Severely Wasted";
//   } else if (weight >= growthData.sdNeg3 && weight < growthData.sdNeg2) {
//     return "Wasted";
//   } else if (weight >= growthData.sdNeg2 && weight <= growthData.sdNeg1) {
//     return "Risk of Wasted";
//   } else if (weight >= growthData.sdNeg1 && weight <= growthData.sd1) {
//     return "Normal";
//   } else if (weight >= growthData.sd1 && weight <= growthData.sd2) {
//     return "Risk of Overweight";
//   } else if (weight >= growthData.sd2 && weight <= growthData.sd3) {
//     return "Overweight";
//   } else if (weight > growthData.sd3) {
//     return "Obese";
//   } else {
//     return "Unknown";
//   }
// }

module.exports = { calculateWFA, calculateHFA, calculateWFH };

//UJI COBA
// const height = 86;
// const weight = 8.3;
// const age = 24;
// const gender = "boy";

// console.log(
//   "Status Gizi Berdasarkan Berat Badan Per Usia: " +
//     calculateWFA(age, weight, gender)
// );
// console.log(
//   "Status Gizi Berdasarkan Tinggi Badan Per Usia: " +
//     calculateHFA(age, height, gender)
// );
// console.log(
//   "Status Gizi Berdasarkan Berat Badan Per Tinggi Badan: " +
//     calculateWFH(age, weight, height, gender)
// );
