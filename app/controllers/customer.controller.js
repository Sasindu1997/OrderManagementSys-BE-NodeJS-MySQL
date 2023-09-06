const db = require("../models");
const Customer = db.customers;
const Op = db.Sequelize.Op;

// Create and Save a new Customer
exports.create = (req, res) => {
    // Validate request
    if (!req.body.fullName) {
        res.status(400).send({
            message: "Content can not be empty!"
        });
        return;
    }

    // Create a Customer
    const customer = {
        fullName: req.body.fullName,
        email: req.body.email,
        phone: req.body.phone,
        address: req.body.address,
        district: req.body.district,
        isActive: req.body.isActive ? req.body.isActive : false,
    };

    // Save Customer in the database
    Customer.create(customer)
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while creating the Customer."
            });
        });
};

exports.createByBE = (req, send) => {
    // Validate request

    // Create a Customer
    const customer = req;

    // Save Customer in the database
    Customer.create(customer)
        .then(data => {
            send(data);
        })
        .catch(err => {
            send({
                message: err.message || "Some error occurred while creating the Customer."
            });
        });
};

// Retrieve all Customers from the database.
exports.findAll = (req, res) => {
    const fullName = req.query.fullName;
    var condition = fullName ? {
        fullName: {
            [Op.like]: `%${fullName}%`
        }
    } : null;

    Customer.findAll({ where: condition, order: Customer.sequelize.literal('id DESC') })
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving customers."
            });
        });
};

// Retrieve all Customers from the database.
exports.findAllByPhone = (phone, res) => {
    var condition = phone ? {
        phone: {
            [Op.like]: `%${phone}%`
        }
    } : null;

    Customer.findAll({ where: condition })
        .then(data => {
            res(data);
        })
        .catch(err => {
            res({
                message: err.message || "Some error occurred while retrieving customers."
            });
        });
};


exports.findByMobileNo = (mobile, res) => {

    const queryString = `SELECT * FROM customers where FIND_IN_SET('${mobile}', customers.phone);`

    Customer.sequelize.query(queryString, { type: Customer.sequelize.QueryTypes.SELECT })
        .then(r => res(r))
        .catch((err) => {
            throw err;
        });
};

// Find a single Customer with an id
exports.findOne = (req, res) => {
    const id = req.params.id;

    Customer.findByPk(id)
        .then(data => {
            if (data) {
                res.send(data);
            } else {
                res.status(404).send({
                    message: `Cannot find Customer with id=${id}.`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Error retrieving Customer with id=" + id
            });
        });
};

// Update a Customer by the id in the request
exports.update = (req, res) => {
    const id = req.params.id;

    Customer.update(req.body, {
            where: { id: id }
        })
        .then(num => {
            if (num == 1) {
                res.send({
                    message: "Customer was updated successfully."
                });
            } else {
                res.send({
                    message: `Cannot update Customer with id=${id}. Maybe Customer was not found or req.body is empty!`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Error updating Customer with id=" + id
            });
        });
};

// Delete a Customer with the specified id in the request
exports.delete = (req, res) => {
    const id = req.params.id;

    Customer.destroy({
            where: { id: id }
        })
        .then(num => {
            if (num == 1) {
                res.send({
                    message: "Customer was deleted successfully!"
                });
            } else {
                res.send({
                    message: `Cannot delete Customer with id=${id}. Maybe Customer was not found!`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Could not delete Customer with id=" + id
            });
        });
};

// Delete all Customers from the database.
exports.deleteAll = (req, res) => {
    Customer.destroy({
            where: {},
            truncate: false
        })
        .then(nums => {
            res.send({ message: `${nums} Customers were deleted successfully!` });
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while removing all customers."
            });
        });
};

// Find all published Customers
exports.findAllPublished = (req, res) => {
    Customer.findAll({ where: { published: true } })
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving customers."
            });
        });
};