module.exports = app => {
    const chemStream = require("../controllers/chemStream.controller");

    var router = require("express").Router();

    // Create a new Tutorial
    router.post("/", chemStream.create);

    // Retrieve all Tutorials
    router.get("/", chemStream.findAll);

    // Retrieve a single Tutorial with id
    router.get("/:id", chemStream.findOne);

    // // Update a Tutorial with id
    router.put("/:id", chemStream.update);

    // // Delete a Tutorial with id
    router.delete("/:id", chemStream.delete);

    app.use('/api/chemStream', router);
};