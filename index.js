const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const port = process.env.PORT || 3000
process.env.TZ = 'UTC'

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false,}))
app.use(express.static("public"));

const { 
  getCustomers, 
  getReservationsByDay,
  deleteReservationById,
  deleteExpired } = require('./query/query_owner.js')

const { 
  addReservation, 
  checkFullDate,
  getHourSummary } = require('./query/query_customer.js')
  
const {
  getAvailabilityByDate,
  deleteRange,
  updateAvailable,
  deleteDay,
  deletePastAvailable } = require('./query/query_setting.js')


//owner
app.get('/reservations', getCustomers);
app.get('/reservations/by', getReservationsByDay);
app.delete('/reservations/delete-row', deleteReservationById);

//customers
app.post('/reservations/new', addReservation);

//helper queries in app_customers
app.get('/helper/fully-booked', checkFullDate);
app.get('/helper/by', getHourSummary);
app.delete('/helper/expired', deleteExpired);

//settings
app.get('/available/by', getAvailabilityByDate);
app.post('/available/update', updateAvailable);
app.delete('/available/delete-range', deleteRange);
app.delete('/available/delete-day', deleteDay);
app.delete('/helper/available/expired', deletePastAvailable);


//default html page
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html')
})

app.get('/owner', (req, res) => {
  res.sendFile(__dirname + '/public/owner.html')
})

app.listen(port, () => {
  console.log(`App running on port ${port}.`)
})
