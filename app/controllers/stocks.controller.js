const db = require("../models");
const Stock = db.stocks;
const Op = db.Sequelize.Op;
const Products = db.products;
const Chemicals = db.chemicals;
const RowMatterials = db.rowMatterials;
const Categories = db.categories;
const SubCategories = db.subCategories;
const Users = db.users;

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
        stockType: req.body.stockType,
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
        .then(async data => {
            if (req.body.stockType === 'chem') {
                let newQty = req.body.quantity;
                const queryString1 = `UPDATE chemicals SET chemicals.maxStockLevel =  chemicals.maxStockLevel + '${newQty}' WHERE chemicals.id = '${req.body.productId}';`
                newQty && Chemicals.sequelize.query(queryString1, { type: Chemicals.sequelize.QueryTypes.UPDATE })
                    .then(res.send(data))
                    .catch((err) => {
                        throw err;
                    });
            } else if (req.body.stockType === 'raw') {
                let newQty = req.body.quantity;
                const queryString2 = `UPDATE rawmats SET rawmats.maxStockLevel =  rawmats.maxStockLevel + '${newQty}' WHERE rawmats.id = '${req.body.productId}';`

                newQty && RowMatterials.sequelize.query(queryString2, { type: RowMatterials.sequelize.QueryTypes.UPDATE })
                    .then(res.send(data))
                    .catch((err) => {
                        throw err;
                    });
            } else if (req.body.stockType === 'prod') {
                if (req.body.productId) {
                    let newQty = req.body.quantity;
                    const queryString3 = `UPDATE products SET products.maxStockLevel =  products.maxStockLevel + '${newQty}' WHERE products.id = '${req.body.productId}';`

                    Products.sequelize.query(queryString3, { type: Products.sequelize.QueryTypes.UPDATE })
                        .then()
                        .catch((err) => {
                            throw err;
                        });

                    req.body.chemicaldata.map(item => {
                        if (item.initValue != '' || item.initValue != undefined || item.initValue != null || item.initValue != 'null') {
                            const queryString = `UPDATE chemicals SET chemicals.maxStockLevel = chemicals.maxStockLevel-'${item.initValue}' WHERE chemicals.id = '${item.id}';`

                            newQty && Chemicals.sequelize.query(queryString, { type: Chemicals.sequelize.QueryTypes.UPDATE })
                                .then()
                                .catch((err) => {
                                    throw err;
                                });
                        }
                    })
                    req.body.rawMattdata.map(item => {
                        if (item.initValue != '' || item.initValue != undefined || item.initValue != null || item.initValue != 'null') {
                            const queryString = `UPDATE rawmats SET rawmats.maxStockLevel = rawmats.maxStockLevel-'${item.initValue}' WHERE rawmats.id = '${item.id}';`

                            newQty && RowMatterials.sequelize.query(queryString, { type: RowMatterials.sequelize.QueryTypes.UPDATE })
                                .then()
                                .catch((err) => {
                                    throw err;
                                });
                        }
                    })
                }
                res.send(data);
            }
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
        .then(async data => {
            async function addData() {
                for (let index = 0; index < data.length; index++) {
                    const element = data[index];
                    await Products.findByPk(element.dataValues.productId).then(dt => {
                        element.dataValues.pName = dt.dataValues.productName,
                            element.dataValues.pCode = dt.dataValues.productCode,
                            element.dataValues.pdescription = dt.dataValues.description,
                            element.dataValues.pprice = dt.dataValues.price,
                            element.dataValues.pcategoryId = dt.dataValues.categoryId,
                            element.dataValues.psubCategoryId = dt.dataValues.subCategoryId,
                            element.dataValues.pbrand = dt.dataValues.brand,
                            element.dataValues.pvolume = dt.dataValues.volume,
                            element.dataValues.ptype = dt.dataValues.type
                    })
                    await Categories.findByPk(element.dataValues.categoryId).then(dt => {
                        element.dataValues.ctitle = dt.dataValues.title
                        element.dataValues.cdescription = dt.dataValues.description
                    })
                    await Users.findByPk(element.dataValues.userId).then(dt => {
                        element.dataValues.ufullName = dt.dataValues.fullName,
                            element.dataValues.uemail = dt.dataValues.email,
                            element.dataValues.urole = dt.dataValues.role,
                            element.dataValues.uphoneNumber = dt.dataValues.phoneNumber,
                            element.dataValues.uaddress = dt.dataValues.address
                    })
                    await SubCategories.findByPk(element.dataValues.subcategoryId).then(dt => {
                        element.dataValues.sctitle = dt.dataValues.title
                        element.dataValues.scdescription = dt.dataValues.description
                    })
                }
            }
            await addData();
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
        .then(async data => {
            if (data) {
                // await Products.findByPk(data.dataValues.productId).then(dt => {
                //     data.dataValues.pName = dt.dataValues.productName,
                //         data.dataValues.pCode = dt.dataValues.productCode,
                //         data.dataValues.pdescription = dt.dataValues.description,
                //         data.dataValues.pprice = dt.dataValues.price,
                //         data.dataValues.pcategoryId = dt.dataValues.categoryId,
                //         data.dataValues.psubCategoryId = dt.dataValues.subCategoryId,
                //         data.dataValues.pbrand = dt.dataValues.brand,
                //         data.dataValues.pvolume = dt.dataValues.volume,
                //         data.dataValues.ptype = dt.dataValues.type
                // })
                // await Categories.findByPk(data.dataValues.categoryId).then(dt => {
                //     data.dataValues.ctitle = dt.dataValues.title
                //     data.dataValues.cdescription = dt.dataValues.description
                // })
                // await Users.findByPk(data.dataValues.userId).then(dt => {
                //     data.dataValues.ufullName = dt.dataValues.fullName,
                //         data.dataValues.uemail = dt.dataValues.email,
                //         data.dataValues.urole = dt.dataValues.role,
                //         data.dataValues.uphoneNumber = dt.dataValues.phoneNumber,
                //         data.dataValues.uaddress = dt.dataValues.address
                // })
                // await SubCategories.findByPk(data.dataValues.subcategoryId).then(dt => {
                //     data.dataValues.sctitle = dt.dataValues.title
                //     data.dataValues.scdescription = dt.dataValues.description
                // })
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

exports.findByProductId = (req, res) => {
    const id = req.params.id;

    Stock.findAll({ where: { productId: id }, order: Stock.sequelize.literal('id DESC') })
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

exports.findByProductIdAndType = (req, res) => {
    const id = req.params.id;
    const type = req.params.type;
    Stock.findAll({ where: { productId: id, stockType: type }, order: Stock.sequelize.literal('id DESC') })
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
    const type = req.params.type;
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