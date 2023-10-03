module.exports = (sequelize, Sequelize) => {
    const Sms = sequelize.define("sms", {
        text: {
            type: Sequelize.STRING
        },
        isActive: {
            type: Sequelize.BOOLEAN
        },
    });

    return Sms;
};