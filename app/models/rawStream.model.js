module.exports = (sequelize, Sequelize) => {
    const RawStream = sequelize.define("rawStream", {
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

    return RawStream;
};