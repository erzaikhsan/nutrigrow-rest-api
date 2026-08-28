const { Router } = require("express");
const UserRoute = require("./user.route");
const AuthRoute = require("./auth.route");
const OfficerRoute = require("./officer.route");
const ParentRoute = require("./parent.route");
const ChildrenRoute = require("./children.route");
const GrowthRoute = require("./growth.route");
const EventRoute = require("./event.route");
const VaccineRoute = require("./vaccine.route");
// const CheckRoute = require("./check.route");
const ReportRoute = require("./report.route");

const router = Router();
router.use("/user", UserRoute);
router.use("/auth", AuthRoute);
router.use("/officer", OfficerRoute);
router.use("/parent", ParentRoute);
router.use("/children", ChildrenRoute);
router.use("/growth", GrowthRoute);
router.use("/event", EventRoute);
router.use("/vaccine", VaccineRoute);
// router.use("/check", CheckRoute);
router.use("/report", ReportRoute);

module.exports = router;
