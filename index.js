const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const app = express()
const port = process.env.PORT || 3000
process.env.TZ = 'UTC'

// app.set('view engine', 'ejs')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false,}))
app.use(express.static("public"));
// app.set('view engine', 'ejs');
// app.set('views', path.join(__dirname, 'views'));

//routers
const ownerRouter = require('./routers/router_owner.js')
const customersRouter = require('./routers/router_customers.js')
app.use('/owner', ownerRouter);
app.use('/', customersRouter);



//default html page
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html')
})

app.get('/owner.html', (req, res) => {
  res.sendFile(__dirname + '/public/index.html')
});




app.listen(port, () => {
  console.log(`App running on port ${port}.`)
})
