module.exports = (sequelize, Sequelize) => {
    const Product = sequelize.define("product", {
        productName: {
            type: Sequelize.STRING
        },
        productCode: {
            type: Sequelize.STRING
        },
        description: {
            type: Sequelize.STRING
        },
        price: {
            type: Sequelize.FLOAT
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
        categoryId: {
            type: Sequelize.INTEGER
        },
        subCategoryId: {
            type: Sequelize.INTEGER
        },
        brand: {
            type: Sequelize.STRING
        },
        imageURL: {
            type: Sequelize.STRING
        },
        minStockLevel: {
            type: Sequelize.STRING
        },
        maxStockLevel: {
            type: Sequelize.STRING
        },
        isActive: {
            type: Sequelize.BOOLEAN
        },
    });

    return Product;
};