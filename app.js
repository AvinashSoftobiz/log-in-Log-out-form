
var bcrypt = require('bcryptjs');
const express = require("express"); 
const path = require("path"); 
const session = require("express-session"); 
const passport = require("passport"); 
const LocalStrategy = require("passport-local").Strategy; 
const mongoose = require("mongoose"); 
const Schema = mongoose.Schema; 
 
const mongoDb = "mongodb+srv://Avinashkumar:Aman123@cluster0.gzpb0dy.mongodb.net/?retryWrites=true&w=majority"; 
mongoose.connect(mongoDb, { useUnifiedTopology: true, useNewUrlParser: true }); 
const db = mongoose.connection; 
db.on("error", console.error.bind(console, "mongo connection error")); 
 
const User = mongoose.model( 
  "User", 
  new Schema({ 
    username: { type: String, required: true }, 
    password: { type: String, required: true } 
  }) 
); 


 
const app = express(); 
app.set("views", __dirname); 
app.set("view engine", "ejs"); 


passport.use( 
    new LocalStrategy((username, password, done) => { 
      User.findOne({ username: username }, (err, user) => { 
        if (err) {  
          return done(err); 
        } 
        if (!user) { 
          return done(null, false, { message: "Incorrect username" }); 
        } 
        bcrypt.compare(password, user.password, (err, res) => { 
            if (res) { 
              // passwords match! log user in 
              return done(null, user) 
            } else { 
              // passwords do not match! 
              return done(null, false, { message: "Incorrect password" }) 
            } 
          }) 
      }); 
    }) 
  ); 
   
app.use(session({ secret: "cats", resave: false, saveUninitialized: true })); 
app.use(passport.initialize()); 
app.use(passport.session()); 
app.use(express.urlencoded({ extended: false })); 


passport.serializeUser(function(user, done) { 
    done(null, user.id); 
  }); 
  passport.deserializeUser(function(id, done) { 
    User.findById(id, function(err, user) { 
      done(err, user); 
    }); 
  });

  // middleware
app.use(function(req, res, next) { 
    res.locals.currentUser = req.user; 
    next(); 
  }); 
  
 

// app.get("/", (req, res) => res.render("index")); 
app.get("/", (req, res) => { 
    res.render("index", { user: req.user }); 
  }); 
  
app.get("/sign-up", (req, res) => res.render("sign-up-form"));
// sign up form so that we can add users to our database 
app.post("/sign-up", (req, res, next) => { 
    bcrypt.hash(req.body.password, 10, (err, hashedPassword) => { 
         if (err){
            console.log("sopmmething wrong");
         }
        // otherwise, store hashedPassword in DB 
        const user = new User({ 
            username: req.body.username, 
            password: hashedPassword
          }).save(err => { 
            if (err) {  
              return next(err); 
            } 
            res.redirect("/"); 
          }); 
      }); 
       
 
  }); 

// log-in
app.post( 
    "/log-in", 
    passport.authenticate("local", { 
      successRedirect: "/", 
      failureRedirect: "/" 
    })  
); 
// log out
app.get("/log-out", (req, res) => { 
    req.logout(function (err) { 
      if (err) { 
        return next(err); 
      } 
      res.redirect("/"); 
    }); 
  }); 
  
 
app.listen(3000, () => console.log("app listening on port 3000!")); 



