module.exports = app => {
    const itemSuppliers = require("../controllers/itemSuppliers.controller");

    var router = require("express").Router();

    // Create a new Tutorial
    router.post("/", itemSuppliers.create);

    // Retrieve all Tutorials
    router.get("/", itemSuppliers.findAll);

    // Retrieve a single Tutorial with id
    router.get("/:id", itemSuppliers.findOne);

    // // Update a Tutorial with id
    router.put("/:id", itemSuppliers.update);

    // // Delete a Tutorial with id
    router.delete("/:id", itemSuppliers.delete);

    app.use('/api/itemSuppliers', router);
};