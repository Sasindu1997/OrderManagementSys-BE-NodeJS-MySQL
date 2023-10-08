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
db.sms = require("./sms.model.js")(sequelize, Sequelize);
db.incomeStream = require("./incomeStream.model.js")(sequelize, Sequelize);
db.expenseStream = require("./expenseStream.model.js")(sequelize, Sequelize);
db.chemStream = require("./chemStream.model.js")(sequelize, Sequelize);
db.rawStream = require("./rawStream.model.js")(sequelize, Sequelize);
db.orders = require("./order.model.js")(sequelize, Sequelize);
db.orderrs = require("./orderr.model.js")(sequelize, Sequelize);
db.oorders = require("./oorder.model.js")(sequelize, Sequelize);
db.customers = require("./customer.model.js")(sequelize, Sequelize);
db.products = require("./product.model.js")(sequelize, Sequelize);
db.rowMatterials = require("./rawMatterial.model.js")(sequelize, Sequelize);
db.stocks = require("./stock.model.js")(sequelize, Sequelize);
db.users = require("./user.model.js")(sequelize, Sequelize);
db.subCategories = require("./subCategory.model.js")(sequelize, Sequelize);
db.categories = require("./category.model.js")(sequelize, Sequelize);
db.expenses = require("./expenses.model.js")(sequelize, Sequelize);
db.utilityExpenses = require("./utilityExpenses.model.js")(sequelize, Sequelize);
db.income = require("./income.model.js")(sequelize, Sequelize);
db.chemicals = require("./chemicals.model.js")(sequelize, Sequelize);
db.deliveryOptions = require("./deliveryOptions.mode.js")(sequelize, Sequelize);

db.products.hasMany(db.orderrs, { foreignKey: 'orderId', targetKey: 'id' });
db.users.hasMany(db.orderrs, { foreignKey: 'orderId', targetKey: 'id' });
db.customers.hasMany(db.orderrs, { foreignKey: 'orderId', targetKey: 'id' });
db.orderrs.belongsTo(db.products, { foreignKey: 'orderId', targetKey: 'id' });
db.orderrs.belongsTo(db.users, { foreignKey: 'orderId', targetKey: 'id' });
db.orderrs.belongsTo(db.customers, { foreignKey: 'orderId', targetKey: 'id' });

db.products.hasMany(db.oorders, { foreignKey: 'orderId', targetKey: 'id' });
db.users.hasMany(db.oorders, { foreignKey: 'orderId', targetKey: 'id' });
db.customers.hasMany(db.oorders, { foreignKey: 'orderId', targetKey: 'id' });
db.oorders.belongsTo(db.products, { foreignKey: 'orderId', targetKey: 'id' });
db.oorders.belongsTo(db.users, { foreignKey: 'orderId', targetKey: 'id' });
db.oorders.belongsTo(db.customers, { foreignKey: 'orderId', targetKey: 'id' });

db.products.hasMany(db.orders, { foreignKey: 'orderId', targetKey: 'id' });
db.users.hasMany(db.orders, { foreignKey: 'orderId', targetKey: 'id' });
db.customers.hasMany(db.orders, { foreignKey: 'orderId', targetKey: 'id' });
db.orders.belongsTo(db.products, { foreignKey: 'orderId', targetKey: 'id' });
db.orders.belongsTo(db.users, { foreignKey: 'orderId', targetKey: 'id' });
db.orders.belongsTo(db.customers, { foreignKey: 'orderId', targetKey: 'id' });

db.categories.hasMany(db.stocks, { foreignKey: 'stockId', targetKey: 'id' });
db.stocks.belongsTo(db.categories, { foreignKey: 'stockId', targetKey: 'id' });
db.products.hasMany(db.stocks, { foreignKey: 'stockId', targetKey: 'id' });
db.stocks.belongsTo(db.products, { foreignKey: 'stockId', targetKey: 'id' });
db.users.hasMany(db.stocks, { foreignKey: 'stockId', targetKey: 'id' });
db.stocks.belongsTo(db.users, { foreignKey: 'stockId', targetKey: 'id' });
db.subCategories.hasMany(db.stocks, { foreignKey: 'stockId', targetKey: 'id' });
db.stocks.belongsTo(db.subCategories, { foreignKey: 'stockId', targetKey: 'id' });

db.subCategories.hasMany(db.products, { foreignKey: 'productId', targetKey: 'id' });
db.products.belongsTo(db.subCategories, { foreignKey: 'productId', targetKey: 'id' });
db.categories.hasMany(db.products, { foreignKey: 'productId', targetKey: 'id' });
db.products.belongsTo(db.categories, { foreignKey: 'productId', targetKey: 'id' });

db.categories.hasMany(db.subCategories, { foreignKey: 'categoryId', targetKey: 'id' });
db.subCategories.belongsTo(db.categories, { foreignKey: 'categoryId', targetKey: 'id' });

module.exports = db;