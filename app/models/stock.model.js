module.exports = (sequelize, Sequelize) => {
    const Stock = sequelize.define("stock", {
        // ProductID: {
        //     type: Sequelize.BOOLEAN
        // },
        quantity: {
            type: Sequelize.INTEGER
        },
        // category: {
        //     type: Sequelize.INTEGER
        // },
        // userid: {
        //     type: Sequelize.INTEGER
        // },
        // subcategory: {
        //     type: Sequelize.INTEGER
        // },
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