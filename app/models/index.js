const dbConfig = require("../config/db.config.js");

const Sequelize = require("sequelize");
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
    host: dbConfig.HOST,
    dialect: dbConfig.dialect,
    operatorsAliases: false,

    pool: {
        max: dbConfig.pool.max,
        min: dbConfig.pool.min,
        acquire: dbConfig.pool.acquire,
        idle: dbConfig.pool.idle
    }
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.tutorials = require("./tutorial.model.js")(sequelize, Sequelize);
db.orders = require("./order.model.js")(sequelize, Sequelize);
db.categories = require("./category.model.js")(sequelize, Sequelize);
db.customers = require("./customer.model.js")(sequelize, Sequelize);
db.products = require("./product.model.js")(sequelize, Sequelize);
db.rowMatterials = require("./rawMatterial.model.js")(sequelize, Sequelize);
db.stocks = require("./stock.model.js")(sequelize, Sequelize);
db.users = require("./user.model.js")(sequelize, Sequelize);
db.subCategories = require("./subCategory.model.js")(sequelize, Sequelize);

db.categories.hasMany(db.subCategories, { as: 'category', foreignKey: 'categoryId' });
db.subCategories.belongsTo(db.categories, { foreignKey: 'categoryId' });

db.products.hasMany(db.orders, { as: 'products', foreignKey: 'productId' });
db.users.hasMany(db.orders, { as: 'user', foreignKey: 'userId' });
db.customers.hasMany(db.orders, { as: 'customer', foreignKey: 'customerId' });
// db.products.belongsTo(db.orders, { as: 'products', foreignKey: 'productId' });

module.exports = db;