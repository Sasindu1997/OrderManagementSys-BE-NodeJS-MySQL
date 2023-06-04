const Category = require("./category.model");

module.exports = (sequelize, Sequelize) => {
    const SubCategory = sequelize.define("Subcategory", {
        title: {
            type: Sequelize.STRING
        },
        code: {
            type: Sequelize.STRING
        },
        description: {
            type: Sequelize.STRING
        },
        isActive: {
            type: Sequelize.BOOLEAN
        },
        categoryId: {
            type: Sequelize.INTEGER
        },

    });

    return SubCategory;
};