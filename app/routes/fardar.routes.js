module.exports = app => {
    const upload = require("../controllers/upload.controller.js");

    var router = require("express").Router();

    // Create a new Tutorial
    router.post("/", upload.sendToDelivery);

    // Retrieve all Tutorials
    // router.get("/", users.findAll);

    // Retrieve a single Tutorial with id
    // router.get("/:id", users.findOne);

    app.use('/api/sendToDelivery', router);
};