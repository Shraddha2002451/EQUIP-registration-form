var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");

const app = express();


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

mongoose.connect('mongodb://127.0.0.1:27017/new', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

var db = mongoose.connection;
db.on('error', () => console.log("Error in Connecting to Database"));
db.once('open', () => console.log("Connected to Database"));


const userSchema = new mongoose.Schema({
    firstname: String,
    lastname: String,
    phno: String,
    password: String 
});


const User = mongoose.model('User', userSchema);

app.post("/register", async (req, res) => {
    const { firstname, lastname, phno, password } = req.body;


    const existingUser = await User.findOne({ phno });

    if (existingUser) {
        return res.status(400).json({ message: 'Phone number already registered' });
    }

 
    const newUser = new User({
        firstname,
        lastname,
        phno,
        password
    });

    try {
        await newUser.save();
        console.log("User registered successfully");
        return res.redirect('login.html');  
    } catch (err) {
        console.error("Error in registering user:", err);
        res.status(500).send('Error in registering user');
    }
});


app.post("/login", async (req, res) => {
    const { phno, password } = req.body;

  
    const user = await User.findOne({ phno });

    if (!user) {
        return res.status(401).json({ message: 'Invalid phone number or password' });
    }

    if (user.password !== password) {
        return res.status(401).json({ message: 'Invalid phone number or password' });
    }

    console.log("User logged in successfully");
    res.status(200).json({
        message: 'Login successful',
    });
});

app.use(express.static('public')); 


app.listen(3000, () => {
    console.log("Listening on port 3000");
});
