module.exports = (sequelize, Sequelize) => {
    const Rawmat = sequelize.define("rawmat", {
        name: {
            type: Sequelize.STRING
        },
        code: {
            type: Sequelize.STRING
        },
        supplier: {
            type: Sequelize.STRING
        },
        unitOfMeasure: {
            type: Sequelize.STRING
        },
        unitPrice: {
            type: Sequelize.FLOAT
        },
        minStockLevel: {
            type: Sequelize.STRING
        },
        maxStockLevel: {
            type: Sequelize.STRING
        },
        reorderPoint: {
            type: Sequelize.STRING
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
        isActive: {
            type: Sequelize.BOOLEAN
        },
    });

    return Rawmat;
};