const db = require("../models");
const UtilityExpenses = db.utilityExpenses;
const Op = db.Sequelize.Op;

// Create and Save a new UtilityExpenses
exports.create = (req, res) => {
    // Validate request
    if (!req.body.name || !req.body.amount) {
        res.status(400).send({
            message: "Content can not be empty!"
        });
        return;
    }

    // Create a UtilityExpenses
    const expense = {
        name: req.body.name,
        description: req.body.description,
        amount: req.body.amount,
        isActive: req.body.isActive ? req.body.isActive : false
    };

    // Save UtilityExpenses in the database
    UtilityExpenses.create(expense)
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while creating the UtilityExpenses."
            });
        });
};

// Retrieve all UtilityExpensess from the database.
exports.findAll = (req, res) => {
    const name = req.query.name;
    var condition = name ? {
        name: {
            [Op.like]: `%${name}%`
        }
    } : null;

    UtilityExpenses.findAll({ where: condition, order: UtilityExpenses.sequelize.literal('id DESC') })
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving expenses."
            });
        });
};

// Find a single UtilityExpenses with an id
exports.findOne = (req, res) => {
    const id = req.params.id;

    UtilityExpenses.findByPk(id)
        .then(data => {
            if (data) {
                res.send(data);
            } else {
                res.status(404).send({
                    message: `Cannot find UtilityExpenses with id=${id}.`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Error retrieving UtilityExpenses with id=" + id
            });
        });
};

// Update a UtilityExpenses by the id in the request
exports.update = (req, res) => {
    const id = req.params.id;

    UtilityExpenses.update(req.body, {
            where: { id: id }
        })
        .then(num => {
            if (num == 1) {
                res.send({
                    message: "UtilityExpenses was updated successfully."
                });
            } else {
                res.send({
                    message: `Cannot update UtilityExpenses with id=${id}. Maybe UtilityExpenses was not found or req.body is empty!`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Error updating UtilityExpenses with id=" + id
            });
        });
};

// Delete a UtilityExpenses with the specified id in the request
exports.delete = (req, res) => {
    const id = req.params.id;

    UtilityExpenses.destroy({
            where: { id: id }
        })
        .then(num => {
            if (num == 1) {
                res.send({
                    message: "UtilityExpenses was deleted successfully!"
                });
            } else {
                res.send({
                    message: `Cannot delete UtilityExpenses with id=${id}. Maybe UtilityExpenses was not found!`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Could not delete UtilityExpenses with id=" + id
            });
        });
};

// Delete all UtilityExpensess from the database.
exports.deleteAll = (req, res) => {
    UtilityExpenses.destroy({
            where: {},
            truncate: false
        })
        .then(nums => {
            res.send({ message: `${nums} UtilityExpensess were deleted successfully!` });
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while removing all expenses."
            });
        });
};

// Find all published UtilityExpensess
exports.findAllPublished = (req, res) => {
    UtilityExpenses.findAll({ where: { published: true } })
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving expenses."
            });
        });
};

exports.multipleSearch = (req, res) => {
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    
    var condition = ''

    if(startDate && endDate){
        condition = `WHERE utilities.createdAt >= '${startDate}' AND utilities.createdAt <= '${endDate}'`   
    }
    else if(startDate){
        condition = `WHERE utilities.createdAt >='${startDate}'`   
    }
    else if(endDate){
        condition = `WHERE utilities.createdAt <= '${endDate}'`   
    }

    const queryString = `SELECT * FROM orderman.utilities ${condition} ORDER BY id DESC;`
    UtilityExpenses.sequelize.query(queryString, { type: UtilityExpenses.sequelize.QueryTypes.SELECT })
    .then(async data => {
        res.send(data);
    })
    .catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while retrieving expenses."
        });
    });
};