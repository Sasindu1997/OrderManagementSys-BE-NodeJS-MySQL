module.exports = app => {
    const delivery = require("../controllers/delivery.controller.js");

    var router = require("express").Router();

    // Create a new Tutorial
    router.post("/", delivery.create);

    // Retrieve all Tutorials
    router.get("/", delivery.findAll);

    // Retrieve a single Tutorial with id
    router.get("/:id", delivery.findOne);

    // // Update a Tutorial with id
    router.put("/:id", delivery.update);

    // // Delete a Tutorial with id
    router.delete("/:id", delivery.delete);

    app.use('/api/delivery', router);
};