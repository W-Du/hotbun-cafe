const pool = require('../db/pool.js')
const u = require('./util.js')

const getAvailabilityByDate = (req, res, next) => {
    const date = req.query.date;
    queryStr = 'SELECT max_reservations FROM available WHERE date = $1';
    pool.query(queryStr, [date], (err, result) => {
      if (err) {
        res.status(500).json(err);
      } else if (result.rows.length === 0){
        res.status(200).json({message: `Max of reservations as default: ${u.DEFAULT_MAX}`})
      } else {
        res.status(200).json(result.rows[0]);
      }
    });
  };

const updateAvailable = (req, res, next) => {
  const max_reservations = req.body.max_reservations;
  const date = JSON.parse(req.body.date)
  //generate query string
  let queryStr = 'INSERT INTO available (date, max_reservations) VALUES ';
  for (let i = 0; i < date.length; i++) {
    queryStr += "( '" + date[i] + "', " + max_reservations + ')'
    if(i < date.length -1){
      queryStr += ', '
    }
  }
  queryStr += `ON CONFLICT (date) DO UPDATE 
  SET max_reservations = excluded.max_reservations;`

  pool.query(queryStr, (err, result) => {deletePastAvailable
    if(err) {
      res.status(500).json(err)
    } else {
      res.status(200).json(result)
    }
  })
}

const deleteRange = (req, res, next) => {
  const s = req.query.start
  const e = req.query.end
  const queryStr = 'DELETE FROM available WHERE date >= $1::date AND date <= $2::date'
  pool.query(queryStr, [s,e], (err, result) => {
    if(err){
      res.status(500).json(err)
    } else {
      res.status(204).json(result)
    }
  })
}

const deleteDay = (req, res, next) => {
  const day = req.query.day
  const queryStr = 'DELETE FROM available WHERE date = $1::date'
  pool.query(queryStr, [day], (err, result) => {
    if(err){
      res.status(500).json(err)
    } else {
      res.status(204).json(result)
    }
  })
}

const deletePastAvailable = (req, res, next) => {
  const today = new Date().toISOString().split('T')[0];
  const queryStr = 'DELETE FROM available WHERE date < $1'
  pool.query(queryStr, [today], (err, result) => {
    if(err){
      res.status(500).json(err)
    } else {
      res.status(204).json(result)
    }
  })
}


  module.exports = {
    getAvailabilityByDate, 
    updateAvailable, 
    deleteRange,
    deleteDay,
    deletePastAvailable
  }