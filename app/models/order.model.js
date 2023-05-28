module.exports = (sequelize, Sequelize) => {
    const Order = sequelize.define("order", {
        // customerID: {
        //     type: Sequelize.STRING
        // },
        // userID: {
        //     type: Sequelize.STRING
        // },
        barcode: {
            type: Sequelize.STRING
        },
        weight: {
            type: Sequelize.STRING
        },
        itemCount: {
            type: Sequelize.STRING
        },
        paid: {
            type: Sequelize.BOOLEAN
        },
        total: {
            type: Sequelize.STRING
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
        isActive: {
            type: Sequelize.BOOLEAN
        },
    });

    return Order;
};