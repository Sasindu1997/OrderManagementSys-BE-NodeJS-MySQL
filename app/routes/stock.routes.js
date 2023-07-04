module.exports = app => {
    const stocks = require("../controllers/stocks.controller.js");

    var router = require("express").Router();

    // Create a new Stock
    router.post("/", stocks.create);

    // Retrieve all Stocks
    router.get("/", stocks.findAll);

    // Retrieve all published Stocks
    router.get("/published", stocks.findAllPublished);

    // Retrieve a single Stock with id
    router.get("/:id", stocks.findOne);

    // Retrieve a Stock with product id
    router.get("/byproduct/:id", stocks.findByProductId);

    // // Update a Stock with id
    router.put("/:id", stocks.update);

    // // Delete a Stock with id
    router.delete("/:id", stocks.delete);

    // Delete all Stocks
    router.delete("/", stocks.deleteAll);

    app.use('/api/stocks', router);
};