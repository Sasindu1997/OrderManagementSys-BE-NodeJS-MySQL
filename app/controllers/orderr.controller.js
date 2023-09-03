const db = require("../models");
const Orderr = db.orderrs;
const Op = db.Sequelize.Op;
const Products = db.products;
const Customers = db.customers;
const Users = db.users;
const delivery = require("../controllers/delivery.controller");
const SMSController = require("../controllers/sms.controller");
var store = require('store')
const axios = require("axios");

const sendToDelivery = async(req, res) => {
    console.log("**********************************************************************", req)
    const options = {
        url: 'http://fardardomestic.com/api/p_request_v1.02.php',
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': '*/*',
            'Host': 'https://fardardomestic.com'
        },
        host: '<PROXY_HOST>',
        port: '<PROXY_PORT>',
        data: {
            "client_id": req.client_id,
            "api_key": req.api_key,
            "recipient_name": req.recipient_name,
            "recipient_contact_no": req.recipient_contact_no,
            "recipient_address": req.recipient_address,
            "recipient_city": req.recipient_city,
            "parcel_type": req.parcel_type,
            "parcel_description": req.parcel_description,
            "cod_amount": req.cod_amount,
            "order_id": req.order_id,
            "exchange": req.exchange
        }
    };

    await axios(options)
        .then(response => {
            console.log("---------------------------------------------", response);
        }).catch(error => {
            console.log(error);
        });
};

// Create and Save a new Orderr
exports.create = async(req, res) => {
    let deliveryData = {};
    let customerData = {}
    const sendSMS = (mask, numbers) => {
        console.log("numbers", mask, numbers)
        const res = SMSController.login();
        res.then(data => {
            store.set('sms', { accessToken: `${data.data.accessToken}` })
            const resSMS = SMSController.sendSMS(mask, numbers);
            console.log("resSMS", resSMS)
        })
    }

    console.log("req.body.orderId", req.body.orderId)

    console.log(req.body)
        // Validate request
    if (!req.body.productDetails, !req.body.total, !req.body.customerId) {
        res.status(400).send({
            message: "Content can not be empty!"
        });
        return;
    }
    if (req.body.isDeliveryAdded && req.body.deliveryId) {
        const send = async(value) => {
            deliveryData = value ? value.dataValues ? value.dataValues : {} : {};
        }
        let res = await delivery.findOneBE({ params: { id: req.body.deliveryId } }, send);
    }
    if (req.body.customerId) {
        customerData = await Customers.findByPk(req.body.customerId);
        console.log(customerData.dataValues, deliveryData)
    }
    // req.body.isDeliveryAdded
    // req.body.deliveryId

    // Create a Orderr
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
        productDetails: req.body.productDetails,
        customerId: req.body.customerId,
        userId: req.body.userId,
        // orderId: req.body.orderId,
        isActive: req.body.isActive ? req.body.isActive : false,
    };

    // Save Orderr in the database
    Orderr.create(order)
        .then(data => {
            if (data) {
                // Send SMS
                sendSMS(deliveryData && deliveryData.description || "LA ROCHER", customerData && customerData.dataValues.phone)


                // Send to Delivery
                const sendResFrmsendToDelivery = async(value) => {
                    console.log("sendResFrmsendToDelivery", value);
                };

                deliveryData && deliveryData.clientId && deliveryData.apiKey && sendToDelivery({
                    "client_id": deliveryData.clientId,
                    "api_key": deliveryData.apiKey,
                    "recipient_name": customerData.dataValues.fullName,
                    "recipient_contact_no": customerData.dataValues.phone,
                    "recipient_address": customerData.dataValues.address,
                    "recipient_city": customerData.dataValues.district,
                    "parcel_type": 1,
                    "parcel_description": "test test test",
                    "cod_amount": req.body.total,
                    "order_id": req.body.orderId,
                    "exchange": 0,
                }, sendResFrmsendToDelivery)
            }
            res.send(data);

        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while creating the Orderr."
            });
        });
};

exports.createByBE = (newOrderr, send) => {
    // Validate request

    // Create a Orderr
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

    // Save Orderr in the database
    Orderr.create(newOrderr)
        .then(data => {
            send(data);
        })
        .catch(err => {
            send({
                message: err.message || "Some error occurred while creating the Orderr."
            });
        });
};

// Retrieve all Orderrs from the database.
exports.findAll = (req, res) => {
    const customerId = req.query.customerId;
    var condition = customerId ? {
        customerId: {
            [Op.like]: `%${customerId}%`
        }
    } : null;

    Orderr.findAll({ where: condition })
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

// Find a single Orderr with an id
exports.findOne = (req, res) => {
    const id = req.params.id;

    Orderr.findByPk(id)
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
                    message: `Cannot find Orderr with id=${id}.`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Error retrieving Orderr with id=" + id
            });
        });
};

exports.findOneByBarcode = (req, res) => {
    const barcode = req.params.barcode;
    console.log("sssssssssssssssssssssssssss", req.params.barcode)
    var condition = barcode ? {
        barcode: barcode
    } : null;

    Orderr.findOne({ where: condition })
        .then(async data => {
            if (data) {
                if (data) {
                    data.dataValues.productDetails = []
                    for (let j = 0; j < data.dataValues.productId.length; j++) {
                        await Products.findByPk(data.dataValues.productId[j]).then(dt => {
                            dt && dt.dataValues && data.dataValues.productDetails.push({
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
                    message: `Cannot find Orderr with barcode=${barcode}.`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Error retrieving Orderr with barcode=" + barcode
            });
        });
};

exports.searchBy = (req, res) => {
    console.log(req.params)
    const searchSelect = req.params.searchSelect;
    const searchvalue = req.params.searchvalue;
    const queryString = `SELECT * FROM orders INNER JOIN customers ON orders.customerId = customers.id AND customers.${searchSelect} LIKE '%${searchvalue}';`

    Orderr.sequelize.query(queryString, { type: Orderr.sequelize.QueryTypes.SELECT })
        .then(r => res.send(r))
        .catch((err) => {
            throw err;
        });
};

exports.searchByCusPhone = (phn, res) => {
    const queryString = `SELECT * FROM orders INNER JOIN customers ON orders.customerId = customers.id AND FIND_IN_SET('${phn}', customers.phone);`

    Orderr.sequelize.query(queryString, { type: Orderr.sequelize.QueryTypes.SELECT })
        .then(r => res(r))
        .catch((err) => {
            res(err)
        });
};

// Update a Orderr by the id in the request
exports.update = (req, res) => {
    const id = req.params.id;

    Orderr.update(req.body, {
            where: { id: id }
        })
        .then(num => {
            if (num == 1) {
                res.send({
                    message: "Orderr was updated successfully."
                });
            } else {
                res.send({
                    message: `Cannot update Orderr with id=${id}. Maybe Orderr was not found or req.body is empty!`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Error updating Orderr with id=" + id
            });
        });
};

// Delete a Orderr with the specified id in the request
exports.delete = (req, res) => {
    const id = req.params.id;

    Orderr.destroy({
            where: { id: id }
        })
        .then(num => {
            if (num == 1) {
                res.send({
                    message: "Orderr was deleted successfully!"
                });
            } else {
                res.send({
                    message: `Cannot delete Orderr with id=${id}. Maybe Orderr was not found!`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Could not delete Orderr with id=" + id
            });
        });
};

// Delete all Orderrs from the database.
exports.deleteAll = (req, res) => {
    Orderr.destroy({
            where: {},
            truncate: false
        })
        .then(nums => {
            res.send({ message: `${nums} Orderrs were deleted successfully!` });
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while removing all orders."
            });
        });
};

// Find all published Orderrs
exports.findAllPublished = (req, res) => {
    Orderr.findAll({ where: { published: true } })
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving orders."
            });
        });
};

exports.todayOrderrCount = (req, res) => {
    const queryString = `SELECT COUNT(id) AS NumberOfOrderrs FROM orders WHERE DATE(createdAt) = CURDATE();`

    Orderr.sequelize.query(queryString, { type: Orderr.sequelize.QueryTypes.SELECT })
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

exports.thisMonthOrderrCount = (req, res) => {
    const queryString = `SELECT COUNT(id) AS NumberOfOrderrs FROM orders WHERE MONTH(createdAt) = MONTH(CURRENT_DATE())
    AND YEAR(createdAt) = YEAR(CURRENT_DATE());`

    Orderr.sequelize.query(queryString, { type: Orderr.sequelize.QueryTypes.SELECT })
        .then(data => {
            res.send(data);
        })
        .catch((err) => {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving orders."
            });
        });
};

exports.weeklyOrderrCount = (req, res) => {
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

    Orderr.sequelize.query(queryString, { type: Orderr.sequelize.QueryTypes.SELECT })
        .then(data => {
            res.send(data);
        })
        .catch((err) => {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving orders."
            });
        });
};

exports.monthlyOrderrCount = (req, res) => {
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

    Orderr.sequelize.query(queryString, { type: Orderr.sequelize.QueryTypes.SELECT })
        .then(data => {
            res.send(data);
        })
        .catch((err) => {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving orders."
            });
        });
};

exports.yearlyOrderrCount = (req, res) => {
    const queryString = `SELECT COUNT(id) AS NumberOfOrderrs FROM orders WHERE YEAR(createdAt) = YEAR(CURRENT_DATE());`

    Orderr.sequelize.query(queryString, { type: Orderr.sequelize.QueryTypes.SELECT })
        .then(data => {
            res.send(data);
        })
        .catch((err) => {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving orders."
            });
        });
};

exports.getAllProductOrderrs = (req, res) => {
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

    Orderr.sequelize.query(queryString, { type: Orderr.sequelize.QueryTypes.SELECT })
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

    Customers.sequelize.query(queryString, { type: Orderr.sequelize.QueryTypes.SELECT })
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

    Customers.sequelize.query(queryString, { type: Orderr.sequelize.QueryTypes.SELECT })
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