const {
  WFA_WHO_REFERENCE,
  HFA_WHO_REFERENCE,
  WFH_WHO_REFERENCE,
} = require("./who_reference");

//Labeling Kemenkes
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

// 0: { median: 49.1, sd1: 51.0, sd2: 53.7, sd3: 55.6, sdNeg1: 47.3, sdNeg2: 45.4, sdNeg3: 43.6},
//     1: { median: 53.7, sd1: 55.6, sd2: 58.6, sd3: 60.6, sdNeg1: 51.7, sdNeg2: 49.8, sdNeg3: 47.8},
//     2: { median: 57.1, sd1: 59.1, sd2: 62.4, sd3: 64.4, sdNeg1: 55.0, sdNeg2: 53.0, sdNeg3: 51.0},
//     3: { median: 59.8, sd1: 61.9, sd2: 65.5, sd3: 67.6, sdNeg1: 57.7, sdNeg2: 55.6, sdNeg3: 53.5},
//     4: { median: 62.1, sd1: 64.3, sd2: 68.0, sd3: 70.1, sdNeg1: 59.9, sdNeg2: 57.8, sdNeg3: 55.6},
//     5: { median: 64.0, sd1: 66.2, sd2: 70.1, sd3: 72.2, sdNeg1: 61.8, sdNeg2: 59.6, sdNeg3: 57.4},
//     6: { median: 65.7, sd1: 68.0, sd2: 71.9, sd3: 74.0, sdNeg1: 63.5, sdNeg2: 61.2, sdNeg3: 58.9},
//     7: { median: 67.3, sd1: 69.6, sd2: 73.5, sd3: 75.7, sdNeg1: 65.0, sdNeg2: 62.7, sdNeg3: 60.3},
//     8: { median: 68.7, sd1: 71.1, sd2: 75.0, sd3: 77.2, sdNeg1: 66.4, sdNeg2: 64.0, sdNeg3: 61.7},
//     9: { median: 70.1, sd1: 72.6, sd2: 76.5, sd3: 78.7, sdNeg1: 67.7, sdNeg2: 65.3, sdNeg3: 62.9},
//     10: { median: 71.5, sd1: 73.9, sd2: 77.9, sd3: 80.1, sdNeg1: 69.0, sdNeg2: 66.5, sdNeg3: 64.1},
//     11: { median: 72.8, sd1: 75.3, sd2: 79.2, sd3: 81.5, sdNeg1: 70.3, sdNeg2: 67.7, sdNeg3: 65.2},
//     12: { median: 74.0, sd1: 76.6, sd2: 80.5, sd3: 82.9, sdNeg1: 71.4, sdNeg2: 68.9, sdNeg3: 66.3},
//     13: { median: 75.2, sd1: 77.8, sd2: 81.8, sd3: 84.2, sdNeg1: 72.6, sdNeg2: 70.0, sdNeg3: 67.3},
//     14: { median: 76.4, sd1: 79.1, sd2: 83.0, sd3: 85.5, sdNeg1: 73.7, sdNeg2: 71.0, sdNeg3: 68.3},
//     15: { median: 77.5, sd1: 80.2, sd2: 84.2, sd3: 86.7, sdNeg1: 74.8, sdNeg2: 72.0, sdNeg3: 69.3},
//     16: { median: 78.6, sd1: 81.4, sd2: 85.4, sd3: 88.0, sdNeg1: 75.8, sdNeg2: 73.0, sdNeg3: 70.2},
//     17: { median: 79.7, sd1: 82.5, sd2: 86.5, sd3: 89.2, sdNeg1: 76.8, sdNeg2: 74.0, sdNeg3: 71.1},
//     18: { median: 80.7, sd1: 83.6, sd2: 87.7, sd3: 90.4, sdNeg1: 77.8, sdNeg2: 74.9, sdNeg3: 72.0},
//     19: { median: 81.7, sd1: 84.7, sd2: 88.8, sd3: 91.5, sdNeg1: 78.8, sdNeg2: 75.8, sdNeg3: 72.8},
//     20: { median: 82.7, sd1: 85.7, sd2: 89.8, sd3: 92.6, sdNeg1: 79.7, sdNeg2: 76.7, sdNeg3: 73.7},
//     21: { median: 83.7, sd1: 86.7, sd2: 90.9, sd3: 93.8, sdNeg1: 80.6, sdNeg2: 77.5, sdNeg3: 74.5},
//     22: { median: 84.6, sd1: 87.7, sd2: 91.9, sd3: 94.9, sdNeg1: 81.5, sdNeg2: 78.4, sdNeg3: 75.2},
//     23: { median: 85.5, sd1: 88.7, sd2: 92.9, sd3: 95.9, sdNeg1: 82.3, sdNeg2: 79.2, sdNeg3: 76.0},
//     24: { median: 86.4, sd1: 89.6, sd2: 93.9, sd3: 97.0, sdNeg1: 83.2, sdNeg2: 80.0, sdNeg3: 76.7},
//     25: { median: 86.6, sd1: 89.9, sd2: 94.2, sd3: 97.3, sdNeg1: 83.3, sdNeg2: 80.0, sdNeg3: 76.8},
//     26: { median: 87.4, sd1: 90.8, sd2: 95.2, sd3: 98.3, sdNeg1: 84.1, sdNeg2: 80.8, sdNeg3: 77.5},
//     27: { median: 88.3, sd1: 91.7, sd2: 96.1, sd3: 99.3, sdNeg1: 84.9, sdNeg2: 81.5, sdNeg3: 78.1},
//     28: { median: 89.1, sd1: 92.5, sd2: 97.0, sd3: 100.3, sdNeg1: 85.7, sdNeg2: 82.2, sdNeg3: 78.8},
//     29: { median: 89.9, sd1: 93.4, sd2: 97.9, sd3: 101.2, sdNeg1: 86.4, sdNeg2: 82.9, sdNeg3: 79.5},
//     30: { median: 90.7, sd1: 94.2, sd2: 98.7, sd3: 102.1, sdNeg1: 87.1, sdNeg2: 83.6, sdNeg3: 80.1},
//     31: { median: 91.4, sd1: 95.0, sd2: 99.6, sd3: 103.0, sdNeg1: 87.9, sdNeg2: 84.3, sdNeg3: 80.7},
//     32: { median: 92.2, sd1: 95.8, sd2: 100.4, sd3: 103.9, sdNeg1: 88.6, sdNeg2: 84.9, sdNeg3: 81.3},
//     33: { median: 92.9, sd1: 96.6, sd2: 101.2, sd3: 104.8, sdNeg1: 89.3, sdNeg2: 85.6, sdNeg3: 81.9},
//     34: { median: 93.6, sd1: 97.4, sd2: 102.0, sd3: 105.6, sdNeg1: 89.9, sdNeg2: 86.2, sdNeg3: 82.5},
//     35: { median: 94.4, sd1: 98.1, sd2: 102.7, sd3: 106.4, sdNeg1: 90.6, sdNeg2: 86.8, sdNeg3: 83.1},
//     36: { median: 95.1, sd1: 98.9, sd2: 103.5, sd3: 107.2, sdNeg1: 91.2, sdNeg2: 87.4, sdNeg3: 83.6},
//     37: { median: 95.7, sd1: 99.6, sd2: 104.2, sd3: 108.0, sdNeg1: 91.9, sdNeg2: 88.0, sdNeg3: 84.2},
//     38: { median: 96.4, sd1: 100.3, sd2: 105.0, sd3: 108.8, sdNeg1: 92.5, sdNeg2: 88.6, sdNeg3: 84.7},
//     39: { median: 97.1, sd1: 101.0, sd2: 105.7, sd3: 109.5, sdNeg1: 93.1, sdNeg2: 89.2, sdNeg3: 85.3},
//     40: { median: 97.7, sd1: 101.7, sd2: 106.4, sd3: 110.3, sdNeg1: 93.8, sdNeg2: 89.8, sdNeg3: 85.8},
//     41: { median: 98.4, sd1: 102.4, sd2: 107.1, sd3: 111.0, sdNeg1: 94.4, sdNeg2: 90.4, sdNeg3: 86.3},
//     42: { median: 99.0, sd1: 103.1, sd2: 107.8, sd3: 111.7, sdNeg1: 95.0, sdNeg2: 90.9, sdNeg3: 86.8},
//     43: { median: 99.7, sd1: 103.8, sd2: 108.5, sd3: 112.5, sdNeg1: 95.6, sdNeg2: 91.5, sdNeg3: 87.4},
//     44: { median: 100.3, sd1: 104.5, sd2: 109.1, sd3: 113.2, sdNeg1: 96.2, sdNeg2: 92.0, sdNeg3: 87.9},
//     45: { median: 100.9, sd1: 105.1, sd2: 109.8, sd3: 113.9, sdNeg1: 96.7, sdNeg2: 92.5, sdNeg3: 88.4},
//     46: { median: 101.5, sd1: 105.8, sd2: 110.4, sd3: 114.6, sdNeg1: 97.3, sdNeg2: 93.1, sdNeg3: 88.9},
//     47: { median: 102.1, sd1: 106.4, sd2: 111.1, sd3: 115.2, sdNeg1: 97.9, sdNeg2: 93.6, sdNeg3: 89.3},
//     48: { median: 102.7, sd1: 107.0, sd2: 111.7, sd3: 115.9, sdNeg1: 98.4, sdNeg2: 94.1, sdNeg3: 89.8},
//     49: { median: 103.3, sd1: 107.7, sd2: 112.4, sd3: 116.6, sdNeg1: 99.0, sdNeg2: 94.6, sdNeg3: 90.3},
//     50: { median: 103.9, sd1: 108.3, sd2: 113.0, sd3: 117.3, sdNeg1: 99.5, sdNeg2: 95.1, sdNeg3: 90.7},
//     51: { median: 104.5, sd1: 108.9, sd2: 113.6, sd3: 117.9, sdNeg1: 100.1, sdNeg2: 95.6, sdNeg3: 91.2},
//     52: { median: 105.0, sd1: 109.5, sd2: 114.2, sd3: 118.6, sdNeg1: 100.6, sdNeg2: 96.1, sdNeg3: 91.7},
//     53: { median: 105.6, sd1: 110.1, sd2: 114.9, sd3: 119.2, sdNeg1: 101.1, sdNeg2: 96.6, sdNeg3: 92.1},
//     54: { median: 106.2, sd1: 110.7, sd2: 115.5, sd3: 119.9, sdNeg1: 101.6, sdNeg2: 97.1, sdNeg3: 92.6},
//     55: { median: 106.7, sd1: 111.3, sd2: 116.1, sd3: 120.6, sdNeg1: 102.2, sdNeg2: 97.6, sdNeg3: 93.0},
//     56: { median: 107.3, sd1: 111.9, sd2: 116.7, sd3: 121.2, sdNeg1: 102.7, sdNeg2: 98.1, sdNeg3: 93.4},
//     57: { median: 107.8, sd1: 112.5, sd2: 117.4, sd3: 121.9, sdNeg1: 103.2, sdNeg2: 98.5, sdNeg3: 93.9},
//     58: { median: 108.4, sd1: 113.0, sd2: 118.0, sd3: 122.6, sdNeg1: 103.7, sdNeg2: 99.0, sdNeg3: 94.3},
//     59: { median: 108.9, sd1: 113.6, sd2: 118.6, sd3: 123.2, sdNeg1: 104.2, sdNeg2: 99.5, sdNeg3: 94.7},
//     60: { median: 109.4, sd1: 114.2, sd2: 119.2, sd3: 123.9, sdNeg1: 104.7, sdNeg2: 99.9, sdNeg3: 95.2},
