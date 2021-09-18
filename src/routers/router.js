const express = require("express");
const router = new express.Router();
const jwt = require('jsonwebtoken');
const auth_log = require('../middlewares/login-auth');

// Get method

router.get("/contact", (req, res) => {
  res.render("contact");
});
router.get("/our-members", (req, res) => {
  res.render("our_member");
});
router.get("/core-principles", (req, res) => {
  res.render("core_principles");
});
router.get("/host-a-meet-and-greet", (req, res) => {
  res.render("host");
});
router.get("/political-program", (req, res) => {
  res.render("political");
});
router.get("/arts-culture", (req, res) => {
  res.render("arts_culture");
});
router.get("/housing-land", (req, res) => {
  res.render("housing_land");
});
router.get("/login", (req, res) => {
  res.render("login");
});
router.get('/logout', (req,res) =>{
  res.clearCookie('jwt');
  res.redirect('/');
})
router.get('/write-blog',auth_log,(req,res) =>{
  res.render('write_blog');
})



//Post method
router.post('/login', async(req,res) =>{
  try {
    const name = 'mirza azam';
    const password = 'mirzaazam123000';

    if(req.body.name != name || req.body.password != password){
      //wrong info for login
      res.render('login', {
        error:'Incorrect login details. Try again!'
      })
    }else{
      //succesfully login
      const token = jwt.sign('123ashik123', process.env.SECRET_KEY);
      res.cookie('jwt', token);
      res.redirect("/");
    }
  } catch (error) {
    console.log(error)
  }
})

module.exports = router;
