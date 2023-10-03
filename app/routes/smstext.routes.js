module.exports = app => {
    const smstext = require("../controllers/smstext.controller");

    var router = require("express").Router();

    // Create a new Tutorial
    router.post("/", smstext.create);

    // Retrieve all Tutorials
    router.get("/", smstext.findAll);

    // Retrieve a single Tutorial with id
    router.get("/:id", smstext.findOne);

    // // Update a Tutorial with id
    router.put("/:id", smstext.update);

    // // Delete a Tutorial with id
    router.delete("/:id", smstext.delete);

    app.use('/api/smstext', router);
};