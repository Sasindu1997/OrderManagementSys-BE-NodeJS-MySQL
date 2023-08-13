module.exports = (sequelize, Sequelize) => {
    const Tutorial = sequelize.define("utility", {
        name: {
            type: Sequelize.STRING
        },
        description: {
            type: Sequelize.STRING
        },
        amount: {
            type: Sequelize.FLOAT
        },
        isActive: {
            type: Sequelize.BOOLEAN
        }
    });

    return Tutorial;
};