// const handle200Response = (res, message, result) => {
//   res.status(200).json({
//     status: "success",
//     message: message,
//     data: result
//   });
// };

// const handleSuccessUpdate = (res, result) => {
//   res.status(200).json({
//     status: "success",
//     message: "Updated successfully",
//     data: result,
//   });
// };

// const handleSuccessDelete = (res) => {
//   res.status(200).json({
//     status: "success",
//     message: "Deleted successfully",
//   });
// };

// const handle201Response = (res, result) => {
//   res.status(201).json({
//     status: "success",
//     message: "Created successfully",
//     data: result,
//   });
// };

const handle401Response = (res) => {
  res.status(401).json({
    success: false,
    message: "Incorrect input",
  });
};

const handle404Response = (res) => {
  res.status(404).json({
    success: false,
    message: "Not found",
  });
};

const handle403Response = (res) => {
  res.status(403).json({
    success: false,
    message: "You don't have access",
  });
};

const handle409Response = (res) => {
  res.status(409).json({
    success: false,
    message: "Already exists",
  });
};

const handle500Response = (res, error) => {
  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};

module.exports = {
  handle401Response,
  handle404Response,
  handle403Response,
  handle409Response,
  handle500Response,
};
