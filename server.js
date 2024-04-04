// server.js

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors =require("cors");
const auctionSpacesRouter = require('./routes/auctionspaces');
const userRoutes = require('./routes/UserRoutes');
const User = require('./models/UserModel');
// Initialize Express app
const app = express();

app.use(bodyParser.json());

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
}));

async function connectDB() {
    try {
      url="mongodb+srv://gigeconom:econ_123@cluster0.2rcqptj.mongodb.net/?retryWrites=true&w=majority"
      await mongoose.connect(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
  
      console.log(`Database connected: ${url}`);
    } catch (err) {
      console.error(`Connection error: ${err}`);
      process.exit(1);
    }
  }
  
  // Call connectDB function
  connectDB();

  app.get('/',(req,res)=>{
    res.send("hello Purna Chandu");
  })

// Create User model and schema


app.use('/auctionspaces', auctionSpacesRouter);
app.use('/users', userRoutes);

// POST route to insert user data into MongoDB
app.post('/checkUser', (req, res) => {
    const { email } = req.body;
    User.findOne({ email: email })
        .then(user => {
            if (user) {
                res.json({ exists: true });
            } else {
                res.json({ exists: false });
            }
        })
        .catch(err => {
            console.error('Error checking user:', err);
            res.status(500).json({ error: 'Error checking user' });
        });
});

app.post('/users', (req, res) => {
    const { email, name } = req.body;
    User.findOne({ email: email })
        .then(existingUser => {
            if (existingUser) {
                res.status(400).json({ error: 'Email already exists' });
            } else {
                const newUser = new User({ email, name });
                newUser.save()
                    .then(() => {
                        res.status(201).json({ message: 'User data inserted successfully' });
                    })
                    .catch(err => {
                        console.error('Error inserting user data:', err);
                        res.status(500).json({ error: 'Error inserting user data' });
                    });
            }
        })
        .catch(err => {
            console.error('Error checking existing user:', err);
            res.status(500).json({ error: 'Error checking existing user' });
        });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
