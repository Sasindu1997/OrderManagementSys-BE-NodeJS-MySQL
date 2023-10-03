module.exports = (sequelize, Sequelize) => {
    const ExpenseStream = sequelize.define("expenseStream", {
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

    return ExpenseStream;
};