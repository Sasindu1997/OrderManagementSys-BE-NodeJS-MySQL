module.exports = app => {
    const chemicals = require("../controllers/chemicals.controller.js");

    var router = require("express").Router();

    // Create a new Tutorial
    router.post("/", chemicals.create);

    // Retrieve all Tutorials
    router.get("/", chemicals.findAll);

    // Retrieve all published Tutorials
    router.get("/published", chemicals.findAllPublished);

    // Retrieve a single Tutorial with id
    router.get("/:id", chemicals.findOne);

    // // Update a Tutorial with id
    router.put("/:id", chemicals.update);

    // // Delete a Tutorial with id
    router.delete("/:id", chemicals.delete);

    // Delete all Tutorials
    router.delete("/", chemicals.deleteAll);

    app.use('/api/chemicals', router);
};