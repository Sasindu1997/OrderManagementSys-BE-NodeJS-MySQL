module.exports = app => {
    const orders = require("../controllers/order.controller.js");

    var router = require("express").Router();

    // Retrieve Counts
    router.get("/getAllProductOrders", orders.getAllProductOrders);

    router.get("/thisMonthOrderCount", orders.thisMonthOrderCount);

    router.get("/monthlyOrderCount", orders.monthlyOrderCount);

    router.get("/todayOrderCount", orders.todayOrderCount);

    router.get("/yearlyOrderCount", orders.yearlyOrderCount);

    router.get("/weeklyOrderCount", orders.weeklyOrderCount);

    router.get("/newCustomersCount", orders.newCustomersCount);

    app.use('/api/dashboard', router);
};