const SubCategory = require("./subCategory.model");

module.exports = (sequelize, Sequelize) => {
    const Category = sequelize.define("category", {
        title: {
            type: Sequelize.STRING
        },
        description: {
            type: Sequelize.STRING
        },
        isActive: {
            type: Sequelize.BOOLEAN
        }
    });

    // Category.belongsTo(SubCategory, { foreignKey: 'categoryId' });

    return Category;
};