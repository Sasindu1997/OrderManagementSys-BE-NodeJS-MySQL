module.exports = (sequelize, Sequelize) => {
    const User = sequelize.define("user", {
        fullName: {
            type: Sequelize.STRING
        },
        email: {
            type: Sequelize.STRING
        },
        userName: {
            type: Sequelize.STRING
        },
        password: {
            type: Sequelize.STRING
        },
        role: {
            type: Sequelize.STRING
        },
        phoneNumber: {
            type: Sequelize.STRING
        },
        address: {
            type: Sequelize.STRING
        },
        isActive: {
            type: Sequelize.BOOLEAN
        },
    });

    return User;
};