var express = require('express');
var router = express.Router();
var app =express();
var mysql=require('mysql');
var bcrypt=require('bcrypt');
var db=require('../database/database');
const cookieParser = require("cookie-parser");
const { createTokens, validateToken } = require("./JWT");

app.use(express.json());
app.use(cookieParser());




/* GET home page. */
router.get('/', function(req, res, next) {
  if(req.session.flag==1)
  {
    req.session.destroy();
    res.render('index',{alertMsg: 'Email Already Exists',flag:1});
  }
  else if(req.session.flag==2)
  {
    req.session.destroy();
    res.render('index',{alertMsg: 'Registration Successful',flag:0});
  }
  else if(req.session.flag==3)
  {
    req.session.destroy();
    res.render('index',{alertMsg: 'Confirm Password Does Not Match',flag:1});
  }
  else if(req.session.flag==4)
  {
    req.session.destroy();
    res.render('index',{alertMsg: 'Incorrect Email Or Password',flag:1});
  }
  else{
  res.render('index');
  }
});

router.post('/register', function(req, res, next) {
      var username= req.body.txt;
      var email= req.body.email;
      var mobile= req.body.mobile;
      var password= req.body.password;
      var cpassword= req.body.confirmpassword;
      if(cpassword==password)
      {
        var sql = 'select * from users where email = ?;';
        db.query(sql,[email], function(err, result, fields){
          if(err) throw err;
    
          if(result.length > 0){
            req.session.flag = 1;
            res.redirect('/');
          }else{
    
            var hashpassword = bcrypt.hashSync(password, 10);
            var sql = 'insert into users(username,mobile,email,password) values(?,?,?,?);';
    
            db.query(sql,[username,mobile,email,hashpassword], function(err, result, fields){
              if(err) throw err;
              req.session.flag = 2;
              res.redirect('/');
            });
          }
        });
      }
      else{
        req.session.flag = 3;
        res.redirect('/');
      }
});

router.post('/login',function(req,res,next){
  var email = req.body.email;
  var password =req.body.password;
  var sql = 'select * from users where email = ?;';
  db.query(sql,[email], function(err,result, fields){
    if(err) throw err;
    if(result.length && bcrypt.compareSync(password, result[0].password)){
      const accessToken = createTokens(result[0]);
      res.cookie("access-token",accessToken,{
        maxAge: 60*60*24*1000,
        httponly:true,
      });
      res.redirect('/home');
    }else{
      req.session.flag = 4;
      res.redirect('/');
    }
  });
});

router.get('/home', function(req, res, next){
  var sql='SELECT * from users';
  db.query(sql, function (err, result, fields) {
  if (err) throw err;
  res.render('details', {userData: result});
});
});

module.exports = router;
