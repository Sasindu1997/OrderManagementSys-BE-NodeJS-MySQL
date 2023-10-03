const db = require("../models");
const ExpenseStream = db.expenseStream;
const Op = db.Sequelize.Op;

// Create and Save a new Expense Stream
exports.create = (req, res) => {
    // Validate request
    if (!req.body.name) {
        res.status(400).send({
            message: "Content can not be empty!"
        });
        return;
    }

    // Create a Expense Stream
    const expenseStream = {
        name: req.body.name,
        description: req.body.description,
        isActive: req.body.isActive ? req.body.isActive : true
    };

    // Save Expense Stream in the database
    ExpenseStream.create(expenseStream)
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while creating the Expense Stream."
            });
        });
};

// Retrieve all Expense Streams from the database.
exports.findAll = (req, res) => {
    const name = req.query.name;
    var condition = name ? {
        name: {
            [Op.like]: `%${name}%`
        }
    } : null;

    ExpenseStream.findAll({ where: condition, order: ExpenseStream.sequelize.literal('id DESC') })
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving Expense Streams."
            });
        });
};

// Find a single Expense Stream with an id
exports.findOne = (req, res) => {
    const id = req.params.id;

    ExpenseStream.findByPk(id)
        .then(data => {
            if (data) {
                res.send(data);
            } else {
                res.status(404).send({
                    message: `Cannot find Expense Stream with id=${id}.`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Error retrieving Expense Stream with id=" + id
            });
        });
};

// Update a Expense Stream by the id in the request
exports.update = (req, res) => {
    const id = req.params.id;

    ExpenseStream.update(req.body, {
            where: { id: id }
        })
        .then(num => {
            if (num == 1) {
                res.send({
                    message: "Expense Stream was updated successfully."
                });
            } else {
                res.send({
                    message: `Cannot update Expense Stream with id=${id}. Maybe Expense Stream was not found or req.body is empty!`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Error updating Expense Stream with id=" + id
            });
        });
};

// Delete a Expense Stream with the specified id in the request
exports.delete = (req, res) => {
    const id = req.params.id;

    ExpenseStream.destroy({
            where: { id: id }
        })
        .then(num => {
            if (num == 1) {
                res.send({
                    message: "Expense Stream was deleted successfully!"
                });
            } else {
                res.send({
                    message: `Cannot delete Expense Stream with id=${id}. Maybe Expense Stream was not found!`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Could not delete Expense Stream with id=" + id
            });
        });
};