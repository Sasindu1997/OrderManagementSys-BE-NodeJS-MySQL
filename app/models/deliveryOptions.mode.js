module.exports = (sequelize, Sequelize) => {
    const Delivery = sequelize.define("delivery", {
        userName: {
            type: Sequelize.STRING
        },
        passWord: {
            type: Sequelize.STRING
        },
        description: {
            type: Sequelize.STRING
        },
        clientId: {
            type: Sequelize.STRING
        },
        apiKey: {
            type: Sequelize.STRING
        },
        isActive: {
            type: Sequelize.BOOLEAN
        }
    });

    return Delivery;
};