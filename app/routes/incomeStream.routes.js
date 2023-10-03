module.exports = app => {
    const incomeStream = require("../controllers/incomeStream.controller");

    var router = require("express").Router();

    // Create a new Tutorial
    router.post("/", incomeStream.create);

    // Retrieve all Tutorials
    router.get("/", incomeStream.findAll);

    // Retrieve a single Tutorial with id
    router.get("/:id", incomeStream.findOne);

    // // Update a Tutorial with id
    router.put("/:id", incomeStream.update);

    // // Delete a Tutorial with id
    router.delete("/:id", incomeStream.delete);

    app.use('/api/incomeStream', router);
};