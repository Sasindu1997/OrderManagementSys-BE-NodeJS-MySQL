const db = require("../models");
const RowMatterial = db.rowMatterials;
const Op = db.Sequelize.Op;

// Create and Save a new RowMatterial
exports.create = (req, res) => {
    // Validate request
    if (!req.body.name, !req.body.total) {
        res.status(400).send({
            message: "Content can not be empty!"
        });
        return;
    }

    // Create a RowMatterial
    const rowMatterial = {
        name: req.body.name,
        code: req.body.code,
        supplier: req.body.supplier,
        unitOfMeasure: req.body.unitOfMeasure,
        unitPrice: req.body.unitPrice,
        minStockLevel: req.body.minStockLevel,
        maxStockLevel: req.body.maxStockLevel,
        reorderPoint: req.body.reorderPoint,
        itemCount: req.body.itemCount,
        paid: req.body.paid ? req.body.paid : false,
        total: req.body.total,
        status: req.body.status,
        shippingAddress: req.body.shippingAddress,
        paymentMethod: req.body.paymentMethod,
        shippingMethod: req.body.shippingMethod,
        trackingNumber: req.body.trackingNumber,
        isActive: req.body.isActive ? req.body.isActive : false,
    };

    // Save RowMatterial in the database
    RowMatterial.create(rowMatterial)
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while creating the RowMatterial."
            });
        });
};

// Retrieve all RowMatterials from the database.
exports.findAll = (req, res) => {
    const name = req.query.name;
    var condition = name ? {
        name: {
            [Op.like]: `%${name}%`
        }
    } : null;

    RowMatterial.findAll({ where: condition })
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving rowMatterials."
            });
        });
};

// Find a single RowMatterial with an id
exports.findOne = (req, res) => {
    const id = req.params.id;

    RowMatterial.findByPk(id)
        .then(data => {
            if (data) {
                res.send(data);
            } else {
                res.status(404).send({
                    message: `Cannot find RowMatterial with id=${id}.`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Error retrieving RowMatterial with id=" + id
            });
        });
};

// Update a RowMatterial by the id in the request
exports.update = (req, res) => {
    const id = req.params.id;

    RowMatterial.update(req.body, {
            where: { id: id }
        })
        .then(num => {
            if (num == 1) {
                res.send({
                    message: "RowMatterial was updated successfully."
                });
            } else {
                res.send({
                    message: `Cannot update RowMatterial with id=${id}. Maybe RowMatterial was not found or req.body is empty!`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Error updating RowMatterial with id=" + id
            });
        });
};

// Delete a RowMatterial with the specified id in the request
exports.delete = (req, res) => {
    const id = req.params.id;

    RowMatterial.destroy({
            where: { id: id }
        })
        .then(num => {
            if (num == 1) {
                res.send({
                    message: "RowMatterial was deleted successfully!"
                });
            } else {
                res.send({
                    message: `Cannot delete RowMatterial with id=${id}. Maybe RowMatterial was not found!`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Could not delete RowMatterial with id=" + id
            });
        });
};

// Delete all RowMatterials from the database.
exports.deleteAll = (req, res) => {
    RowMatterial.destroy({
            where: {},
            truncate: false
        })
        .then(nums => {
            res.send({ message: `${nums} RowMatterials were deleted successfully!` });
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while removing all rowMatterials."
            });
        });
};

// Find all published RowMatterials
exports.findAllPublished = (req, res) => {
    RowMatterial.findAll({ where: { published: true } })
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving rowMatterials."
            });
        });
};