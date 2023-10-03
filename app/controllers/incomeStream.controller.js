const db = require("../models");
const IncomeStream = db.incomeStream;
const Op = db.Sequelize.Op;

// Create and Save a new Income Stream
exports.create = (req, res) => {
    // Validate request
    if (!req.body.name) {
        res.status(400).send({
            message: "Content can not be empty!"
        });
        return;
    }

    // Create a Income Stream
    const incomeStream = {
        name: req.body.name,
        description: req.body.description,
        isActive: req.body.isActive ? req.body.isActive : true
    };

    // Save Income Stream in the database
    IncomeStream.create(incomeStream)
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while creating the Income Stream."
            });
        });
};

// Retrieve all Income Streams from the database.
exports.findAll = (req, res) => {
    const name = req.query.name;
    var condition = name ? {
        name: {
            [Op.like]: `%${name}%`
        }
    } : null;

    IncomeStream.findAll({ where: condition, order: IncomeStream.sequelize.literal('id DESC') })
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving Income Streams."
            });
        });
};

// Find a single Income Stream with an id
exports.findOne = (req, res) => {
    const id = req.params.id;

    IncomeStream.findByPk(id)
        .then(data => {
            if (data) {
                res.send(data);
            } else {
                res.status(404).send({
                    message: `Cannot find Income Stream with id=${id}.`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Error retrieving Income Stream with id=" + id
            });
        });
};

// Update a Income Stream by the id in the request
exports.update = (req, res) => {
    const id = req.params.id;

    IncomeStream.update(req.body, {
            where: { id: id }
        })
        .then(num => {
            if (num == 1) {
                res.send({
                    message: "Income Stream was updated successfully."
                });
            } else {
                res.send({
                    message: `Cannot update Income Stream with id=${id}. Maybe Income Stream was not found or req.body is empty!`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Error updating Income Stream with id=" + id
            });
        });
};

// Delete a Income Stream with the specified id in the request
exports.delete = (req, res) => {
    const id = req.params.id;

    IncomeStream.destroy({
            where: { id: id }
        })
        .then(num => {
            if (num == 1) {
                res.send({
                    message: "Income Stream was deleted successfully!"
                });
            } else {
                res.send({
                    message: `Cannot delete Income Stream with id=${id}. Maybe Income Stream was not found!`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Could not delete Income Stream with id=" + id
            });
        });
};