module.exports = (sequelize, Sequelize) => {
    const IncomeStream = sequelize.define("incomeStream", {
        name: {
            type: Sequelize.STRING
        },
        description: {
            type: Sequelize.STRING
        },
        isActive: {
            type: Sequelize.BOOLEAN
        },
    });

    return IncomeStream;
};