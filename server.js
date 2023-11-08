const express = require("express");
const cors = require("cors");

const app = express();

global.__basedir = __dirname;

var corsOptions = {
    origin: "http://localhost:8080"
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

//CORS
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

const db = require("./app/models");
db.sequelize.sync()
    .then(() => {
        console.log("Synced db.");
    })
    .catch((err) => {
        console.log("Failed to sync db: " + err.message);
    });

// db.sequelize.sync({ force: true }).then(() => {
//     console.log("Drop and re-sync db.");
// });

// simple route
app.get("/", (req, res) => {
    res.json({ message: "Welcome to Zenode application." });
});

//routes
require("./app/routes/turorial.routes")(app);
require("./app/routes/category.routes")(app);
require("./app/routes/order.routes")(app);
require("./app/routes/products.routes")(app);
require("./app/routes/customer.routes")(app);
require("./app/routes/rawMatterial.routes")(app);
require("./app/routes/stock.routes")(app);
require("./app/routes/subCategory.routes")(app);
require("./app/routes/user.routes")(app);
require("./app/routes/expenses.routes")(app);
require("./app/routes/upload.routes")(app);
require("./app/routes/chemicals.routes")(app);
require("./app/routes/dashboard.routes")(app);
require("./app/routes/delivery.routes")(app);
require("./app/routes/income.routes")(app);
require("./app/routes/utilityExpenses.routes")(app);
require("./app/routes/fardar.routes")(app);
require("./app/routes/smstext.routes")(app);
require("./app/routes/incomeStream.routes")(app);
require("./app/routes/expenseStream.routes")(app);
require("./app/routes/chemStream.routes")(app);
require("./app/routes/rawStream.routes")(app);
require("./app/routes/itemSuppliers.routes")(app);
require("./app/routes/barcode.routes")(app);

// set port, listen for requests
const PORT = process.env.PORT || 8080;
const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});