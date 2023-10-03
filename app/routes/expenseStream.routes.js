module.exports = app => {
    const expenseStream = require("../controllers/expenseStream.controller");

    var router = require("express").Router();

    // Create a new Tutorial
    router.post("/", expenseStream.create);

    // Retrieve all Tutorials
    router.get("/", expenseStream.findAll);

    // Retrieve a single Tutorial with id
    router.get("/:id", expenseStream.findOne);

    // // Update a Tutorial with id
    router.put("/:id", expenseStream.update);

    // // Delete a Tutorial with id
    router.delete("/:id", expenseStream.delete);

    app.use('/api/expenseStream', router);
};