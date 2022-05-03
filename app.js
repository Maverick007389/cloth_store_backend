const mongoose = require('mongoose');
const express = require("express");
const app = express();
require('dotenv').config();
const port = process.env.PORT || 3007;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");

//routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const categoryRoutes = require("./routes/category");
const productRoutes = require("./routes/product");
const orderRoutes = require("./routes/order");

//mongoose.connect('mongodb://localhost:27017/clothes').then( ()=> {console.log("DB Connected")});

//DB connection
mongoose.connect(process.env.DATABASE)
.then(()=> {console.log("DB Connected")});

//Middlewares
app.use(bodyParser.json());                              //body-parser, cookie-parser, CORS
app.use(cookieParser()); 
app.use(cors());

//Routes
app.use('/api',authRoutes); 
app.use('/api',userRoutes);
app.use('/api',categoryRoutes);
app.use('/api',productRoutes);
app.use('/api',orderRoutes);

app.listen(port, () => { 
    console.log(`App is running at port : ${port}`)
});

