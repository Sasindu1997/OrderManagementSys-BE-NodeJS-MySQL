const db = require("../models");
const Stock = db.stocks;
const Op = db.Sequelize.Op;

// Create and Save a new Stock
exports.create = (req, res) => {
    // Validate request
    if (!req.body.productId) {
        res.status(400).send({
            message: "Content can not be empty!"
        });
        return;
    }

    // Create a Stock
    const stock = {
        productId: req.body.productId,
        quantity: req.body.quantity,
        categoryId: req.body.categoryId,
        userId: req.body.userId,
        subcategoryId: req.body.subcategoryId,
        measuredUnit: req.body.measuredUnit,
        minimumQuantity: req.body.minimumQuantity,
        maximumQuantity: req.body.maximumQuantity,
        reorderPoint: req.body.reorderPoint,
        isActive: req.body.isActive ? req.body.isActive : false
    };

    // Save Stock in the database
    Stock.create(stock)
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while creating the Stock."
            });
        });
};

// Retrieve all Stocks from the database.
exports.findAll = (req, res) => {
    const productId = req.query.productId;
    var condition = productId ? {
        productId: {
            [Op.like]: `%${productId}%`
        }
    } : null;

    Stock.findAll({ where: condition })
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving stocks."
            });
        });
};

// Find a single Stock with an id
exports.findOne = (req, res) => {
    const id = req.params.id;

    Stock.findByPk(id)
        .then(data => {
            if (data) {
                res.send(data);
            } else {
                res.status(404).send({
                    message: `Cannot find Stock with id=${id}.`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Error retrieving Stock with id=" + id
            });
        });
};

// Update a Stock by the id in the request
exports.update = (req, res) => {
    const id = req.params.id;

    Stock.update(req.body, {
            where: { id: id }
        })
        .then(num => {
            if (num == 1) {
                res.send({
                    message: "Stock was updated successfully."
                });
            } else {
                res.send({
                    message: `Cannot update Stock with id=${id}. Maybe Stock was not found or req.body is empty!`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Error updating Stock with id=" + id
            });
        });
};

// Delete a Stock with the specified id in the request
exports.delete = (req, res) => {
    const id = req.params.id;

    Stock.destroy({
            where: { id: id }
        })
        .then(num => {
            if (num == 1) {
                res.send({
                    message: "Stock was deleted successfully!"
                });
            } else {
                res.send({
                    message: `Cannot delete Stock with id=${id}. Maybe Stock was not found!`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Could not delete Stock with id=" + id
            });
        });
};

// Delete all Stocks from the database.
exports.deleteAll = (req, res) => {
    Stock.destroy({
            where: {},
            truncate: false
        })
        .then(nums => {
            res.send({ message: `${nums} Stocks were deleted successfully!` });
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while removing all stocks."
            });
        });
};

// Find all published Stocks
exports.findAllPublished = (req, res) => {
    Stock.findAll({ where: { published: true } })
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving stocks."
            });
        });
};