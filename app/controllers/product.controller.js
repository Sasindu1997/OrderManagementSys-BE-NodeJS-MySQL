const db = require("../models");
const Product = db.products;
const Op = db.Sequelize.Op;
const SubCategories = db.subCategories;
const Categories = db.categories;

// Create and Save a new Product
exports.create = (req, res) => {
    // Validate request
    if (!req.body.productName, !req.body.price) {
        res.status(400).send({
            message: "Content can not be empty!"
        });
        return;
    }

    // Create a Product
    const product = {
        productName: req.body.productName,
        description: req.body.description,
        price: req.body.price,
        productCode: req.body.productCode,
        categoryId: req.body.categoryId,
        subCategoryId: req.body.subCategoryId,
        type: req.body.type,
        volume: req.body.volume,
        sku: req.body.sku,
        quantity: req.body.quantity,
        category: req.body.category,
        subCategory: req.body.subCategory ? req.body.subCategory : 0,
        brand: req.body.brand,
        imageURL: req.body.imageURL,
        minStockLevel: req.body.minStockLevel ? req.body.minStockLevel : 0,
        maxStockLevel: req.body.maxStockLevel ? req.body.maxStockLevel : 0,
        isActive: req.body.isActive ? req.body.isActive : false
    };

    // Save Product in the database
    Product.create(product)
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while creating the Product."
            });
        });
};

// Retrieve all Products from the database.
exports.findAll = (req, res) => {
    const productName = req.query.productName;
    var condition = productName ? {
        productName: {
            [Op.like]: `%${productName}%`
        }
    } : null;

    Product.findAll({ where: condition, order: Product.sequelize.literal('id DESC') })
        .then(async data => {
            async function addData() {
                for (let index = 0; index < data.length; index++) {
                    const element = data[index];
                    element && element.dataValues && await Categories.findByPk(element.dataValues.categoryId).then(dt => {
                        element.dataValues.categoryTitle = dt && dt.dataValues ? dt.dataValues.title : ''
                    })
                    element && element.dataValues && await SubCategories.findByPk(element.dataValues.subCategoryId).then(dt => {
                        dt && dt.dataValues ? element.dataValues.subCategoryTitle = dt.dataValues.title : element.dataValues.subCategoryTitle = ""
                    })
                }
            }
            await addData();
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving products."
            });
        });
};

//by categoryId
exports.findAllByCategoryId = (req, res) => {

    const categoryId = req.params.id;
    var condition = categoryId ? {
        categoryId: {
            [Op.eq]: categoryId
        }
    } : null;


    Product.findAll({ where: condition, order: Product.sequelize.literal('id DESC') })
        .then(async data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving products."
            });
        });
};

exports.findAllByNameByBE = (productName, send) => {
    var condition = productName ? {
        productName: {
            [Op.like]: `%${productName}%`
        }
    } : null;

    Product.findAll({ where: condition, order: Product.sequelize.literal('id DESC') })
        .then(async data => {
            // async function addData() {
            //     for (let index = 0; index < data.length; index++) {
            //         const element = data[index];
            //         await Categories.findByPk(element.dataValues.categoryId).then(dt => {
            //             element.dataValues.categoryTitle = dt.dataValues.title
            //         })
            //         await SubCategories.findByPk(element.dataValues.subCategoryId).then(dt => {
            //             dt ? element.dataValues.subCategoryTitle = dt.dataValues.title : element.dataValues.subCategoryTitle = ""
            //         })
            //     }
            // }
            // await addData();
            send(data);
        })
        .catch(err => {
            send({
                message: err.message || "Some error occurred while retrieving products."
            });
        });
};

// Find a single Product with an id
exports.findOne = (req, res) => {
    const id = req.params.id;

    Product.findByPk(id)
        .then(async data => {
            if (data) {
                await Categories.findByPk(data.dataValues.categoryId).then(dt => {

                    dt ? data.dataValues.categoryTitle = dt.dataValues.title : data.dataValues.categoryTitle = ""
                })
                await SubCategories.findByPk(data.dataValues.subCategoryId).then(dt => {

                    dt ? data.dataValues.subCategoryTitle = dt.dataValues.title : data.dataValues.subCategoryTitle = ""
                })
                res.send(data);
            } else {
                res.status(404).send({
                    message: `Cannot find Product with id=${id}.`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Error retrieving Product with id=" + id
            });
        });
};

// Update a Product by the id in the request
exports.update = (req, res) => {
    const id = req.params.id;

    Product.update(req.body, {
            where: { id: id }
        })
        .then(num => {
            if (num == 1) {
                res.send({
                    message: "Product was updated successfully."
                });
            } else {
                res.send({
                    message: `Cannot update Product with id=${id}. Maybe Product was not found or req.body is empty!`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Error updating Product with id=" + id
            });
        });
};

// Delete a Product with the specified id in the request
exports.delete = (req, res) => {
    const id = req.params.id;

    Product.destroy({
            where: { id: id }
        })
        .then(num => {
            if (num == 1) {
                res.send({
                    message: "Product was deleted successfully!"
                });
            } else {
                res.send({
                    message: `Cannot delete Product with id=${id}. Maybe Product was not found!`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Could not delete Product with id=" + id
            });
        });
};

// Delete all Products from the database.
exports.deleteAll = (req, res) => {
    Product.destroy({
            where: {},
            truncate: false
        })
        .then(nums => {
            res.send({ message: `${nums} Products were deleted successfully!` });
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while removing all products."
            });
        });
};

// Find all published Products
exports.findAllPublished = (req, res) => {
    Product.findAll({ where: { published: true } })
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving products."
            });
        });
};