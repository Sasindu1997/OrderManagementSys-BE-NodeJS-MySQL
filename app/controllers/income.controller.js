const db = require("../models");
const Income = db.income;
const Op = db.Sequelize.Op;
const IncomeStream = db.incomeStream;

// Create and Save a new Income
exports.create = (req, res) => {
    // Validate request
    if (!req.body.name || !req.body.amount) {
        res.status(400).send({
            message: "Content can not be empty!"
        });
        return;
    }

    // Create a Income
    const expense = {
        name: req.body.name,
        description: req.body.description,
        amount: req.body.amount,
        createdAt: req.body.createdAt,
        isActive: req.body.isActive ? req.body.isActive : false
    };

    // Save Income in the database
    Income.create(expense)
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while creating the Income."
            });
        });
};

// Retrieve all Incomes from the database.
exports.findAll = (req, res) => {
    const name = req.query.name;
    var condition = name ? {
        name: {
            [Op.like]: `%${name}%`
        }
    } : null;

    Income.findAll({ where: condition, order: Income.sequelize.literal('id DESC') })
        .then(async data => {
            async function addData() {
                for (let index = 0; index < data.length; index++) {
                    const element = data[index];
                        await IncomeStream.findByPk(element.dataValues.name).then(dt => {
                            console.log("data", dt.dataValues.name);
                            dt && dt.dataValues ? element.dataValues.incomeStream = dt.dataValues.name : element.dataValues.incomeStream = ''
                        })
                }
            }
            await addData();
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving expenses."
            });
        });
};

// Find a single Income with an id
exports.findOne = (req, res) => {
    const id = req.params.id;

    Income.findByPk(id)
        .then(data => {
            if (data) {
                res.send(data);
            } else {
                res.status(404).send({
                    message: `Cannot find Income with id=${id}.`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Error retrieving Income with id=" + id
            });
        });
};

// Update a Income by the id in the request
exports.update = (req, res) => {
    const id = req.params.id;

    Income.update(req.body, {
            where: { id: id }
        })
        .then(num => {
            if (num == 1) {
                res.send({
                    message: "Income was updated successfully."
                });
            } else {
                res.send({
                    message: `Cannot update Income with id=${id}. Maybe Income was not found or req.body is empty!`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Error updating Income with id=" + id
            });
        });
};

// Delete a Income with the specified id in the request
exports.delete = (req, res) => {
    const id = req.params.id;

    Income.destroy({
            where: { id: id }
        })
        .then(num => {
            if (num == 1) {
                res.send({
                    message: "Income was deleted successfully!"
                });
            } else {
                res.send({
                    message: `Cannot delete Income with id=${id}. Maybe Income was not found!`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Could not delete Income with id=" + id
            });
        });
};

// Delete all Incomes from the database.
exports.deleteAll = (req, res) => {
    Income.destroy({
            where: {},
            truncate: false
        })
        .then(nums => {
            res.send({ message: `${nums} Incomes were deleted successfully!` });
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while removing all expenses."
            });
        });
};

// Find all published Incomes
exports.findAllPublished = (req, res) => {
    Income.findAll({ where: { published: true } })
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving expenses."
            });
        });
};

exports.multipleSearch = (req, res) => {
    const name = req.query.name;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    
    var condition = ''

    if(name && startDate && endDate){
        condition = `WHERE incomes.name = ${name} AND incomes.createdAt >= '${startDate}' AND incomes.createdAt <= '${endDate}'`   
    }
    if(!name && startDate && endDate){
        condition = `WHERE incomes.createdAt >= '${startDate}' AND incomes.createdAt <= '${endDate}'`   
    }
    else if(name && startDate){
        condition = `WHERE incomes.name = ${name} AND incomes.createdAt >= '${startDate}'`   
    }
    else if(name && endDate){
        condition = `WHERE incomes.name = ${name} AND incomes.createdAt <= '${endDate}'`   
    }
    else if(!name && startDate){
        condition = `WHERE  incomes.createdAt >= '${startDate}'`   
    }
    else if(!name && endDate){
        condition = `WHERE  AND incomes.createdAt <= '${endDate}'`   
    }
    else if(name){
        condition = `WHERE incomes.name = ${name}`   
    }

    const queryString = `SELECT * FROM orderman.incomes ${condition} ORDER BY id DESC;`
    Income.sequelize.query(queryString, { type: Income.sequelize.QueryTypes.SELECT })
    .then(async data => {
        async function addData() {
            for (let index = 0; index < data.length; index++) {
                const element = data[index];
                console.log("data", element);

                    await IncomeStream.findByPk(element.name).then(dt => {
                        dt && dt.dataValues ? element.incomeStream = dt.dataValues.name : element.incomeStream = ''
                    })
            }
        }
        await addData();
        res.send(data);
    })
    .catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while retrieving expenses."
        });
    });
};