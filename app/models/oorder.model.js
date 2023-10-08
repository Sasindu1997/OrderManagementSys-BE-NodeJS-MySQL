module.exports = (sequelize, Sequelize) => {
    const OOrder = sequelize.define("oorder", {
        customerId: {
            type: Sequelize.INTEGER
        },
        cusName: {
            type: Sequelize.STRING
        },
        cusPhone: {
            type: Sequelize.STRING
        },
        userId: {
            type: Sequelize.INTEGER
        },
        userRole: {
            type: Sequelize.STRING
        },
        userName: {
            type: Sequelize.STRING
        },
        productId: {
            type: Sequelize.JSON,
            defaultValue: [],
        },
        productDetails: {
            type: Sequelize.JSON,
            defaultValue: [],
        },
        weight: {
            type: Sequelize.FLOAT
        },
        paid: {
            type: Sequelize.BOOLEAN
        },
        subTotal: {
            type: Sequelize.FLOAT
        },
        total: {
            type: Sequelize.FLOAT
        },
        deliveryCharge: {
            type: Sequelize.FLOAT
        },
        status: {
            type: Sequelize.STRING
        },
        finalStatus: {
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
        district: {
            type: Sequelize.STRING
        },
        hub: {
            type: Sequelize.STRING
        },
        invoiceNumber: {
            type: Sequelize.STRING,
            defaultValue : '000000'
        },
        trackingNumber: {
            type: Sequelize.STRING
        },
        barcode: {
            type: Sequelize.STRING
        },
        parcelType: {
            type: Sequelize.STRING
        },
        deliveryId: {
            type: Sequelize.INTEGER
        },
        supplierName: {
            type: Sequelize.STRING
        },
        supplierId: {
            type: Sequelize.INTEGER
        },
        exchange: {
            type: Sequelize.BOOLEAN
        },
        isActive: {
            type: Sequelize.BOOLEAN
        },
        remark: {
            type: Sequelize.STRING
        },
        updatedDate: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            allowNull: true
        },
    });

    return OOrder;
};