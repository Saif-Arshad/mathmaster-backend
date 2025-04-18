
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const quizRoutes = require('./routes/quizRoutes');
const initialQuizRoutes = require('./routes/initialQuizRoutes');
const hintROutes = require('./routes/hintRoutes');

require('./config/db');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser());
app.get('/', (req, res) => {
    res.send('Welcome to Math Master Backend powered by Prisma!');
});
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/admin', adminRoutes);
app.use('/quiz', quizRoutes);
app.use('/initial-quiz', initialQuizRoutes);
app.use('/hints', hintROutes);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
