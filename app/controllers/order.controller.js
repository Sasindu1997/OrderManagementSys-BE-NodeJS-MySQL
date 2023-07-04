const db = require("../models");
const Order = db.orders;
const Op = db.Sequelize.Op;
const Products = db.products;
const Customers = db.customers;
const Users = db.users;

// Create and Save a new Order
exports.create = (req, res) => {
    // Validate request
    if (!req.body.productId, !req.body.itemCount, !req.body.total) {
        res.status(400).send({
            message: "Content can not be empty!"
        });
        return;
    }

    // Create a Order
    const order = {
        userID: req.body.userID,
        barcode: req.body.barcode,
        weight: req.body.weight,
        itemCount: req.body.itemCount,
        paid: req.body.paid ? req.body.paid : false,
        total: req.body.total,
        status: req.body.status,
        shippingAddress: req.body.shippingAddress,
        paymentMethod: req.body.paymentMethod,
        shippingMethod: req.body.shippingMethod,
        trackingNumber: req.body.trackingNumber,
        productId: req.body.productId,
        customerId: req.body.customerId,
        userId: req.body.userId,
        isActive: req.body.isActive ? req.body.isActive : false,
    };

    // Save Order in the database
    Order.create(order)
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while creating the Order."
            });
        });
};

// Retrieve all Orders from the database.
exports.findAll = (req, res) => {
    const customerId = req.query.customerId;
    var condition = customerId ? {
        customerId: {
            [Op.like]: `%${customerId}%`
        }
    } : null;

    Order.findAll({ where: condition })
        .then(async data => {
            async function addData() {
                for (let index = 0; index < data.length; index++) {
                    const element = data[index];
                    element.dataValues.productDetails = []
                    for (let j = 0; j < element.dataValues.productId.length; j++) {
                        console.log("****************************")
                        await Products.findByPk(element.dataValues.productId[j]).then(dt => {
                            element.dataValues.productDetails.push({
                                pId: element.dataValues.productId[j],
                                pName: dt.dataValues.productName,
                                pCode: dt.dataValues.productCode,
                                pdescription: dt.dataValues.description,
                                pprice: dt.dataValues.price,
                                pcategoryId: dt.dataValues.categoryId,
                                psubCategoryId: dt.dataValues.subCategoryId,
                                pbrand: dt.dataValues.brand,
                                pvolume: dt.dataValues.volume,
                                ptype: dt.dataValues.type
                            })
                        })
                    }

                    await Customers.findByPk(element.dataValues.customerId).then(dt => {
                        element.dataValues.cfullName = dt.dataValues.fullName,
                            element.dataValues.cemail = dt.dataValues.email,
                            element.dataValues.cphone = dt.dataValues.phone,
                            element.dataValues.caddress = dt.dataValues.address,
                            element.dataValues.cdistrict = dt.dataValues.district

                    })
                    await Users.findByPk(element.dataValues.userId).then(dt => {
                        element.dataValues.ufullName = dt.dataValues.fullName,
                            element.dataValues.uemail = dt.dataValues.email,
                            element.dataValues.urole = dt.dataValues.role,
                            element.dataValues.uphoneNumber = dt.dataValues.phoneNumber,
                            element.dataValues.uaddress = dt.dataValues.address
                    })
                }
            }
            await addData();
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving orders."
            });
        });
};

// Find a single Order with an id
exports.findOne = (req, res) => {
    const id = req.params.id;

    Order.findByPk(id)
        .then(async data => {
            if (data) {
                if (data) {
                    data.dataValues.productDetails = []
                    for (let j = 0; j < data.dataValues.productId.length; j++) {
                        await Products.findByPk(data.dataValues.productId[j]).then(dt => {
                            data.dataValues.productDetails.push({
                                pId: data.dataValues.productId[j],
                                pName: dt.dataValues.productName,
                                pCode: dt.dataValues.productCode,
                                pdescription: dt.dataValues.description,
                                pprice: dt.dataValues.price,
                                pcategoryId: dt.dataValues.categoryId,
                                psubCategoryId: dt.dataValues.subCategoryId,
                                pbrand: dt.dataValues.brand,
                                pvolume: dt.dataValues.volume,
                                ptype: dt.dataValues.type
                            })
                        })
                    }
                    await Customers.findByPk(data.dataValues.customerId).then(dt => {
                        data.dataValues.cfullName = dt.dataValues.fullName,
                            data.dataValues.cemail = dt.dataValues.email,
                            data.dataValues.cphone = dt.dataValues.phone,
                            data.dataValues.caddress = dt.dataValues.address,
                            data.dataValues.cdistrict = dt.dataValues.district

                    })
                    await Users.findByPk(data.dataValues.userId).then(dt => {
                        data.dataValues.ufullName = dt.dataValues.fullName,
                            data.dataValues.uemail = dt.dataValues.email,
                            data.dataValues.urole = dt.dataValues.role,
                            data.dataValues.uphoneNumber = dt.dataValues.phoneNumber,
                            data.dataValues.uaddress = dt.dataValues.address
                    })
                }
                res.send(data);
            } else {
                res.status(404).send({
                    message: `Cannot find Order with id=${id}.`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Error retrieving Order with id=" + id
            });
        });
};

// Update a Order by the id in the request
exports.update = (req, res) => {
    const id = req.params.id;

    Order.update(req.body, {
            where: { id: id }
        })
        .then(num => {
            if (num == 1) {
                res.send({
                    message: "Order was updated successfully."
                });
            } else {
                res.send({
                    message: `Cannot update Order with id=${id}. Maybe Order was not found or req.body is empty!`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Error updating Order with id=" + id
            });
        });
};

// Delete a Order with the specified id in the request
exports.delete = (req, res) => {
    const id = req.params.id;

    Order.destroy({
            where: { id: id }
        })
        .then(num => {
            if (num == 1) {
                res.send({
                    message: "Order was deleted successfully!"
                });
            } else {
                res.send({
                    message: `Cannot delete Order with id=${id}. Maybe Order was not found!`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Could not delete Order with id=" + id
            });
        });
};

// Delete all Orders from the database.
exports.deleteAll = (req, res) => {
    Order.destroy({
            where: {},
            truncate: false
        })
        .then(nums => {
            res.send({ message: `${nums} Orders were deleted successfully!` });
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while removing all orders."
            });
        });
};

// Find all published Orders
exports.findAllPublished = (req, res) => {
    Order.findAll({ where: { published: true } })
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving orders."
            });
        });
};