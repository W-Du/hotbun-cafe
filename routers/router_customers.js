const express = require('express')
const customersRouter = express.Router();

const { 
  addReservation, 
  checkFullDate,
  checkClosedDate,
  getHourSummary } = require('../query/query_customer.js')

//customer.html
customersRouter.post('/reservations/new', addReservation);

//helper for customers
customersRouter.get('/helper/fully-booked', checkFullDate);
customersRouter.get('/helper/closed', checkClosedDate);
customersRouter.get('/helper/by', getHourSummary);


module.exports = customersRouter;