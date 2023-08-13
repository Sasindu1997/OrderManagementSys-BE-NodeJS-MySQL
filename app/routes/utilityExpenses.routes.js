module.exports = app => {
    const utilityExpenses = require("../controllers/utilityExpenses.controller.js");

    var router = require("express").Router();

    // Create a new Tutorial
    router.post("/", utilityExpenses.create);

    // Retrieve all Tutorials
    router.get("/", utilityExpenses.findAll);

    // Retrieve all published Tutorials
    router.get("/published", utilityExpenses.findAllPublished);

    // Retrieve a single Tutorial with id
    router.get("/:id", utilityExpenses.findOne);

    // // Update a Tutorial with id
    router.put("/:id", utilityExpenses.update);

    // // Delete a Tutorial with id
    router.delete("/:id", utilityExpenses.delete);

    // Delete all Tutorials
    router.delete("/", utilityExpenses.deleteAll);

    app.use('/api/utilityExpenses', router);
};