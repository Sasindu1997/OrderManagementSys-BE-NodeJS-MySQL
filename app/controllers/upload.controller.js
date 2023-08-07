const db = require("../models");
const Tutorial = db.tutorials;
const customers = require("../controllers/customer.controller");
const order = require("../controllers/order.controller");
const product = require("../controllers/product.controller");
const SMSController = require("../controllers/sms.controller");
var store = require('store')


const fs = require("fs");
const csv = require("fast-csv");

function setCharAt(str, index, chr) {
    if (index > str.length - 1) return str;
    return str.substring(0, index) + chr + str.substring(index + 1);
}
const upload = async(req, res) => {
    console.log("#############", req.file, req.body.isDeliveryAdded);

    const sendSMS = (mask, numbers) => {
            const res = SMSController.login();
            res.then(data => {
                store.set('sms', { accessToken: `${data.data.accessToken}` })
                const resSMS = SMSController.sendSMS(mask, numbers);
            })
        }
        // sendSMS()

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
                tutorials.push(row);

                let customerPhnArray = [];
                let customerNewPhnArray = [];
                let duplicatePhnArray = [];
                let productIdArrayFinal = [];
                let totalItemCount = 0;
                let CUSID = '';

                await customerPhnArray.map(async(number) => {
                    if (number.charAt(0) == '0') {
                        let newNO = '';
                        newNO = setCharAt(number, 0, '94')
                        customerNewPhnArray.push(newNO);

                        const send = async(value) => {
                            console.log("value", value);
                            value.length > 0 ? duplicatePhnArray.push(value) : '';
                        }

                        // 9488656396
                        let res = await customers.findByMobileNo(number, send);
                        console.log("res", res)
                    }
                })

                //check multiple phone numbers
                let customerPhone = row['Recipient Mobile'];
                if (customerPhone.includes("/")) {
                    customerPhnArray = customerPhone.split("/");
                } else {
                    customerPhnArray.push(customerPhone);
                }

                //make final list of product IDs
                const checkProducts = async() => {
                        let productObj = {};
                        let productsArraystage1 = [];
                        let productArray = [];
                        let productsString = row['Parcel Description'];
                        productsArraystage1 = productsString.split("/");

                        await productsArraystage1.map(async prstring => {
                            let productsArraywithoutCount = [];
                            let productsArraywithoutWeight = [];

                            productsArraywithoutCount = prstring.split(":");

                            productsArraywithoutWeight = productsArraywithoutCount[0].split("-");

                            totalItemCount = totalItemCount + productsArraywithoutCount[1],

                                productObj = {
                                    prname: productsArraywithoutWeight[0],
                                    prweight: productsArraywithoutWeight[1],
                                    prcount: productsArraywithoutCount[1],
                                }
                            console.log("productObj", productObj);

                            productArray.push(productObj);
                            if (productArray.length > 0) {
                                //should loop below for multiple products 
                                const sendResFrmProName = async(value) => {
                                    // console.log("xxxxxx", value[0].dataValues.id);
                                    value[0] && value[0].dataValues.id ? productIdArrayFinal.push(value[0].dataValues.id) : '';
                                    productObj.id = value[0].dataValues.id;
                                };
                                let resCus = await product.findAllByNameByBE(productObj.prname, sendResFrmProName);
                                console.log("rescheck", resCus, productIdArrayFinal)
                            }
                        })
                    }
                    // checkProducts()
                    // console.log("productIdArrayFinal", productIdArrayFinal)


                //add a new customer
                const addNewCus = async() => {
                    if (duplicatePhnArray.length > 0) {
                        // let resCus = await orders.getcusbyphone(obj, sendResFrmCus);
                    } else {
                        let obj = {
                            fullName: row['Recipient Name'],
                            email: row['Recipient Email'],
                            phone: customerNewPhnArray.join(','),
                            address: row['Recipient Address'],
                            district: row['Recipient City'],
                            isActive: true,
                        }
                        const sendResFrmCus = async(value) => {
                            CUSID = value.customer.dataValues.id;
                        };
                        let resCus = await customers.createByBE(obj, sendResFrmCus);
                        console.log("obj", resCus)
                    }
                }

                // console.log(row['Recipient Mobile'], customerNewPhnArray)

                // addNewCus();

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

                    // ID,Parcel Type,Order ID,Parcel Description,
                    // Recipient Name,Recipient Mobile,Recipient Address,
                    // Recipient City,COD Amount,Exchange

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
                            trackingNumber: ['ID'],

                            productId: productIdArrayFinal,
                            customerId: CUSID,
                            userId: req.body.userId,

                            exchange: row['Exchange'],
                            isActive: true,
                        }
                        // let resOrder = await order.createByBE(objOrder, sendResFrmOrder);
                    console.log("obj", objOrder)
                }

                // addNewOrder();

            })
            .on("end", () => {
                Tutorial.bulkCreate(tutorials)
                    .then(() => {
                        res.status(200).send({
                            message: "Uploaded the file successfully: " + req.file.originalname,
                        });
                    })
                    .catch((error) => {
                        res.status(500).send({
                            message: "Fail to import data into database!",
                            error: error.message,
                        });
                    });
            });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: "Could not upload the file: " + req.file.originalname,
        });
    }
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
    getTutorials
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