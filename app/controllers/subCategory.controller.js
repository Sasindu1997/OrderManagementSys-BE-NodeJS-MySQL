const db = require("../models");
const SubCategories = db.subCategories;
const Op = db.Sequelize.Op;

// Create and Save a new SubCategories
exports.create = (req, res) => {
    // Validate request
    if (!req.body.title) {
        res.status(400).send({
            message: "Content can not be empty!"
        });
        return;
    }

    // Create a SubCategories
    const subCategories = {
        title: req.body.title,
        code: req.body.title,
        description: req.body.description,
        published: req.body.published ? req.body.published : false
    };

    // Save SubCategories in the database
    SubCategories.create(subCategories)
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while creating the SubCategories."
            });
        });
};

// Retrieve all SubCategoriess from the database.
exports.findAll = (req, res) => {
    const title = req.query.title;
    var condition = title ? {
        title: {
            [Op.like]: `%${title}%`
        }
    } : null;

    SubCategories.findAll({ where: condition })
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving subCategoriess."
            });
        });
};

// Find a single SubCategories with an id
exports.findOne = (req, res) => {
    const id = req.params.id;

    SubCategories.findByPk(id)
        .then(data => {
            if (data) {
                res.send(data);
            } else {
                res.status(404).send({
                    message: `Cannot find SubCategories with id=${id}.`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Error retrieving SubCategories with id=" + id
            });
        });
};

// Update a SubCategories by the id in the request
exports.update = (req, res) => {
    const id = req.params.id;

    SubCategories.update(req.body, {
            where: { id: id }
        })
        .then(num => {
            if (num == 1) {
                res.send({
                    message: "SubCategories was updated successfully."
                });
            } else {
                res.send({
                    message: `Cannot update SubCategories with id=${id}. Maybe SubCategories was not found or req.body is empty!`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Error updating SubCategories with id=" + id
            });
        });
};

// Delete a SubCategories with the specified id in the request
exports.delete = (req, res) => {
    const id = req.params.id;

    SubCategories.destroy({
            where: { id: id }
        })
        .then(num => {
            if (num == 1) {
                res.send({
                    message: "SubCategories was deleted successfully!"
                });
            } else {
                res.send({
                    message: `Cannot delete SubCategories with id=${id}. Maybe SubCategories was not found!`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Could not delete SubCategories with id=" + id
            });
        });
};

// Delete all SubCategoriess from the database.
exports.deleteAll = (req, res) => {
    SubCategories.destroy({
            where: {},
            truncate: false
        })
        .then(nums => {
            res.send({ message: `${nums} SubCategoriess were deleted successfully!` });
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while removing all subCategoriess."
            });
        });
};

// Find all published SubCategoriess
exports.findAllPublished = (req, res) => {
    SubCategories.findAll({ where: { published: true } })
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving subCategoriess."
            });
        });
};