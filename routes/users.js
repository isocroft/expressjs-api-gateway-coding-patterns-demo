const express = require("express");
const router = express.Router();

const container = require("../IoC-container");

/* GET users listing. */
router.get("/", function (req, res, next) {
  const { status } = req.query;
  container.UserModelRepository.fetchAll(["*"], (buidler) => {
    buidler.where("status", status);
  });
  res.send("respond with a resource");
});

module.exports = router;
