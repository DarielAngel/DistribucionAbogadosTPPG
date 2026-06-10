require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { sequelize } = require('./models');
const authRoutes = require('./routes/auth');
const lawyersRoutes = require('./routes/lawyers');
const schedulesRoutes = require('./routes/schedules');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use('/api/auth', authRoutes);
app.use('/api/lawyers', lawyersRoutes);
app.use('/api/schedules', schedulesRoutes);

const PORT = process.env.PORT || 4000;

async function start(){
  try{
    await sequelize.authenticate();
    await sequelize.sync();
    app.listen(PORT, ()=> console.log(`Server listening on ${PORT}`));
  }catch(err){
    console.error('Failed to start server', err);
  }
}

// If this file is run directly, start the server. Otherwise export `app` and `sequelize` for tests.
if (require.main === module) {
  start();
}

module.exports = { app, sequelize, start };
