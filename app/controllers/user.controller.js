const db = require("../models");
const Users = db.users;
const Op = db.Sequelize.Op;
const Orderr = db.oorders;

// Create and Save a new Users
exports.create = (req, res) => {
    // Validate request
    if (!req.body.fullName) {
        res.status(400).send({
            message: "Content can not be empty!"
        });
        return;
    }

    // Create a Users
    const users = {
        fullName: req.body.fullName,
        email: req.body.email,
        userName: req.body.userName,
        password: req.body.password,
        role: req.body.role,
        phoneNumber: req.body.phoneNumber,
        address: req.body.address,
        isActive: req.body.isActive ? req.body.isActive : false,
        createdAt: req.body.createdAt
    };

    // Save Users in the database
    Users.create(users)
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
    const title = req.query.title;
    var condition = title ? {
        title: {
            [Op.like]: `%${title}%`
        }
    } : null;

    Users.findAll({ where: condition, order: Users.sequelize.literal('id DESC') })
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving userss."
            });
        });
};

exports.findAllManagers = (req, res) => {
    const role = req.params.role;
    var condition = role ? {
        role: {
            [Op.like]: `%${role}%`
        }
    } : null;

    Users.findAll({ where: condition, order: Users.sequelize.literal('id DESC') })
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

    Users.findByPk(id)
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

    Users.update(req.body, {
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

    Users.destroy({
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

// Delete all Userss from the database.
exports.deleteAll = (req, res) => {
    Users.destroy({
            where: {},
            truncate: false
        })
        .then(nums => {
            res.send({ message: `${nums} Userss were deleted successfully!` });
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while removing all userss."
            });
        });
};

// Find all published Userss
exports.findAllPublished = (req, res) => {
    Users.findAll({ where: { published: true } })
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving userss."
            });
        });
};

// Marketing Manager
exports.findAllByRole = (req, res) => {
    const role = req.query.role;
    var condition = title ? {
        role: {
            [Op.like]: `%${role}%`
        }
    } : null;

    Users.findAll({ where: condition, order: Users.sequelize.literal('id DESC') })
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving userss."
            });
        });
};

exports.findAllBySupplier = (req, res) => {


    const supplierId = req.params.id;
    var condition = supplierId ? {
        supplierId: `${supplierId}`
    } : null;

    Orderr.findAll({ where: condition, order: Orderr.sequelize.literal('id DESC') })
        .then(async data => {

            async function addData() {
                for (let index = 0; index < data.length; index++) {
                    const element = data[index];
                    element.dataValues.productData = []
                    for (let j = 0; j < element._previousDataValues.productDetails.length; j++) {
                        await Products.findByPk(element._previousDataValues.productDetails[j].prid).then(dt => {

                            dt && dt.dataValues && element.dataValues.productData.push({
                                pId: element._previousDataValues.productDetails[j].prid,
                                pName: dt.dataValues.productName,
                                pCode: dt.dataValues.productCode,
                                pdescription: dt.dataValues.description,
                                pprice: dt.dataValues.price,
                                pcategoryId: dt.dataValues.categoryId,
                                psubCategoryId: dt.dataValues.subCategoryId,
                                pbrand: dt.dataValues.brand,
                                pvolume: dt.dataValues.volume,
                                ptype: dt.dataValues.type,
                                ocount: element._previousDataValues.productDetails[j].prc,

                            })
                        })
                    }

                    element && element.dataValues && await Customers.findByPk(element.dataValues.customerId).then(dt => {
                        dt && dt.dataValues ? element.dataValues.cfullName = dt.dataValues.fullName : element.dataValues.cfullName = '',
                            dt && dt.dataValues ? element.dataValues.cemail = dt.dataValues.email : element.dataValues.cemail = '',
                            dt && dt.dataValues ? element.dataValues.cphone = dt.dataValues.phone : element.dataValues.cphone = '',
                            dt && dt.dataValues ? element.dataValues.caddress = dt.dataValues.address : element.dataValues.caddress = '',
                            dt && dt.dataValues ? element.dataValues.cdistrict = dt.dataValues.district : element.dataValues.cdistrict = '',
                            dt && dt.dataValues ? element.dataValues.ccfullName = dt.dataValues.fullName : element.dataValues.ccfullName = ''

                    })
                    element && element.dataValues && await Users.findByPk(element.dataValues.userId).then(dt => {
                        dt && dt.dataValues ? element.dataValues.ufullName = dt.dataValues.fullName : element.dataValues.cfullName = '',
                            dt && dt.dataValues ? element.dataValues.uemail = dt.dataValues.email : element.dataValues.uemail = '',
                            dt && dt.dataValues ? element.dataValues.urole = dt.dataValues.role : element.dataValues.urole = '',
                            dt && dt.dataValues ? element.dataValues.uphoneNumber = dt.dataValues.phoneNumber : element.dataValues.uphoneNumber = '',
                            dt && dt.dataValues ? element.dataValues.uaddress = dt.dataValues.address : element.dataValues.uaddress = ''
                    })
                }
            }
            // await addData();
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving orders."
            });
        });
};
