module.exports = app => {
    const expenses = require("../controllers/expenses.controller.js");

    var router = require("express").Router();

    // Create a new Tutorial
    router.post("/", expenses.create);

    // Retrieve all Tutorials
    router.get("/", expenses.findAll);

    // Retrieve all published Tutorials
    router.get("/published", expenses.findAllPublished);

    // Retrieve a single Tutorial with id
    router.get("/:id", expenses.findOne);

    // // Update a Tutorial with id
    router.put("/:id", expenses.update);

    // // Delete a Tutorial with id
    router.delete("/:id", expenses.delete);

    // Delete all Tutorials
    router.delete("/", expenses.deleteAll);

    app.use('/api/expenses', router);
};