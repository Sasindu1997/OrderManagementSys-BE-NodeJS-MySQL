module.exports = app => {
    const orders = require("../controllers/oorder.controller.js");

    var router = require("express").Router();

    // Create a new Tutorial
    router.post("/", orders.create);

    // Retrieve all Tutorials
    router.get("/:limit/:offset", orders.findAll);

    router.get("/findAllBySupplier/:id", orders.findAllBySupplier);

    router.get("/multipleSearch/:limit/:offset", orders.multipleSearch);

    router.get("/multipleSearchC", orders.multipleSearchC);

    router.get("/multipleSearchReport", orders.multipleSearchReport);

    router.get("/multipleSearchDash", orders.multipleSearchDash);

    router.get("/multipleSearchDashProd", orders.multipleSearchDashProd);

    router.get("/multipleSearchOrderCount", orders.multipleSearchOrderCount);

    router.get("/returned", orders.findAllReturned);

    router.get("/cancelled", orders.findAllCancelled);

    router.get("/exchanged", orders.findAllExchanged);

    // Retrieve all published Tutorials
    router.get("/published", orders.findAllPublished);

    // Retrieve a single Tutorial with id
    router.get("/:id", orders.findOne);

    // Retrieve a single order by supplierid
    router.get("/supplier/get/:id", orders.getOrdersBySupplierId2);

    // Retrieve a single Tutorial with id
    router.get("/barcodes", orders.searchTwo);

    // Retrieve a single Tutorial with id
    router.get("/:searchSelect/:searchvalue", orders.searchBy);

    // // Update a Tutorial with id
    router.put("/:id", orders.update);

    router.put("/cancel/:id", orders.cancelOrder);

    router.put("/exchange/:id", orders.exchangeOrder);

    router.put("/return/:id", orders.returnOrder);

    // // Delete a Tutorial with id
    router.delete("/:id", orders.delete);

    // Delete all Tutorials
    router.delete("/", orders.deleteAll);

    app.use('/api/orders', router);
};