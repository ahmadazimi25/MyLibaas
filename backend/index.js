require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Import authentication routes
const authRoutes = require('./routes/auth');

// Import clothing item routes
const clothingRoutes = require('./routes/clothing');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Use authentication routes
app.use('/api/auth', authRoutes);

// Use clothing item routes
app.use('/api/clothing', clothingRoutes);

// Basic route
app.get('/', (req, res) => {
  res.send('Welcome to the MyLibaas Backend API!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
