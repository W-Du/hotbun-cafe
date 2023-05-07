const pool = require('../db/pool.js')
const u = require('./util.js')

const addReservation = (req, res) => {
    const { date, time, num_ppl, order_type } = req.body;
    const query = 'INSERT INTO reservations (date, time, num_ppl, order_type) VALUES ($1,$2,$3,$4)';
    pool.query(query, [date, time, num_ppl, order_type], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).json('Error adding data to database');
        } else {
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

//helper: delete expired reservations
const deleteExpired = (req, res, next) => {
    const today = new Date().toISOString().split('T')[0];
    pool.query('DELETE FROM reservations WHERE date < $1', [today], (err, result) => {
        if (err){
            res.status(500).json(err)
        } else {
            res.status(204).send()
        }
    })
}



module.exports = { 
    addReservation,
    checkFullDate,
    getHourSummary,
    deleteExpired
 }