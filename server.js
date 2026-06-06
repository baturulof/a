const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3050;

// Serve static files with no-cache headers for easy local development
app.use(express.static(__dirname, {
  etag: false,
  lastModified: false,
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
}));

// Route fallback to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 LingoMotion Server is running on port ${PORT}`);
  console.log(`💻 Access locally: http://localhost:${PORT}`);
  console.log(`======================================================\n`);
});
