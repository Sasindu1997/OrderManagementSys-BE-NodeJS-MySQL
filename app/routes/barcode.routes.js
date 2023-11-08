module.exports = app => {
    const orders = require("../controllers/oorder.controller.js");

    var router = require("express").Router();

    // Retrieve a single Tutorial with id
    router.get("/:id", orders.findOneByBarcodes);

    app.use('/api/barcode', router);
};