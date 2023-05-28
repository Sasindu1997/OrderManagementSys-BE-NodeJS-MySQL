module.exports = (sequelize, Sequelize) => {
    const Product = sequelize.define("product", {
        productName: {
            type: Sequelize.STRING
        },
        description: {
            type: Sequelize.STRING
        },
        price: {
            type: Sequelize.STRING
        },
        sku: {
            type: Sequelize.STRING
        },
        volume: {
            type: Sequelize.STRING
        },
        type: {
            type: Sequelize.STRING
        },
        // quantity: {
        //     type: Sequelize.STRING
        // },
        // category: {
        //     type: Sequelize.STRING
        // },
        // subCategory: {
        //     type: Sequelize.STRING
        // },
        brand: {
            type: Sequelize.STRING
        },
        imageURL: {
            type: Sequelize.STRING
        },
        isActive: {
            type: Sequelize.BOOLEAN
        },
    });

    return Product;
};