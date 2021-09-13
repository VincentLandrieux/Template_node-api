//---IMPORT---//
const express = require("express");
const app = express();

const Cors = require("cors");


//---INIT---//
require('dotenv').config();

const cors = Cors({
    origin: process.env.CORS_ORIGIN_URLS,
    credentials: true
});


//---VARIABLE---//
const PORT = process.env.PORT;


//---MAIN---//
console.log("start on port " + PORT);


//---MIDDLEWARE---//
app.use(cors);
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());


//---ROUTE---//
app.get('/', (req, res) => {
    res.status(200).json({result: "Ok", message: "API home"});
});

require("./routes/login")(app);

require("./routes/example")(app);


app.listen(PORT);