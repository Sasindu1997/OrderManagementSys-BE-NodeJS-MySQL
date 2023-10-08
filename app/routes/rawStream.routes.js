module.exports = app => {
    const rawStream = require("../controllers/rawStream.controller");

    var router = require("express").Router();

    // Create a new Tutorial
    router.post("/", rawStream.create);

    // Retrieve all Tutorials
    router.get("/", rawStream.findAll);

    // Retrieve a single Tutorial with id
    router.get("/:id", rawStream.findOne);

    // // Update a Tutorial with id
    router.put("/:id", rawStream.update);

    // // Delete a Tutorial with id
    router.delete("/:id", rawStream.delete);

    app.use('/api/rawStream', router);
};