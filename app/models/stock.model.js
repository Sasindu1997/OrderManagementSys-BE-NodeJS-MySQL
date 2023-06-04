module.exports = (sequelize, Sequelize) => {
    const Stock = sequelize.define("stock", {
        productId: {
            type: Sequelize.INTEGER
        },
        quantity: {
            type: Sequelize.INTEGER
        },
        categoryId: {
            type: Sequelize.INTEGER
        },
        userId: {
            type: Sequelize.INTEGER
        },
        subcategoryId: {
            type: Sequelize.INTEGER
        },
        measuredUnit: {
            type: Sequelize.STRING
        },
        minimumQuantity: {
            type: Sequelize.INTEGER
        },
        maximumQuantity: {
            type: Sequelize.INTEGER
        },
        reorderPoint: {
            type: Sequelize.STRING
        },
        isActive: {
            type: Sequelize.BOOLEAN
        },
    });

    return Stock;
};