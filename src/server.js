const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');

const { port, mongoUri } = require('./config');

const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/courses');
const assignmentRoutes = require('./routes/assignments');

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use('/auth-ui', express.static(__dirname + '/public'));

// Swagger setup
const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: '3.0.0',
    info: { title: 'LMS API', version: '1.0.0' },
    servers: [{ url: 'http://localhost:' + (process.env.PORT || 5000) }]
  },
  apis: [
    __dirname + '/routes/*.js',
    __dirname + '/models/*.js'
  ]
});
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/health', (_req, res) => res.json({ ok: true }));
app.get('/', (_req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/assignments', assignmentRoutes);

async function start() {
  try {
    await mongoose.connect(mongoUri, { autoIndex: true });
    console.log('MongoDB connected');
    app.listen(port, () => console.log(`Server listening on :${port}`));
  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
}

start();


