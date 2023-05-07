const pool = require('../db/pool.js')



const getCustomers = (req, res) => {
  pool.query('SELECT * FROM reservations', (error, result) => {
    if (error) {
      res.status(500).send(error)
    }
    res.status(200).json(result.rows)
  })
}

const getReservationsByDay = (req, res, next) => {
  const date = req.query.date;
  const queryStr = 'SELECT * FROM reservations WHERE date = $1';
  pool.query(queryStr, [date], (err, result) => {
    if (err) {
      res.status(500).json(err);
    } else {
      res.status(200).json(result.rows);
    }
  });
};

const deleteReservationById = (req, res, next) => {
  const id = req.query.id;
  pool.query('DELETE FROM reservations WHERE id = $1', [id], (err, result) => {
    if(err) {
      res.status(500).json(err)
    } else {
      res.status(204).json(result)
    }
  })
}


module.exports = { 
    getCustomers,
    getReservationsByDay,
    deleteReservationById
}