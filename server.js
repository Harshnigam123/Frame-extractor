const express = require('express');
const cors = require('cors');

const extractRouter = require('./routes/extract');
const extractionsRouter = require('./routes/extractions');

const app = express();
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'YouTube Frame Extractor backend is running.' });
});

app.use('/extract-frames', extractRouter);
app.use('/extractions', extractionsRouter);

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
