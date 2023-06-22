const express = require("express");
const router = express.Router();
const csvController = require("../controllers/upload.controller");
const upload = require("../middleware/upload");

let routes = (app) => {
    router.post("/upload", upload.single("file"), csvController.upload);
    router.get("/upload", csvController.getTutorials);

    app.use("/api/csv", router);
};

module.exports = routes;