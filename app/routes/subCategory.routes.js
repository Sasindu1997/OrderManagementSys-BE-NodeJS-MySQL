module.exports = app => {
    const subCategory = require("../controllers/subCategory.controller.js");

    var router = require("express").Router();

    // Create a new Tutorial
    router.post("/", subCategory.create);

    // Retrieve all Tutorials
    router.get("/", subCategory.findAll);

    // Retrieve all published Tutorials
    router.get("/published", subCategory.findAllPublished);

    // Retrieve a single Tutorial with id
    router.get("/:id", subCategory.findOne);

    // // Update a Tutorial with id
    router.put("/:id", subCategory.update);

    // // Delete a Tutorial with id
    router.delete("/:id", subCategory.delete);

    // Delete all Tutorials
    router.delete("/", subCategory.deleteAll);

    app.use('/api/subCategory', router);
};