const express = require('express')
const session = require("express-session")
const ownerRouter = express.Router();
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const users = require('../db/users.js')
const path = require('path')

//session
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


//passport
ownerRouter.use(passport.initialize());
ownerRouter.use(passport.session());

passport.serializeUser((user, done) => {
  done(null, user.id)
});
  
passport.deserializeUser((id, done) => {
  users.findById(id, function (err, user) {
    if(err) return done(err);
    done(null, user)
  })
});

passport.use(new LocalStrategy(
  function(username, password, done) {
    users.findByUsername(username, (err, user) => {
      if(err) return done(err);
      if(!user) return done(null, false);
      if(user.password != password) return done(null, false);
      return done(null, user);
    })
  }
))





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

//login authentication
const isAuthenticated = (req, res, next) =>{
  console.log(req.isAuthenticated())
  if (req.user != null) {
    console.log('login sucess')
    return next()
  } else {
    console.log('wrong credentials')
    return res.redirect('/owner/login')
  }
}

// ownerRouter.get('/logout', (req, res) => {
//   req.logout();
//   res.redirect("/login");
// })

ownerRouter.get('/', isAuthenticated, (req, res, next) =>{
  res.redirect('/owner.html')
})

ownerRouter.get('/login', (req, res, next) => {
  res.sendFile(path.join(__dirname, '../public/login.html'))
})

ownerRouter.post('/login', passport.authenticate('local', {
  failureRedirect: '/owner/login',}), (req, res) => {
    res.redirect('/owner.html')
  });

// ownerRouter.post('/login', passport.authenticate('local'), (req, res) => {
//   res.json(req.user)
// });

// ownerRouter.get('/dashboard', isAuthenticated, (req, res) => {
//   res.redirect('/owner.html')
//   // const new_dir = path.join(__dirname, '../public')
//   // res.sendFile(new_dir + '/owner.html')
// });

// ownerRouter.get('/', (req, res) => {
//   res.redirect('/owner/login');
// });

// ownerRouter.get('/', isAuthenticated, (req, res) => {
//   res.render('/owner')
// })





module.exports = ownerRouter;

