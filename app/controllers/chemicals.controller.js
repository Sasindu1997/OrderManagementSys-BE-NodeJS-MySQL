const db = require("../models");
const Chemicals = db.chemicals;
const Op = db.Sequelize.Op;

// Create and Save a new Chemicals
exports.create = (req, res) => {
    // Validate request
    if (!req.body.name) {
        res.status(400).send({
            message: "Content can not be empty!"
        });
        return;
    }

    // Create a Chemicals
    const chemicals = {
        name: req.body.name,
        code: req.body.code,
        supplier: req.body.supplier,
        unitOfMeasure: req.body.unitOfMeasure,
        unitPrice: req.body.unitPrice,
        minStockLevel: req.body.minStockLevel,
        maxStockLevel: req.body.maxStockLevel,
        amount: req.body.amount,
        paid: req.body.paid ? req.body.paid : false,
        total: req.body.total,
        status: req.body.status,
        paymentMethod: req.body.paymentMethod,
        shippingMethod: req.body.shippingMethod,
        trackingNumber: req.body.trackingNumber,
        isActive: req.body.isActive ? req.body.isActive : false,
    };

    // Save Chemicals in the database
    Chemicals.create(chemicals)
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while creating the Chemicals."
            });
        });
};

// Retrieve all Chemicalss from the database.
exports.findAll = (req, res) => {
    const name = req.query.name;
    var condition = name ? {
        name: {
            [Op.like]: `%${name}%`
        }
    } : null;

    Chemicals.findAll({ where: condition, order: Chemicals.sequelize.literal('id DESC') })
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving rowMatterials."
            });
        });
};

// Find a single Chemicals with an id
exports.findOne = (req, res) => {
    const id = req.params.id;

    Chemicals.findByPk(id)
        .then(data => {
            if (data) {
                res.send(data);
            } else {
                res.status(404).send({
                    message: `Cannot find Chemicals with id=${id}.`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Error retrieving Chemicals with id=" + id
            });
        });
};

// Update a Chemicals by the id in the request
exports.update = (req, res) => {
    const id = req.params.id;

    Chemicals.update(req.body, {
            where: { id: id }
        })
        .then(num => {
            if (num == 1) {
                res.send({
                    message: "Chemicals was updated successfully."
                });
            } else {
                res.send({
                    message: `Cannot update Chemicals with id=${id}. Maybe Chemicals was not found or req.body is empty!`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Error updating Chemicals with id=" + id
            });
        });
};

// Delete a Chemicals with the specified id in the request
exports.delete = (req, res) => {
    const id = req.params.id;

    Chemicals.destroy({
            where: { id: id }
        })
        .then(num => {
            if (num == 1) {
                res.send({
                    message: "Chemicals was deleted successfully!"
                });
            } else {
                res.send({
                    message: `Cannot delete Chemicals with id=${id}. Maybe Chemicals was not found!`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Could not delete Chemicals with id=" + id
            });
        });
};

// Delete all Chemicalss from the database.
exports.deleteAll = (req, res) => {
    Chemicals.destroy({
            where: {},
            truncate: false
        })
        .then(nums => {
            res.send({ message: `${nums} Chemicalss were deleted successfully!` });
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while removing all rowMatterials."
            });
        });
};

// Find all published Chemicalss
exports.findAllPublished = (req, res) => {
    Chemicals.findAll({ where: { published: true } })
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving rowMatterials."
            });
        });
};