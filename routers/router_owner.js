const express = require('express')
const session = require("express-session")
const ownerRouter = express.Router();

ownerRouter.use(session({
    secret: "my-secret", //to be replaced by process.env
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true
    }
  })
);

const { 
  getReservations, 
  getReservationsByDay,
  deleteReservationById,
  deleteExpired } = require('../query/query_owner.js')

const {
  getAvailabilityByDate,
  deleteRange,
  updateAvailable,
  deleteDay,
  deletePastAvailable } = require('../query/query_setting.js')


//owner.html
ownerRouter.get('/reservations', getReservations);
ownerRouter.get('/reservations/by', getReservationsByDay);
ownerRouter.delete('/reservations/delete-row', deleteReservationById);

//helpers for owner routers
ownerRouter.delete('/helper/expired', deleteExpired);
ownerRouter.delete('/helper/available/expired', deletePastAvailable);

//setting.html
ownerRouter.get('/available/by', getAvailabilityByDate);
ownerRouter.post('/available/update', updateAvailable);
ownerRouter.delete('/available/delete-range', deleteRange);
ownerRouter.delete('/available/delete-day', deleteDay);


module.exports = ownerRouter;

