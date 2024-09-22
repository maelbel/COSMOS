const bcrypt = require('bcrypt');

const User = require('../models/user');

exports.signup = (req, res, next) => {
  if(req.body.name == '' || req.body.email == '' || req.body.password == '' || req.body.confirm == ''){
    req.session.message = {
      type: 'danger',
      intro: "signup.iEmptyFields",
      message: "signup.cEmptyFields"
    }
    res.redirect('/register');
  } else if (req.body.password != req.body.confirm){
    req.session.message = {
      type: 'danger',
      intro: "signup.iWrongPass",
      message: "signup.cWrongPass"
    }
    res.redirect('/register');
  } else {
    bcrypt.hash(req.body.password, 10, function(err, hash){
      const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: hash
      });
      user.save(function(error, doc){
        if(err) console.log(error);
        else {
          req.session.message = {
            type: 'success',
            intro: "signup.iUserCreated",
            message: "signup.cUserCreated"
          }
          res.redirect('/login');
        }
      });
    });
  }
}

exports.login = (req, res, next) => {
  if(req.body.email == '' || req.body.password == ''){
    req.session.message = {
      type: 'danger',
      intro: "signin.iEmptyFields",
      message: "signin.cEmptyFields"
    }
    res.redirect('/login');
  } else {
    User.findOne({ email: req.body.email }, function(err, user){
      if(!user){
        req.session.message = {
          type: 'danger',
          intro: "signin.iIncorrectMail",
          message: "signin.iIncorrectMail"
        }
        res.redirect('/login');
      } else {
        bcrypt.compare(req.body.password, user.password, function(error, result){
          if(!result){
            req.session.message = {
              type: 'danger',
              intro: "signin.iWrongPass",
              message: "signin.cWrongPass"
            }
            res.redirect('/login');
          } else {
            req.session.userName = user.name;
            req.session.admin = true;
            res.redirect("back");
          }
        });
      }
    });
  }
};
