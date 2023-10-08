module.exports = (sequelize, Sequelize) => {
    const ChemStream = sequelize.define("chemStream", {
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

    return ChemStream;
};