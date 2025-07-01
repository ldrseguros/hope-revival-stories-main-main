const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const uploadHandler = require('./api/upload.js');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

console.log('Iniciando servidor Express...');

// Middleware
app.use(cors());
app.use(express.json());
// app.use(express.static(path.join(__dirname, 'dist'))); // REMOVIDO PARA DEPLOY API NO RAILWAY

// Health check endpoint
app.get('/api/health', (req, res) => {
  console.log('Health check chamado');
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
app.post('/api/upload', (req, res, next) => {
  console.log('Upload chamado');
  require('./api/upload.js')(req, res, next);
});

// REMOVIDO: Serve React app para todas as outras rotas
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, 'dist', 'index.html'));
// });

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 