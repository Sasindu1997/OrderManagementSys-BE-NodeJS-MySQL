module.exports = app => {
    const orders = require("../controllers/orderr.controller.js");

    var router = require("express").Router();

    // Create a new Tutorial
    router.post("/", orders.create);

    // Retrieve all Tutorials
    router.get("/", orders.findAll);

    router.get("/returned", orders.findAllReturned);

    router.get("/cancelled", orders.findAllCancelled);


    // Retrieve all published Tutorials
    router.get("/published", orders.findAllPublished);

    // Retrieve a single Tutorial with id
    router.get("/:id", orders.findOne);

    // Retrieve a single Tutorial with id
    router.get("/barcode/:barcode", orders.findOneByBarcode);

    // Retrieve a single Tutorial with id
    router.get("/:searchSelect/:searchvalue", orders.searchBy);

    // // Update a Tutorial with id
    router.put("/:id", orders.update);

    router.put("/cancel/:id", orders.cancelOrder);

    router.put("/return/:id", orders.returnOrder);


    // // Delete a Tutorial with id
    router.delete("/:id", orders.delete);

    // Delete all Tutorials
    router.delete("/", orders.deleteAll);

    app.use('/api/orders', router);
};