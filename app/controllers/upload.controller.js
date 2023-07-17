const db = require("../models");
const Tutorial = db.tutorials;

const fs = require("fs");
const csv = require("fast-csv");

const upload = async(req, res) => {
    console.log("#############", req.file)

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
            .on("data", (row) => {
                console.log(row)
                tutorials.push(row);
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