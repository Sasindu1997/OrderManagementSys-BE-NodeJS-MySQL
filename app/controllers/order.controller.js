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

exports.createByBE = (newOrder, send) => {
    // Validate request

    // Create a Order
    // const order = {
    //     userID: req.body.userID,
    //     barcode: req.body.barcode,
    //     weight: req.body.weight,
    //     itemCount: req.body.itemCount,
    //     paid: req.body.paid ? req.body.paid : false,
    //     total: req.body.total,
    //     status: req.body.status,
    //     shippingAddress: req.body.shippingAddress,
    //     paymentMethod: req.body.paymentMethod,
    //     shippingMethod: req.body.shippingMethod,
    //     trackingNumber: req.body.trackingNumber,
    //     productId: req.body.productId,
    //     customerId: req.body.customerId,
    //     userId: req.body.userId,
    //     isActive: req.body.isActive ? req.body.isActive : false,
    // };

    // Save Order in the database
    Order.create(newOrder)
        .then(data => {
            send(data);
        })
        .catch(err => {
            send({
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

                            dt && dt.dataValues && element.dataValues.productDetails.push({
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

                    element && element.dataValues && await Customers.findByPk(element.dataValues.customerId).then(dt => {
                        dt && dt.dataValues ? element.dataValues.cfullName = dt.dataValues.fullName : element.dataValues.cfullName = '',
                            dt && dt.dataValues ? element.dataValues.cemail = dt.dataValues.email : element.dataValues.cemail = '',
                            dt && dt.dataValues ? element.dataValues.cphone = dt.dataValues.phone : element.dataValues.cphone = '',
                            dt && dt.dataValues ? element.dataValues.caddress = dt.dataValues.address : element.dataValues.caddress = '',
                            dt && dt.dataValues ? element.dataValues.cdistrict = dt.dataValues.district : element.dataValues.cdistrict = ''

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
                    data && data.dataValues && await Customers.findByPk(data.dataValues.customerId).then(dt => {
                        dt && dt.dataValues ? data.dataValues.cfullName = dt.dataValues.fullName : data.dataValues.cfullName = '',
                            dt && dt.dataValues ? data.dataValues.cemail = dt.dataValues.email : data.dataValues.cemail = '',
                            dt && dt.dataValues ? data.dataValues.cphone = dt.dataValues.phone : data.dataValues.cphone = '',
                            dt && dt.dataValues ? data.dataValues.caddress = dt.dataValues.address : data.dataValues.caddress = '',
                            dt && dt.dataValues ? data.dataValues.cdistrict = dt.dataValues.district : data.dataValues.cdistrict = ''

                    })
                    data && data.dataValues && await Users.findByPk(data.dataValues.userId).then(dt => {
                        dt && dt.dataValues ? data.dataValues.ufullName = dt.dataValues.fullName : data.dataValues.cfullName = '',
                            dt && dt.dataValues ? data.dataValues.uemail = dt.dataValues.email : data.dataValues.uemail = '',
                            dt && dt.dataValues ? data.dataValues.urole = dt.dataValues.role : data.dataValues.urole = '',
                            dt && dt.dataValues ? data.dataValues.uphoneNumber = dt.dataValues.phoneNumber : data.dataValues.uphoneNumber = '',
                            dt && dt.dataValues ? data.dataValues.uaddress = dt.dataValues.address : data.dataValues.uaddress = ''
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

exports.searchBy = (req, res) => {
    console.log(req.params)
    const searchSelect = req.params.searchSelect;
    const searchvalue = req.params.searchvalue;
    const queryString = `SELECT * FROM orders INNER JOIN customers ON orders.customerId = customers.id AND customers.${searchSelect} LIKE '%${searchvalue}';`

    Order.sequelize.query(queryString, { type: Order.sequelize.QueryTypes.SELECT })
        .then(r => res.send(r))
        .catch((err) => {
            throw err;
        });
};

exports.searchByCusPhone = (phn, res) => {
    const queryString = `SELECT * FROM orders INNER JOIN customers ON orders.customerId = customers.id AND FIND_IN_SET('${phn}', customers.phone);`

    Order.sequelize.query(queryString, { type: Order.sequelize.QueryTypes.SELECT })
        .then(r => res(r))
        .catch((err) => {
            res(err)
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

exports.todayOrderCount = (req, res) => {
    const queryString = `SELECT COUNT(id) AS NumberOfOrders FROM orders WHERE DATE(createdAt) = CURDATE();`

    Order.sequelize.query(queryString, { type: Order.sequelize.QueryTypes.SELECT })
        .then(data => {
            console.log(data)
            res.send(data);
        })
        .catch((err) => {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving orders."
            });
        });
};

exports.thisMonthOrderCount = (req, res) => {
    const queryString = `SELECT COUNT(id) AS NumberOfOrders FROM orders WHERE MONTH(createdAt) = MONTH(CURRENT_DATE())
    AND YEAR(createdAt) = YEAR(CURRENT_DATE());`

    Order.sequelize.query(queryString, { type: Order.sequelize.QueryTypes.SELECT })
        .then(data => {
            res.send(data);
        })
        .catch((err) => {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving orders."
            });
        });
};

exports.weeklyOrderCount = (req, res) => {
    const queryString = `SELECT 
    DAYNAME(createdAt) AS day_of_week,
    COUNT(*) AS order_count
    FROM 
        orders
    WHERE 
        createdAt >= CURDATE() - INTERVAL (DAYOFWEEK(CURDATE()) - 1) DAY
        AND createdAt < CURDATE() + INTERVAL (7 - DAYOFWEEK(CURDATE())) DAY
    GROUP BY 
        day_of_week
    ORDER BY 
        MIN(createdAt);`

    Order.sequelize.query(queryString, { type: Order.sequelize.QueryTypes.SELECT })
        .then(data => {
            res.send(data);
        })
        .catch((err) => {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving orders."
            });
        });
};

exports.monthlyOrderCount = (req, res) => {
    const queryString = `SELECT 
    DATE_FORMAT(createdAt, '%M') AS month_name,
    COUNT(*) AS order_count
    FROM 
        orders
    WHERE 
        YEAR(createdAt) = YEAR(CURDATE())
    GROUP BY 
        month_name
    ORDER BY 
        MIN(createdAt);`

    Order.sequelize.query(queryString, { type: Order.sequelize.QueryTypes.SELECT })
        .then(data => {
            res.send(data);
        })
        .catch((err) => {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving orders."
            });
        });
};

exports.yearlyOrderCount = (req, res) => {
    const queryString = `SELECT COUNT(id) AS NumberOfOrders FROM orders WHERE YEAR(createdAt) = YEAR(CURRENT_DATE());`

    Order.sequelize.query(queryString, { type: Order.sequelize.QueryTypes.SELECT })
        .then(data => {
            res.send(data);
        })
        .catch((err) => {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving orders."
            });
        });
};

exports.getAllProductOrders = (req, res) => {
    const queryString = `
    SELECT 
       p.id, p.productName, p.productCode, p.maxStockLevel, p.price, COUNT(o.productId) AS sold_count
    FROM 
        orders o, products p
    WHERE 
        o.productId LIKE CONCAT('%[', p.id, ']%') OR
        o.productId LIKE CONCAT('%[', p.id, ',%') OR
        o.productId LIKE CONCAT('%,', p.id, ']%') OR
        o.productId LIKE CONCAT('%, ', p.id, ']%') OR
        o.productId LIKE CONCAT('%,', p.id, ',%') 
        
    group by p.id;`

    Order.sequelize.query(queryString, { type: Order.sequelize.QueryTypes.SELECT })
        .then(data => {
            console.log(data)
            res.send(data);
        })
        .catch((err) => {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving orders."
            });
        });
};

exports.newCustomersCount = (req, res) => {
    const queryString = `SELECT COUNT(id) AS NumberOfCustomers FROM customers WHERE DATE(createdAt) = CURDATE();`

    Customers.sequelize.query(queryString, { type: Order.sequelize.QueryTypes.SELECT })
        .then(data => {
            console.log(data)
            res.send(data);
        })
        .catch((err) => {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving orders."
            });
        });
};

exports.updateStocks = (id, count, req, res) => {
    const queryString = `UPDATE orderman.products
                        SET products.maxStockLevel = products.maxStockLevel - '${count}'
                        WHERE products.id = '${id}';`

    Customers.sequelize.query(queryString, { type: Order.sequelize.QueryTypes.SELECT })
        .then(data => {
            console.log(data)
            res(data);
        })
        .catch((err) => {
            res({
                message: err.message || "Some error occurred while retrieving orders."
            });
        });
};