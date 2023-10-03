module.exports = app => {
    const income = require("../controllers/income.controller.js");

    var router = require("express").Router();

    // Create a new Tutorial
    router.post("/", income.create);

    // Retrieve all Tutorials
    router.get("/", income.findAll);

    router.get("/multipleSearch", income.multipleSearch);

    // Retrieve all published Tutorials
    router.get("/published", income.findAllPublished);

    // Retrieve a single Tutorial with id
    router.get("/:id", income.findOne);

    // // Update a Tutorial with id
    router.put("/:id", income.update);

    // // Delete a Tutorial with id
    router.delete("/:id", income.delete);

    // Delete all Tutorials
    router.delete("/", income.deleteAll);

    app.use('/api/income', router);
};