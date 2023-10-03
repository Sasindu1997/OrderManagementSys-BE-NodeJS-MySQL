module.exports = app => {
    const upload = require("../controllers/upload.controller.js");
    const axios = require("axios");

    var router = require("express").Router();

    // Create a new Tutorial
    router.post("/", upload.sendToDelivery);
    // router.post('/', async(req, res) => {
    //     const apiPath = 'https://fardardomestic.com/api/p_request_v1.02.phps';
    //     const response = await axios.post(apiPath);
    //     res.json(response.data);
    // });

    // Retrieve all Tutorials
    // router.get("/", users.findAll);

    // Retrieve a single Tutorial with id
    // router.get("/:id", users.findOne);

    //https://app.capitaloneskincare.com/api/sendToDelivery/
    //http://localhost:8080/api/sendToDelivery

    app.use('/api/sendToDelivery', router);
};