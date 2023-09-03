const db = require("../models");
const Tutorial = db.tutorials;
const customers = require("../controllers/customer.controller");
const delivery = require("../controllers/delivery.controller");
const order = require("../controllers/order.controller");
const product = require("../controllers/product.controller");
const SMSController = require("../controllers/sms.controller");
var store = require('store')
const { DELIVERY_URL } = require("../config/env.config");

const fs = require("fs");
const csv = require("fast-csv");
const axios = require("axios");

function setCharAt(str, index, chr) {
    if (index > str.length - 1) return str;
    return str.substring(0, index) + chr + str.substring(index + 1);
}

const uploadInit = async(req, res) => {
    console.log("#############", req.file,
        req.body.isDeliveryAdded,
        req.body.userId,
        req.body.deliveryId);

    let deliveryData = {};

    if (req.body.isDeliveryAdded && req.body.deliveryId) {
        const send = async(value) => {
            deliveryData = value ? value.dataValues ? value.dataValues : {} : {};
        }
        let res = await delivery.findOneBE({ params: { id: req.body.deliveryId } }, send);
    }

    try {
        if (req.file == undefined) {
            return res.status(400).send("Please upload a CSV file!");
        }

        let tutorials = [];
        console.log("***************************************************")

        console.log("__basedir", __basedir)
        let path = __basedir + "/resources/static/assets/uploads/" + req.file.filename;
        let prevOrderArray = [];
        let customerPhnArray = [];
        let customerNewPhnArray = [];
        let duplicatePhnArray = [];
        let duplicatePhnNoArray = [];

        fs.createReadStream(path)
            .pipe(csv.parse({ headers: true }))
            .on("error", (error) => {
                throw error.message;
            })
            .on("data", async(row) => {
                console.log(row)
                tutorials.push(row);



                // 1.0
                //check multiple phone numbers
                let customerPhone = row['Recipient Mobile'];
                if (customerPhone.includes("/")) {
                    customerPhnArray = customerPhone.split("/");
                } else {
                    customerPhnArray.push(customerPhone);
                }

                // 2.0
                //Check previous customers
                await customerPhnArray.map(async(number) => {
                    if (number.charAt(0) == '0') {
                        let newNO = '';
                        newNO = setCharAt(number, 0, '94')
                        customerNewPhnArray.push(newNO);

                        const send = async(value) => {
                            console.log("Check previous customers", value);
                            value.length > 0 ? duplicatePhnArray.push(value) && duplicatePhnNoArray.push(newNO) : '';

                            // 3.0
                            //show previous orders
                            const showPrevOrders = async() => {
                                if (duplicatePhnArray.length > 0) {
                                    const send2 = async(value) => {
                                        console.log("Check previous orders", value);
                                        return value.length > 0 ? prevOrderArray.push({ phone: newNO, orders: value }) : '';
                                    }

                                    // 9488656396
                                    await order.searchByCusPhone(newNO, send2)
                                }
                            }
                            showPrevOrders()
                        }

                        // 9488656396
                        let res = await customers.findByMobileNo(newNO, send);
                        console.log("res", res)
                    }
                })
                console.log("vvvvvvvvvvvvvvvvvvvvvvvvvvvvv", prevOrderArray)

            })
            .on("end", async() => {
                console.log("Eeeeeeeeeeeeeennnnnnnnndddddd", prevOrderArray);
                setTimeout(function() {
                    return res.status(200).send({
                        message: "Uploaded the file successfully: " + req.file.originalname,
                        data: prevOrderArray
                    });
                }, 2000);

                // Tutorial.bulkCreate(tutorials)
                //     .then(() => {
                //         res.status(200).send({
                //             message: "Uploaded the file successfully: " + req.file.originalname,
                //         });
                //     })
                //     .catch((error) => {
                //         res.status(500).send({
                //             message: "Fail to import data into database!",
                //             error: error.message,
                //         });
                //     });
            })
    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: "Could not upload the file: " + req.file.originalname,
        });
    }
};

const upload = async(req, res) => {
    console.log("#############", req.file,
        req.body.isDeliveryAdded,
        req.body.userId,
        req.body.deliveryId);

    let deliveryData = {};

    if (req.body.isDeliveryAdded && req.body.deliveryId) {
        const send = async(value) => {
            deliveryData = value ? value.dataValues ? value.dataValues : {} : {};
        }
        let res = await delivery.findOneBE({ params: { id: req.body.deliveryId } }, send);
    }

    try {
        if (req.file == undefined) {
            return res.status(400).send("Please upload a CSV file!");
        }

        let tutorials = [];
        console.log("***************************************************")

        console.log("__basedir", __basedir)
        let path = __basedir + "/resources/static/assets/uploads/" + req.file.filename;

        fs.createReadStream(path)
            .pipe(csv.parse({ headers: true }))
            .on("error", (error) => {
                throw error.message;
            })
            .on("data", async(row) => {
                console.log(row)

                let customerPhnArray = [];
                let customerNewPhnArray = [];
                let duplicatePhnNumbersArray = [];
                let duplicatePhnArray = [];
                let productIdArrayFinal = [];
                let productsArraystage1 = [];
                let productArray = [];
                let totalItemCount = 0;
                let CUSID = '';

                // 1.0
                //check multiple phone numbers
                let customerPhone = row['Recipient Mobile'];
                if (customerPhone.includes("/")) {
                    customerPhnArray = customerPhone.split("/");
                } else {
                    customerPhnArray.push(customerPhone);
                }

                // 2.0
                //Check previous customers
                for (var i = 0; i < customerPhnArray.length; i++) {
                    if (customerPhnArray[i].charAt(0) == '0') {
                        let newNO = '';
                        newNO = setCharAt(customerPhnArray[i], 0, '94')
                        customerNewPhnArray.push(newNO);

                        const send = async(value) => {
                            console.log("value", value);
                            value.length > 0 ? duplicatePhnArray.push(value) : '';
                            value.length > 0 ? duplicatePhnNumbersArray.push(newNO) : '';

                        }

                        // 9488656396
                        let res = await customers.findByMobileNo(newNO, send);
                        console.log("res", res)
                    }
                }
                // let resdupcheck = await customerPhnArray.map(async(number) => {
                //     if (number.charAt(0) == '0') {
                //         let newNO = '';
                //         newNO = setCharAt(number, 0, '94')
                //         customerNewPhnArray.push(newNO);

                //         const send = async(value) => {
                //             console.log("value", value);
                //             value.length > 0 ? duplicatePhnArray.push(value) : '';
                //             value.length > 0 ? duplicatePhnNumbersArray.push(newNO) : '';
                //             return;
                //             // addNewCus();
                //         }

                //         // 9488656396
                //         let res = await customers.findByMobileNo(newNO, send);
                //         console.log("res", res)

                //         // return duplicatePhnNumbersArray;
                //     }
                // })

                setTimeout(async function() {
                    console.log("item", duplicatePhnNumbersArray);
                    if (duplicatePhnNumbersArray.length > 0) {
                        const sendResFrmCusphone = async(value) => {
                            console.log("sendResFrmCusphone", value)
                            CUSID = value.length > 0 && value[0].dataValues && value[0].dataValues.id;

                            //caling check PRODUCTS
                            CUSID && checkProducts();
                        };
                        let resCus = await customers.findAllByPhone(duplicatePhnNumbersArray[0], sendResFrmCusphone);
                    } else {
                        addNewCus();
                    }
                }, 1000);



                // // // 3.0
                // // //show previous orders
                // // const showPrevOrders = () => {}


                // 4.0
                // add a new customer
                const addNewCus = async() => {
                    if (duplicatePhnNumbersArray.length > 0) {} else {
                        let obj = {
                            fullName: row['Recipient Name'],
                            email: row['Recipient Email'],
                            phone: customerNewPhnArray.join(','),
                            address: row['Recipient Address'],
                            district: row['Recipient City'],
                            isActive: true,
                        }
                        const sendResFrmCus = async(value) => {
                            CUSID = value.dataValues.id;
                            console.log("newcustomer", value, CUSID)

                            //caling check PRODUCTS
                            CUSID && checkProducts();
                        };
                        let resCus = await customers.createByBE(obj, sendResFrmCus);
                    }
                }

                // // 5.0
                // // 6.0
                // //make final list of products
                // //make final list of product IDs
                const checkProducts = async() => {
                    let productObj = {};
                    let productsString = row['Parcel Description'];
                    productsArraystage1 = productsString.split("/");

                    await productsArraystage1.map(async prstring => {
                        let productsArraywithoutCount = [];
                        let productsArraywithoutWeight = [];

                        productsArraywithoutCount = prstring.split(":");

                        productsArraywithoutWeight = productsArraywithoutCount[0].split("-");

                        totalItemCount = totalItemCount + parseInt(productsArraywithoutCount[1]),

                            productObj = {
                                prname: productsArraywithoutWeight[0].replace(/\s*$/, ''),
                                prweight: productsArraywithoutWeight[1].replace(/\s/g, ''),
                                prcount: productsArraywithoutCount[1].replace(/\s/g, ''),
                            }
                        console.log("productObj", productObj);

                        productArray.push(productObj);
                        console.log("productArray.length", productArray.length);

                        if (productArray.length > 0) {
                            for (i = 0; i < productArray.length; i++) {
                                const sendResFrmProName = async(value) => {
                                    console.log("sendResFrmProName", value)
                                    value[0] && value[0].dataValues.id ? productIdArrayFinal.push(value[0].dataValues.id) : '';
                                    productObj.id = value[0].dataValues.id;
                                };
                                let resCus = await product.findAllByNameByBE(productObj.prname, sendResFrmProName);
                                console.log("rescheck", resCus, productIdArrayFinal)
                            }
                        }
                    })
                }
                setTimeout(async function() {
                    console.log("productIdArrayFinal", productIdArrayFinal);
                    if (productIdArrayFinal.length > 0) { addNewOrder() };
                }, 2000);

                // // 7.0
                // //Add new Order
                const addNewOrder = async() => {
                    const sendResFrmOrder = async(value) => {
                        console.log("sendResFrmOrder", value);
                        const sendResFrmupdate = async(value) => {
                            console.log("sendResFrmupdate", value);
                        };
                        productArray.map(async pr => {
                            await order.updateStocks(pr.id, pr.prcount, '', sendResFrmupdate);
                        })
                    };

                    const objOrder = {
                        barcode: row['ID'],
                        weight: row['Weight'],
                        itemCount: totalItemCount,

                        paid: false,
                        total: row['COD Amount'],
                        status: 'packing',
                        shippingAddress: row['Recipient Address'],
                        paymentMethod: 'COD',
                        shippingMethod: 'delivery',
                        trackingNumber: row['ID'],

                        productId: productIdArrayFinal,
                        customerId: CUSID,
                        userId: req.body.userId || 0,

                        exchange: row['Exchange'],
                        isActive: true,
                    }
                    let resOrder = await order.createByBE(objOrder, sendResFrmOrder);
                    console.log("obj", objOrder)

                    // 7.0 
                    // Send SMS
                    // const sendSMS = (mask, numbers) => {
                    //     const res = SMSController.login();
                    //     res.then(data => {
                    //         store.set('sms', { accessToken: `${data.data.accessToken}` })
                    //         const resSMS = SMSController.sendSMS(mask, numbers);
                    //     })
                    // }
                    // sendSMS( /** NEED PARAMS */ )

                    // 9.0
                    //Send to Delivery
                    // const sendResFrmsendToDelivery = async(value) => {
                    //     console.log("sendResFrmOrder", value);
                    // };
                    // deliveryData.clientId && deliveryData.apiKey && sendToDelivery({
                    //     "client_id": deliveryData.clientId,
                    //     "api_key": deliveryData.apiKey,
                    //     "recipient_name": row['Recipient Name'],
                    //     "recipient_contact_no": row['Recipient Mobile'],
                    //     "recipient_address": row['Recipient Address'],
                    //     "recipient_city": row['Recipient City'],
                    //     "parcel_type": row['Parcel Type'],
                    //     "parcel_description": row['Parcel Description'],
                    //     "cod_amount": row['COD Amount'],
                    //     "order_id": row['Order ID'],
                    //     "exchange": row['Exchange'],
                    // }, sendResFrmsendToDelivery)
                }

            })
            .on("end", () => {
                console.log("Eeeeeeeeeeeeeenddddddddddd2222")
                    // Tutorial.bulkCreate(tutorials)
                    //     .then(() => {
                    //         res.status(200).send({
                    //             message: "Uploaded the file successfully: " + req.file.originalname,
                    //         });
                    //     })
                    //     .catch((error) => {
                    //         res.status(500).send({
                    //             message: "Fail to import data into database!",
                    //             error: error.message,
                    //         });
                    //     });
            });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: "Could not upload the file: " + req.file.originalname,
        });
    }
};

const sendToDelivery = (req, res) => {
    const options = {
        url: 'https://fardardomestic.com/api/p_request_v1.02.php',
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': '*/*',
            'Host': '<calculated when request is sent>'
        },
        data: {
            "client_id": "9017",
            "api_key": "api64b907eeba8e6",
            "recipient_name": "customer 2",
            "recipient_contact_no": "0778800000",
            "recipient_address": "No.02, test lane, test district, test country",
            "recipient_city": "test district",
            "parcel_type": 1,
            "parcel_description": "test test test",
            "cod_amount": "11111111111",
            "order_id": "45464565",
            "exchange": 0
        }
        // {
        //     "client_id": req.client_id,
        //     "api_key": req.api_key,
        //     "recipient_name": req.recipient_name,
        //     "recipient_contact_no": req.recipient_contact_no,
        //     "recipient_address": req.recipient_address,
        //     "recipient_city": req.recipient_city,
        //     "parcel_type": req.parcel_type,
        //     "parcel_description": req.parcel_description,
        //     "cod_amount": req.cod_amount,
        //     "order_id": req.order_id,
        //     "exchange": req.exchange
        // }
    };

    axios(options)
        .then(response => {
            console.log("eeeeeeeeeeeeeeeeeeeeeeeee", response);
        }).catch(error => {
            console.log(error);
        });
};

const getTutorials = (req, res) => {
    console.log("111111111111111S")
    console.log("__basedir", __basedir)

    Tutorial.findAll()
        .then((data) => {
            res.send(data);
        })
        .catch((err) => {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving tutorials.",
            });
        });
};

module.exports = {
    upload,
    getTutorials,
    sendToDelivery,
    uploadInit
};


// let customerPhnArray = [];
//                 let customerNewPhnArray = [];

//                 let customerPhone = row['Recipient Mobile'];
//                 if (customerPhone.includes("/")) {
//                     customerPhnArray = customerPhone.split("/");
//                 } else {
//                     customerPhnArray.push(customerPhone);
//                 }

//                 customerPhnArray.map(async(number) => {
//                     if (number.charAt(0) == '0') {
//                         let newNO = '';
//                         newNO = setCharAt(number, 0, '94')
//                         customerNewPhnArray.push(newNO);

//                         console.log("res", res)


//                     }
//                 })
//                 for (i = 0; customerPhnArray.length > 0; i++) {
//                     let res = customers.findByMobileNo('0778800000')
//                 }


//                 console.log(row['Recipient Mobile'], customerNewPhnArray)
//                 tutorials.push(row);