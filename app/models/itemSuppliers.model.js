module.exports = (sequelize, Sequelize) => {
    const ItemSuppliers = sequelize.define("itemSuppliers", {
        name: {
            type: Sequelize.STRING
        },
        description: {
            type: Sequelize.STRING
        },
        phone: {
            type: Sequelize.STRING
        },
        address: {
            type: Sequelize.STRING
        },
        test1: {
            type: Sequelize.STRING
        },
        test2: {
            type: Sequelize.STRING
        },
        test3: {
            type: Sequelize.STRING
        },
        test4: {
            type: Sequelize.STRING
        },
        test5: {
            type: Sequelize.STRING
        },
        isActive: {
            type: Sequelize.BOOLEAN
        },
    });

    return ItemSuppliers;
};