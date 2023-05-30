module.exports = app => {
    const rawMats = require("../controllers/rawMatterial.controller.js");

    var router = require("express").Router();

    // Create a new Tutorial
    router.post("/", rawMats.create);

    // Retrieve all Tutorials
    router.get("/", rawMats.findAll);

    // Retrieve all published Tutorials
    router.get("/published", rawMats.findAllPublished);

    // Retrieve a single Tutorial with id
    router.get("/:id", rawMats.findOne);

    // // Update a Tutorial with id
    router.put("/:id", rawMats.update);

    // // Delete a Tutorial with id
    router.delete("/:id", rawMats.delete);

    // Delete all Tutorials
    router.delete("/", rawMats.deleteAll);

    app.use('/api/rawMats', router);
};