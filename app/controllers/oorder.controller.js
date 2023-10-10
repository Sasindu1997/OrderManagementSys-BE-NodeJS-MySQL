"use strict";
var sequelize = require("sequelize");
const db = require("../models");
const Orderr = db.oorders;
const Op = db.Sequelize.Op;
const Products = db.products;
const Customers = db.customers;
const Users = db.users;
const Order = db.oorders;
const delivery = require("../controllers/delivery.controller");
const SMSController = require("../controllers/sms.controller");
const OrderController = require("../controllers/oorder.controller");
var store = require('store')
const axios = require("axios");
// const InvoiceNumber = require("invoice-number");


const sendToDelivery2 = async(req, res) => {
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

const sendToDelivery = async (req) => {
    console.log(req)
    let data = new FormData();
    // data.append('api_key', 'api64f549a9bcb3d');
    // data.append('recipient_name', 'customer 2');
    // data.append('recipient_contact_no', '0778800000');
    // data.append('recipient_address', 'No.02, test lane, test district, test country');
    // data.append('recipient_city', 'colombo');
    // data.append('parcel_type', '1');
    // data.append('parcel_description', 'test test test');
    // data.append('cod_amount', '11111111111');
    // data.append('order_id', '45464565');
    // data.append('exchange', '0');

    data.append('client_id', `${req.client_id}`);
    data.append('api_key', `${req.api_key}`);
    data.append('recipient_name', `${req.recipient_name}`);
    data.append('recipient_contact_no', `${req.recipient_contact_no}`);
    data.append('recipient_address', `${req.recipient_address}`);
    data.append('recipient_city', `${req.recipient_city}`);
    data.append('parcel_type', req.parcel_type);
    data.append('parcel_description', `${req.parcel_description}`);
    data.append('cod_amount', `${req.cod_amount}`);
    data.append('order_id', `${req.order_id}`);
    data.append('exchange', 0);
    
    let config = {
      method: 'post',
    //   maxBodyLength: Infinity,
      url: 'https://fardardomestic.com/api/p_request_v1.02.php',
      headers: {
        'Accept': 'application/json',
        'Content-Type': '*/*',
        'Host': 'https://fardardomestic.com'
    },
      data : data
    };
    
    await axios.request(config)
    .then((response) => {
      console.log(JSON.stringify(response.data));
      return response.data; 
    })
    .catch((error) => {
      console.log(error);
      return error;
    });
    
}

// Create and Save a new Orderr
exports.create = async(req, res) => {
    let deliveryData = {};
    let customerData = {};
    let customerId = 0;
    let supplierData = {};
    let newInvoiceNumber = false;
    const sendSMS = (mask, numbers, smsbody) => {
        console.log("numbers", mask, numbers)
        const res = SMSController.login();
        res.then(data => {
            store.set('sms', { accessToken: `${data.data.accessToken}` })
            const resSMS = SMSController.sendSMS(mask, numbers, smsbody);
            console.log("resSMS", resSMS)
        })
    }

    const sendResFrmLat = async(value) => {
        newInvoiceNumber = value.length > 0 ? parseInt(value[0].invoiceNumber) + 1 : '000001'; 
        // console.log("sendResFrmLat ", value[0].invoiceNumber + 1, newInvoiceNumber)
    };
    let resL = await OrderController.getLatestRec({}, sendResFrmLat);

    console.log("req.body.orderId", req.body.orderId)

    console.log(req.body)
        // Validate request
    if (!req.body.productDetails, !req.body.total, !req.body.fullName, !req.body.phone, !req.body.address) {
        res.status(400).send({
            message: "Content can not be empty!"
        });
        return;
    }
    if (req.body.supplierId) {
        supplierData = await Users.findByPk(req.body.supplierId);
    }
    // req.body.isDeliveryAdded
    // req.body.deliveryId

    const trackingNumber = (pr, su) => {
        for (let i = 0; i < 5; i++) pr += ~~(Math.random() * 10);
        return pr + su;
    };

    if (req.body.isDeliveryAdded && req.body.deliveryId) {
        const send = async(value) => {
            deliveryData = value ? value.dataValues ? value.dataValues : {} : {};
        }
        let res = await delivery.findOneBE({ params: { id: req.body.deliveryId } }, send);
    }
    if (req.body.customerId) {
        customerData = await Customers.findByPk(req.body.customerId);
    }else {
        // Create a Customer
    const customer = {
        fullName: req.body.fullName,
        email: req.body.email,
        phone: req.body.phone,
        phone2: req.body.phone2,
        address: req.body.address,
        district: req.body.district,
        isActive: true,
    };

    // Save Customer in the database
    Customers.create(customer)
        .then(async data => {
            console.log("-----------------------------------------------------------------")
            console.log(data.dataValues.id)
            customerId = data.dataValues.id
        
            // Create a Orderr
            const order = {
                barcode: req.body.barcode || trackingNumber("LR001", "SO"),
                weight: req.body.weight,
                total: req.body.total,
                status: req.body.status,
                shippingAddress: req.body.address,
               
                paymentMethod: req.body.paymentMethod,
                shippingMethod: req.body.shippingMethod,
                trackingNumber: req.body.trackingNumber || trackingNumber("LR001", "SO"),
                productId: req.body.productId,
                productDetails: req.body.productDetails,
        
                cusName: req.body.fullName,
                cusPhone: req.body.phone,
        
                customerId: data.dataValues.id,
                fullName: req.body.fullName,
                email: req.body.email,
                phone: req.body.phone,
                phone2: req.body.phone2,
                address: req.body.address,
                district: req.body.district,
                
                userId: req.body.userId,
                // orderId: req.body.orderId,
                userRole: req.body.userRole,
                userName: req.body.userName,
                subTotal: req.body.subTotal, 
                deliveryCharge: req.body.deliveryCharge ? req.body.deliveryCharge : '0',
                finalStatus: req.body.finalStatus, 
                hub: req.body.hub, 
                invoiceNumber: newInvoiceNumber ? newInvoiceNumber : '000001', 
                parcelType: req.body.parcelType, 
                deliveryId: req.body.deliveryId, 
                supplierName: supplierData && supplierData.fullName, 
                supplierId: req.body.supplierId ?  req.body.supplierId : '0',
                remark: req.body.remark, 
                isActive: req.body.isActive ? req.body.isActive : false,
                createdAt: req.body.createdAt
            };
        
            // Save Orderr in the database
            Orderr.create(order)
                .then(data => {
                    if (data) {
                        // update stocks
                        req.body.productDetails && req.body.productDetails.map(product => {
                            console.log("ppppppppppppppppppppp", product, product.prid, product.prc)
                            OrderController.updateStocksSingle(product.prid, product.prc)
                        })
        
                        // Send SMS
                        sendSMS(deliveryData && deliveryData.description || "LA ROCHER", req.body.phone || req.body.phone2, req.body.smsbody )
        
                        // Send to Delivery
                        // const sendResFrmsendToDelivery = async(value) => {
                        //     console.log("sendResFrmsendToDelivery", value);
                        // };
        
                        // deliveryData && deliveryData.clientId && deliveryData.apiKey && sendToDelivery({
                        //     "client_id": deliveryData.clientId,
                        //     "api_key": deliveryData.apiKey,
                        //     "recipient_name": customerData.dataValues.fullName,
                        //     "recipient_contact_no": customerData.dataValues.phone,
                        //     "recipient_address": customerData.dataValues.address,
                        //     "recipient_city": customerData.dataValues.district,
                        //     "parcel_type": 1,
                        //     "parcel_description": "test test test",
                        //     "cod_amount": req.body.total,
                        //     "order_id": req.body.orderId,
                        //     "exchange": 0,
                        // }, sendResFrmsendToDelivery)
                    }
                    res.send(data);
                })
                .catch(err => {
                    res.status(500).send({
                        message: err.message || "Some error occurred while creating the Orderr."
                    });
                });
                

        })
        .catch(err => {
            console.log(err)
        });
    }
    
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

    Orderr.findAll({ where: condition, order: Orderr.sequelize.literal('id DESC') })
        .then(async data => {

            async function addData() {
                for (let index = 0; index < data.length; index++) {
                    const element = data[index];
                    element.dataValues.productData = []
                        // console.log("666666666666666666666666666", element._previousDataValues.productDetails.length)
                    for (let j = 0; j < element._previousDataValues.productDetails.length; j++) {
                        console.log("****************************", element._previousDataValues.productDetails[j])
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
                    data.dataValues.productData = []
                        // console.log("666666666666666666666666666", element._previousDataValues.productDetails.length)
                    for (let j = 0; j < data._previousDataValues.productDetails.length; j++) {
                        console.log("****************************", data._previousDataValues.productDetails[j])
                        await Products.findByPk(data._previousDataValues.productDetails[j].prid).then(dt => {

                            dt && dt.dataValues && data.dataValues.productData.push({
                                pId: data._previousDataValues.productDetails[j].prid,
                                pName: dt.dataValues.productName,
                                pCode: dt.dataValues.productCode,
                                pdescription: dt.dataValues.description,
                                pprice: dt.dataValues.price,
                                pcategoryId: dt.dataValues.categoryId,
                                psubCategoryId: dt.dataValues.subCategoryId,
                                pbrand: dt.dataValues.brand,
                                pvolume: dt.dataValues.volume,
                                ptype: dt.dataValues.type,
                                ocount: data._previousDataValues.productDetails[j].prc,

                            })
                        })
                    }
                    data && data.dataValues && await Customers.findByPk(data.dataValues.customerId).then(dt => {
                        // console.log("]]]]]]]]]]]]]]]]]]]]]]]]]]]]", dt.dataValues.fullName)

                        dt && dt.dataValues ? data.dataValues.cfullName = dt.dataValues.fullName : data.dataValues.cfullName = '',
                            dt && dt.dataValues ? data.dataValues.cemail = dt.dataValues.email : data.dataValues.cemail = '',
                            dt && dt.dataValues ? data.dataValues.cphone = dt.dataValues.phone : data.dataValues.cphone = '',
                            dt && dt.dataValues ? data.dataValues.caddress = dt.dataValues.address : data.dataValues.caddress = '',
                            dt && dt.dataValues ? data.dataValues.cdistrict = dt.dataValues.district : data.dataValues.cdistrict = '',
                            dt && dt.dataValues ? data.dataValues.ccfullName = dt.dataValues.fullName : data.dataValues.ccfullName = ''

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

exports.findOneLocal = (id, res) => {
    Orderr.findByPk(id)
        .then(async data => {
            if (data) {
                if (data) {
                    data.dataValues.productData = []
                        // console.log("666666666666666666666666666", element._previousDataValues.productDetails.length)
                    for (let j = 0; j < data._previousDataValues.productDetails.length; j++) {
                        console.log("****************************", data._previousDataValues.productDetails[j])
                        await Products.findByPk(data._previousDataValues.productDetails[j].prid).then(dt => {

                            dt && dt.dataValues && data.dataValues.productData.push({
                                pId: data._previousDataValues.productDetails[j].prid,
                                pName: dt.dataValues.productName,
                                pCode: dt.dataValues.productCode,
                                pdescription: dt.dataValues.description,
                                pprice: dt.dataValues.price,
                                pcategoryId: dt.dataValues.categoryId,
                                psubCategoryId: dt.dataValues.subCategoryId,
                                pbrand: dt.dataValues.brand,
                                pvolume: dt.dataValues.volume,
                                ptype: dt.dataValues.type,
                                ocount: data._previousDataValues.productDetails[j].prc,

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
            console.log("12258213", data)
            if (data) {
                if (data) {
                    data.dataValues.productData = []
                        // console.log("666666666666666666666666666", element._previousDataValues.productDetails.length)
                    for (let j = 0; j < data._previousDataValues.productDetails.length; j++) {
                        console.log("****************************", data._previousDataValues.productDetails[j])
                        await Products.findByPk(data._previousDataValues.productDetails[j].prid).then(dt => {

                            dt && dt.dataValues && data.dataValues.productData.push({
                                pId: data._previousDataValues.productDetails[j].prid,
                                pName: dt.dataValues.productName,
                                pCode: dt.dataValues.productCode,
                                pdescription: dt.dataValues.description,
                                pprice: dt.dataValues.price,
                                pcategoryId: dt.dataValues.categoryId,
                                psubCategoryId: dt.dataValues.subCategoryId,
                                pbrand: dt.dataValues.brand,
                                pvolume: dt.dataValues.volume,
                                ptype: dt.dataValues.type,
                                ocount: data._previousDataValues.productDetails[j].prc,

                            })
                        })
                    }
                    data && data.dataValues && await Customers.findByPk(data.dataValues.customerId).then(dt => {
                        console.log("]]]]]]]]]]]]]]]]]]]]]]]]]]]]", dt.dataValues.fullName)

                        dt && dt.dataValues ? data.dataValues.cfullName = dt.dataValues.fullName : data.dataValues.cfullName = '',
                            dt && dt.dataValues ? data.dataValues.cemail = dt.dataValues.email : data.dataValues.cemail = '',
                            dt && dt.dataValues ? data.dataValues.cphone = dt.dataValues.phone : data.dataValues.cphone = '',
                            dt && dt.dataValues ? data.dataValues.caddress = dt.dataValues.address : data.dataValues.caddress = '',
                            dt && dt.dataValues ? data.dataValues.cdistrict = dt.dataValues.district : data.dataValues.cdistrict = '',
                            dt && dt.dataValues ? data.dataValues.ccfullName = dt.dataValues.fullName : data.dataValues.ccfullName = ''

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
    const queryString = `SELECT * FROM oorders INNER JOIN customers ON oorders.customerId = customers.id AND customers.${searchSelect} LIKE '%${searchvalue}' ORDER BY oorders.id DESC;`

    order: Orderr.sequelize.literal('id DESC')

    Orderr.sequelize.query(queryString, { type: Orderr.sequelize.QueryTypes.SELECT })
        .then(async data => {
            async function addData() {
                for (let element of data) {
                    console.log("666666666666666666666666666", element)
                    element.productData = []
                    for (let j = 0; j < element.productDetails.length; j++) {
                        console.log("****************************", element.productDetails[j])
                        await Products.findByPk(element.productDetails[j].prid).then(dt => {

                            dt && dt.dataValues && element.productData.push({
                                pId: element.productDetails[j].prid,
                                pName: dt.dataValues.productName,
                                pCode: dt.dataValues.productCode,
                                pdescription: dt.dataValues.description,
                                pprice: dt.dataValues.price,
                                pcategoryId: dt.dataValues.categoryId,
                                psubCategoryId: dt.dataValues.subCategoryId,
                                pbrand: dt.dataValues.brand,
                                pvolume: dt.dataValues.volume,
                                ptype: dt.dataValues.type,
                                ocount: element.productDetails[j].prc,

                            })
                        })
                    }

                    element && await Customers.findByPk(element.customerId).then(dt => {
                        dt && dt.dataValues ? element.cfullName = dt.dataValues.fullName : element.cfullName = '',
                            dt && dt.dataValues ? element.cemail = dt.dataValues.email : element.cemail = '',
                            dt && dt.dataValues ? element.cphone = dt.dataValues.phone : element.cphone = '',
                            dt && dt.dataValues ? element.caddress = dt.dataValues.address : element.caddress = '',
                            dt && dt.dataValues ? element.cdistrict = dt.dataValues.district : element.cdistrict = ''

                    })
                    element && element.dataValues && await Users.findByPk(element.userId).then(dt => {
                        dt && dt.dataValues ? element.ufullName = dt.dataValues.fullName : element.cfullName = '',
                            dt && dt.dataValues ? element.uemail = dt.dataValues.email : element.uemail = '',
                            dt && dt.dataValues ? element.urole = dt.dataValues.role : element.urole = '',
                            dt && dt.dataValues ? element.uphoneNumber = dt.dataValues.phoneNumber : element.uphoneNumber = '',
                            dt && dt.dataValues ? element.uaddress = dt.dataValues.address : element.uaddress = ''
                    })
                }
            }
            await addData();
            res.send(data)
        })
        .catch((err) => {
            throw err;
        });
};

exports.searchByCusPhone = (phn, res) => {
    const queryString = `SELECT * FROM oorders INNER JOIN customers ON oorders.customerId = customers.id AND FIND_IN_SET('${phn}', customers.phone);`
    console.log("---------------------------", queryString)
    Orderr.sequelize.query(queryString, { type: Orderr.sequelize.QueryTypes.SELECT })
        .then(r => res(r))
        .catch((err) => {
            res(err)
        });
};

// Update a Orderr by the id in the request
exports.update = (req, res) => {
    const id = req.params.id;
    console.log(req.body)
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
            res.send({ message: `${nums} Orders were deleted successfully!` });
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while removing all orders."
            });
        });
};

// Find all published oorders
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

    Customers.sequelize.query(queryString, { type: Orderr.sequelize.QueryTypes.UPDATE })
        .then(data => {
            console.log("9999999999999999", data)
            res(data);
        })
        .catch((err) => {
            res({
                message: err.message || "Some error occurred while retrieving orders."
            });
        });
};

exports.updateStocksSingle = (id, count) => {
    console.log("ppppppppppppppppppppppppppppppppppppppppppp", id, count)
    const queryString = `UPDATE orderman.products
                        SET products.maxStockLevel = products.maxStockLevel - '${count}'
                        WHERE products.id = '${id}';`

    id && count && Customers.sequelize.query(queryString, { type: Order.sequelize.QueryTypes.SELECT })
        .then(data => {
            console.log(data)
        })
        .catch((err) => {
            console.log(err)
        });
};

exports.findAllReturned = (req, res) => {
    var condition = {
        status: {
            [Op.like]: `%${'Returned'}%`
        }
    };

    Orderr.findAll({ where: condition, order: Orderr.sequelize.literal('id DESC') })
        .then(async data => {
            async function addData() {
                for (let index = 0; index < data.length; index++) {
                    const element = data[index];
                    element.dataValues.productData = []
                        // console.log("666666666666666666666666666", element._previousDataValues.productDetails.length)
                    for (let j = 0; j < element._previousDataValues.productDetails.length; j++) {
                        console.log("****************************", element._previousDataValues.productDetails[j])
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

exports.findAllCancelled = (req, res) => {
    var condition = {
        status: {
            [Op.like]: `%${'Cancelled'}%`
        }
    };

    Orderr.findAll({ where: condition, order: Orderr.sequelize.literal('id DESC') })
        .then(async data => {
            async function addData() {
                for (let index = 0; index < data.length; index++) {
                    const element = data[index];
                    element.dataValues.productData = []
                        // console.log("666666666666666666666666666", element._previousDataValues.productDetails.length)
                    for (let j = 0; j < element._previousDataValues.productDetails.length; j++) {
                        console.log("****************************", element._previousDataValues.productDetails[j])
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

exports.findAllExchanged = (req, res) => {
    var condition = {
        status: {
            [Op.like]: `%${'Exchanged'}%`
        }
    };

    Orderr.findAll({ where: condition, order: Orderr.sequelize.literal('id DESC') })
        .then(async data => {
            async function addData() {
                for (let index = 0; index < data.length; index++) {
                    const element = data[index];
                    element.dataValues.productData = []
                        // console.log("666666666666666666666666666", element._previousDataValues.productDetails.length)
                    for (let j = 0; j < element._previousDataValues.productDetails.length; j++) {
                        console.log("****************************", element._previousDataValues.productDetails[j])
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

exports.cancelOrder = (req, res) => {
    console.log(req.body.isChecked)
    const queryString = `UPDATE orderman.oorders
        SET oorders.status = 'Cancelled'
        WHERE oorders.id = '${req.params.id}';`

    Orderr.sequelize.query(queryString, { type: Orderr.sequelize.QueryTypes.update })
        .then(data => {
            req.body.isChecked && OrderController.updateStocksReturned(req.params.id)
            console.log(data)
            res.send(data);
        })
        .catch((err) => {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving orders."
            });
        });
};

exports.exchangeOrder = (req, res) => {
    const queryString = `UPDATE orderman.oorders
        SET oorders.status = 'Exchanged'
        WHERE oorders.id = '${req.params.id}';`

    Orderr.sequelize.query(queryString, { type: Orderr.sequelize.QueryTypes.update })
        .then(data => {
            req.body.isChecked && OrderController.updateStocksReturned(req.params.id)
            res.send(data);
        })
        .catch((err) => {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving orders."
            });
        });
};

exports.returnOrder = (req, res) => {

    const queryString = `UPDATE orderman.oorders
    SET oorders.status = 'Returned'
    WHERE oorders.id = '${req.params.id}';`

    Orderr.sequelize.query(queryString, { type: Orderr.sequelize.QueryTypes.update })
        .then(data => {
            console.log(data)
            req.body.isChecked && OrderController.updateStocksReturned(req.params.id)
            res.send(data);
        })
        .catch((err) => {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving orders."
            });
        });
};

exports.updateStocksReturned = (id, count) => {

    const queryString = `SELECT * FROM orderman.oorders
                        WHERE oorders.id = '${id}';`

    id && Orderr.sequelize.query(queryString, { type: Orderr.sequelize.QueryTypes.SELECT })
        .then(data => {
            data[0] && data[0].productDetails && data[0].productDetails.map(prod => {
                const queryString = `UPDATE orderman.products
                SET products.maxStockLevel = products.maxStockLevel + '${prod.prc}'
                WHERE products.id = '${prod.prid}';`

                Orderr.sequelize.query(queryString, { type: Orderr.sequelize.QueryTypes.update })
                    .then(data => {
                        console.log("reddddddddddddddddds", data)
                    })
                    .catch((err) => {
                        console.log(err)
                    });
            })
        })
        .catch((err) => {
            console.log(err)
        });
};

exports.getLatestRec = (req, res) => {
    const queryString = `SELECT * FROM orderman.oorders ORDER BY id DESC LIMIT 1;`
    Orderr.sequelize.query(queryString, { type: Orderr.sequelize.QueryTypes.SELECT })
        .then(data => {
            res(data)
        })
        .catch((err) => {
            console.log(err)
        });
};

//get orders by supplier id
exports.getOrdersBySupplierId = (req, res) => {

    const queryString = `SELECT 
    DATE_FORMAT(calendar.month, '%Y-%m') AS month,
    COALESCE(COUNT(o.id), 0) AS order_count
FROM (
    SELECT DATE_FORMAT(DATE_SUB(CURRENT_DATE, INTERVAL 11 MONTH), '%Y-%m-01') AS month
    UNION ALL
    SELECT DATE_FORMAT(DATE_SUB(CURRENT_DATE, INTERVAL 10 MONTH), '%Y-%m-01')
    UNION ALL
    SELECT DATE_FORMAT(DATE_SUB(CURRENT_DATE, INTERVAL 9 MONTH), '%Y-%m-01')
    UNION ALL
    SELECT DATE_FORMAT(DATE_SUB(CURRENT_DATE, INTERVAL 8 MONTH), '%Y-%m-01')
    UNION ALL
    SELECT DATE_FORMAT(DATE_SUB(CURRENT_DATE, INTERVAL 7 MONTH), '%Y-%m-01')
    UNION ALL
    SELECT DATE_FORMAT(DATE_SUB(CURRENT_DATE, INTERVAL 6 MONTH), '%Y-%m-01')
    UNION ALL
    SELECT DATE_FORMAT(DATE_SUB(CURRENT_DATE, INTERVAL 5 MONTH), '%Y-%m-01')
    UNION ALL
    SELECT DATE_FORMAT(DATE_SUB(CURRENT_DATE, INTERVAL 4 MONTH), '%Y-%m-01')
    UNION ALL
    SELECT DATE_FORMAT(DATE_SUB(CURRENT_DATE, INTERVAL 3 MONTH), '%Y-%m-01')
    UNION ALL
    SELECT DATE_FORMAT(DATE_SUB(CURRENT_DATE, INTERVAL 2 MONTH), '%Y-%m-01')
    UNION ALL
    SELECT DATE_FORMAT(DATE_SUB(CURRENT_DATE, INTERVAL 1 MONTH), '%Y-%m-01')
    UNION ALL
    SELECT DATE_FORMAT(CURRENT_DATE, '%Y-%m-01') -- Include the current month
) AS calendar
LEFT JOIN 
    orderman.oorders o
ON 
    DATE_FORMAT(o.createdAt, '%Y-%m') = DATE_FORMAT(calendar.month, '%Y-%m')
    AND o.supplierId = '${req.params.id}'
GROUP BY 
    DATE_FORMAT(calendar.month, '%Y-%m')
ORDER BY 
    DATE_FORMAT(calendar.month, '%Y-%m');`


    Orderr.sequelize.query(queryString, { type: Orderr.sequelize.QueryTypes.SELECT })
        .then(data => {
            res.send(data)
        })
        .catch((err) => {
            res.send(err)
        });
};

// Retrieve all oorders from the database.
exports.multipleSearch = (req, res) => {

    const customerId = req.query.customerId;
    const cusName = req.query.customerName;
    const cusPhone = req.query.customerPhone;
    const supplierName = req.query.supplier;
    const status = req.query.status;
    const trackingNumber = req.query.trackingNo;
    const createdAt = req.query.createdAt;
    const endDate = req.query.endDate;

    
    const d1 = `${createdAt}T00:00:00.000Z`;
    const d2 = `${endDate}T00:00:00.000Z`;

    const id = req.query.id;

    var condition = {
        cusName: {
            [Op.like]: `%${cusName}%`
        },
        cusPhone: {
            [Op.like]: `%${cusPhone}%`
        },
        supplierName: {
            [Op.like]: `%${supplierName}%`
        },
        status:{
            [Op.like]: `%${status}%`
        },
        trackingNumber: {
            [Op.like]: `%${trackingNumber}%`
        },
        createdAt : { 
            [Op.between]: [d1,d2]
          },
        id: {
            [Op.like]: `%${id}%`
        }
    };

    for (const key in condition) {
        if (condition[key] && condition[key][Op.like] && condition[key][Op.like].includes('%%')) {
            delete condition[key];
        }
    }
    
    console.log("######################################################", condition)


    Orderr.findAll({ where: condition, order: Orderr.sequelize.literal('id DESC') })
        .then(async data => {

            async function addData() {
                for (let index = 0; index < data.length; index++) {
                    const element = data[index];
                    element.dataValues.productData = []
                        // console.log("666666666666666666666666666", element._previousDataValues.productDetails.length)
                    for (let j = 0; j < element._previousDataValues.productDetails.length; j++) {
                        console.log("****************************", element._previousDataValues.productDetails[j])
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
            await addData();
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving orders."
            });
        });
};

exports.multipleSearchDash = (req, res) => {

    const customerId = req.query.customerId;
    const cusName = req.query.customerName;
    const cusPhone = req.query.customerPhone;
    const supplierName = req.query.supplier;
    const status = req.query.status;
    const trackingNumber = req.query.trackingNo;
    const createdAt = req.query.createdAt;
    const endDate = req.query.endDate;
    
    const d1 = `${createdAt}T00:00:00.000Z`;
    const d2 = `${endDate}T00:00:00.000Z`;

    const id = req.query.id;

    var condition = {
        cusName: {
            [Op.like]: `%${cusName}%`
        },
        cusPhone: {
            [Op.like]: `%${cusPhone}%`
        },
        supplierName: {
            [Op.like]: `%${supplierName}%`
        },
        status:{
            [Op.like]: `%${status}%`
        },
        trackingNumber: {
            [Op.like]: `%${trackingNumber}%`
        },
        createdAt : { 
            [Op.between]: [d1,d2]
          },
        id: {
            [Op.like]: `%${id}%`
        }
    };

    for (const key in condition) {
        if (condition[key] && condition[key][Op.like] && condition[key][Op.like].includes('%%')) {
            delete condition[key];
        }
    }
    
    console.log("######################################################", condition)
    let dataArr2 = {}

    Orderr.findAll({
        attributes: [
          [sequelize.fn('sum', sequelize.col('total')), 'sum'],
        ],
        where : condition
      })
        .then(data => {
            res.send(data);
        })
        .catch((err) => {
            console.log(err);
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
                        // console.log("666666666666666666666666666", element._previousDataValues.productDetails.length)
                    for (let j = 0; j < element._previousDataValues.productDetails.length; j++) {
                        console.log("****************************", element._previousDataValues.productDetails[j])
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
            await addData();
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving orders."
            });
        });
};