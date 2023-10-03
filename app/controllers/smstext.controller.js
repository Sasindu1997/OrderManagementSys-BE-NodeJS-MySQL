const db = require("../models");
const SmsText = db.sms;
const Op = db.Sequelize.Op;

// Create and Save a new Users
exports.create = (req, res) => {
    // Validate request
    if (!req.body.text) {
        res.status(400).send({
            message: "Content can not be empty!"
        });
        return;
    }

    // Create a Users
    const smsText = {
        text: req.body.text,
        isActive: req.body.isActive ? req.body.isActive : true
    };

    // Save Users in the database
    SmsText.create(smsText)
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while creating the Users."
            });
        });
};

// Retrieve all Userss from the database.
exports.findAll = (req, res) => {
    const title = req.query.text;
    var condition = title ? {
        title: {
            [Op.like]: `%${title}%`
        }
    } : null;

    SmsText.findAll({ where: condition, order: SmsText.sequelize.literal('id DESC') })
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving userss."
            });
        });
};

// Find a single Users with an id
exports.findOne = (req, res) => {
    const id = req.params.id;

    SmsText.findByPk(id)
        .then(data => {
            if (data) {
                res.send(data);
            } else {
                res.status(404).send({
                    message: `Cannot find Users with id=${id}.`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Error retrieving Users with id=" + id
            });
        });
};

// Update a Users by the id in the request
exports.update = (req, res) => {
    const id = req.params.id;

    SmsText.update(req.body, {
            where: { id: id }
        })
        .then(num => {
            if (num == 1) {
                res.send({
                    message: "Users was updated successfully."
                });
            } else {
                res.send({
                    message: `Cannot update Users with id=${id}. Maybe Users was not found or req.body is empty!`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Error updating Users with id=" + id
            });
        });
};

// Delete a Users with the specified id in the request
exports.delete = (req, res) => {
    const id = req.params.id;

    SmsText.destroy({
            where: { id: id }
        })
        .then(num => {
            if (num == 1) {
                res.send({
                    message: "Users was deleted successfully!"
                });
            } else {
                res.send({
                    message: `Cannot delete Users with id=${id}. Maybe Users was not found!`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Could not delete Users with id=" + id
            });
        });
};