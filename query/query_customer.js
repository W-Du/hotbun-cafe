const pool = require('../db/pool.js')
const u = require('./util.js')
const validator = require('validator');

const addReservation = (req, res) => {
    const { date, time, num_ppl, order_type, name, email, message } = req.body;
    const emailS = validator.normalizeEmail(email)
    const nameS = validator.escape(name)
    const messageS = validator.escape(message)
    const query = `INSERT INTO reservations (date, time, num_ppl, order_type, name, email, message) 
    VALUES ($1,$2,$3,$4,$5,$6,$7);`;
    pool.query(query, [date, time, num_ppl, order_type, nameS, emailS, messageS], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).json('Error adding data to database');
        } else {
            // const responseData = {
            //     date: req.body.date.toString().split('T')[0],
            //     time: req.body.time.toString()
            // }
            // res.render('confirm', {data: responseData});
            res.status(201).json(req.body);
        }
    });
};


//helper: check fully booked days
const checkFullDate = (req, res, next) => {
    const query = 
        `SELECT r.date, COUNT(*) d
        FROM reservations AS r
        LEFT JOIN available AS a
        ON a.date = r.date
        GROUP BY r.date, a.max_reservations
        HAVING a.max_reservations = COUNT(*);`
    pool.query(query, (err, result) => {
        if(err){
            res.status(500).send(err)
        } else {
            const fullyBooked = result.rows.map(row => row.date)
            if(fullyBooked) {
                res.json(fullyBooked)
            } else {
                res.send({message: 'failed'})
            }
        }
    })
}

const checkClosedDate = (req, res, next) => {
    pool.query('SELECT date FROM available WHERE max_reservations = 0;', (err, result) => {
        if(err) {
            res.status(500).json(err)
        } else {
            const closedDays = result.rows.map(row => row.date)
            if(closedDays){
                res.status(200).json(closedDays);
            } 
        }
    })
}

//helper: check in which timeloat all tables are full
const getHourSummary = (req, res, next) => {
    const dayStr = req.query.date;
    const query = `SELECT time, order_type, COUNT(*) as count FROM reservations
    WHERE date = $1
    GROUP BY time, order_type;`
    pool.query(query, [dayStr], (err, result) => {
        if (err) {
            res.status(500).json(err);
        } else {
            const summary = result.rows
            if(!summary){
                res.status(404).send()
            }
            //hours without tables 
            const tables = new u.Dict(u.NUMBER_TABLES);
            tables.updateInventory(summary, 'table');
            const fullHoursTable = tables.getFullHours();
            //hours without hotpots
            const hotpots = new u.Dict(u.NUMBER_HOTPOTS);
            hotpots.updateInventory(summary, 'hotpot');
            const fullHoursPot = hotpots.getFullHours();
            //generete json response
            const fullHours = {
                'fullHoursTable': fullHoursTable,
                'fullHoursPot': fullHoursPot
            }
            res.status(200).json(fullHours)
        }
    })
}





module.exports = { 
    addReservation,
    checkFullDate,
    checkClosedDate,
    getHourSummary,
 }
