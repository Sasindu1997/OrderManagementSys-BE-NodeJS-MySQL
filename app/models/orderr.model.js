module.exports = (sequelize, Sequelize) => {
    const Orderr = sequelize.define("orderr", {
        customerId: {
            type: Sequelize.INTEGER
        },
        userId: {
            type: Sequelize.INTEGER
        },
        productId: {
            type: Sequelize.JSON,
            defaultValue: [],
        },
        productDetails: {
            type: Sequelize.JSON,
            defaultValue: [],
        },
        barcode: {
            type: Sequelize.STRING
        },
        weight: {
            type: Sequelize.FLOAT
        },
        itemCount: {
            type: Sequelize.INTEGER
        },
        paid: {
            type: Sequelize.BOOLEAN
        },
        total: {
            type: Sequelize.FLOAT
        },
        status: {
            type: Sequelize.STRING
        },
        shippingAddress: {
            type: Sequelize.STRING
        },
        paymentMethod: {
            type: Sequelize.STRING
        },
        shippingMethod: {
            type: Sequelize.STRING
        },
        trackingNumber: {
            type: Sequelize.STRING
        },
        exchange: {
            type: Sequelize.BOOLEAN
        },
        isActive: {
            type: Sequelize.BOOLEAN
        },
    });

    return Orderr;
};