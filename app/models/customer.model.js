module.exports = (sequelize, Sequelize) => {
    const Customer = sequelize.define("customer", {
        fullName: {
            type: Sequelize.STRING
        },
        email: {
            type: Sequelize.STRING
        },
        phone: {
            type: Sequelize.STRING
        },
        phone2: {
            type: Sequelize.STRING
        },
        address: {
            type: Sequelize.STRING
        },
        district: {
            type: Sequelize.STRING
        },
        isActive: {
            type: Sequelize.BOOLEAN
        },
    });

    return Customer;
};