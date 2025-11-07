// 1️⃣ Environment Setup
if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}

// 2️⃣ Core Modules and Config
const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const localStrategy = require("passport-local");

// 3️⃣ Models and Utilities
const Listing = require("./Models/listing.js");
const Review = require("./Models/review.js");
const User = require("./Models/user.js");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");

// 4️⃣ Routes
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

// 5️⃣ Database Connection
const dbUrl = process.env.ATLASDB_URL;

main()
  .then(() => console.log("connected to DB"))
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect(dbUrl);
}

// 6️⃣ Express and EJS Configuration
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));

// 7️⃣ Session Configuration
const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: { secret: process.env.SECRET, },
  touchAfter: 24 * 3600,
});

store.on("error", (err) => {
  console.log("Error in mongo session store", err);
});

const sessionOptions = {
  store,
  secret: process.env.SECRET, 
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

// 8️⃣ Initialize Session and Flash
app.use(session(sessionOptions));
app.use(flash());

// 9️⃣ Initialize Passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// 🔟 Make flash and currUser available to all templates
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user; // 👈 this is correct
  next();
});

// 1️⃣1️⃣ Routes
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

// 1️⃣2️⃣ 404 Handler
app.use((req, res, next) => {
    const err = new ExpressError(404, "Page Not Found");
    next(err);
});

// 1️⃣3️⃣ Error Handler
app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Something went wrong!";
  res.status(statusCode).render("error.ejs", { err });
});

// 1️⃣4️⃣ Start Server
app.listen(8080, () => {
  console.log("server is listening to port 8080");
});



// if(process.env.NODE_ENV != "production"){
//     require("dotenv").config();
// };



// const express = require("express");
// const app = express();
// const mongoose = require("mongoose");
// const Listing = require("./Models/listing.js");
// const path = require("path");
// const methodOverride = require("method-override");
// const ejsMate = require("ejs-mate");
// const wrapAsync = require("./utils/wrapAsync.js");
// const ExpressError = require("./utils/ExpressError.js");
// const {listingSchema, reviewSchema} = require("./schema.js");
// const Review =require("./Models/review.js");
// const session = require("express-session");
// const MongoStore = require("connect-mongo");
// const flash = require("connect-flash");
// const passport = require("passport");
// const localStrategy = require("passport-local");
// const User = require("./Models/user.js");

// const listingRouter = require("./routes/listing.js");
// const reviewRouter = require("./routes/review.js");
// const userRouter = require("./routes/user.js");

// // const MONGO_URL = "mongodb://127.0.0.1:27017/tarvel";
// const dbUrl = process.env.ATLASDB_URL;


// main().then(() => {
//     console.log("connected to DB");
// })
// .catch((err) =>{
//     console.log(err);
// });

// async function main() {
//     await mongoose.connect(dbUrl);
// }

// app.engine("ejs", ejsMate);
// app.set("view engine","ejs");
// app.set("views", path.join(__dirname,"views"));
// app.use(express.urlencoded({extended:true}));
// app.use(methodOverride("_method"));
// app.use(express.static(path.join(__dirname, "/public")));
// app.use(express.json());


// const store = MongoStore.create({
//     mongoUrl: dbUrl,
//     crypto: {
//         secret: "mysupersecretcode",
//     },
//     touchAfter: 24 * 3600,
// });

// store.on("error", () =>{
//     console.log("Error in mongo session store", err);
// });


// const sessionOptions = {
//     store,
//     secret : "mysupersecretcode",
//     resave: false,
//     saveUninitialized: true,
//     cookie: {
//         expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
//         maxAge: 7 * 24 * 60 * 60 * 1000,
//         httpOnly: true,
//     },
// };



// //root
// // app.get("/",(req,res) =>{
// //     res.send("Hi, I am root");
// // });




// app.use(session(sessionOptions));
// app.use(flash());

// app.use(passport.initialize());
// app.use(passport.session());
// passport.use(new localStrategy(User.authenticate()));

// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());


// app.use((req, res, next)=>{
//     res.locals.success = req.flash("success");
//     res.locals.error = req.flash("error");
//     console.log("Current User:", req.user);
//     res.locals.currUser = req.user;
//     next();
// })

// app.use("/listings", listingRouter);
// app.use("/listings/:id/reviews", reviewRouter);
// app.use("/", userRouter);

// app.use((req, res, next) => {
//     const err = new ExpressError(404, "Page Not Found");
//     next(err);
// });

// app.use((err, req, res, next)=>{
//     let {statusCode=500, message="some things went wrongs!"} = err;
//     res.status(statusCode).render("error.ejs",{err});
// });

// app.listen(8080, () => {
//     console.log("server is listening to port 8080");
// }); 






// app.use((req, res, next) => {
//     const err = new ExpressError(404, "Page Not Found");
//     next(err);
// });