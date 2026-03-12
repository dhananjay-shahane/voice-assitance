import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import yts from 'yt-search';

const app = express();
const PORT = 3000;
const HISTORY_FILE = path.join(process.cwd(), 'history.json');

app.use(cors());
app.use(express.json());

// Ensure history file exists
if (!fs.existsSync(HISTORY_FILE)) {
  fs.writeFileSync(HISTORY_FILE, JSON.stringify([]));
}

// API Routes
app.get('/api/search-music', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: 'Query required' });
    
    console.log(`Searching for music: ${q}`);
    
    // 🧠 Root Fix: Try multiple search variations to find embeddable versions
    // We prioritize "lyrics" and "audio" because "Official Music Videos" are often blocked from embedding
    const searchQueries = [`${q} lyrics`, `${q} audio`, q as string].map(query => yts(query));
    const results = await Promise.all(searchQueries);
    
    // Flatten and filter results
    const allVideos = results.flatMap(r => r.videos || []);
    
    // Filter out videos that are likely to be blocked (very long mixes or very short clips)
    // and prefer those that mention "lyrics" or "audio" in the title
    const bestMatch = allVideos.find(v => {
        const title = v.title.toLowerCase();
        return (title.includes('lyrics') || title.includes('audio') || title.includes('official audio')) && 
               v.seconds > 60 && v.seconds < 600; // Between 1 and 10 minutes
    }) || allVideos[0];
    
    if (bestMatch) {
      console.log(`Found best match: ${bestMatch.title} (${bestMatch.videoId})`);
      res.json({
        id: bestMatch.videoId,
        title: bestMatch.title,
        thumbnail: bestMatch.thumbnail,
        duration: bestMatch.duration.timestamp
      });
    } else {
      console.log(`No results found for: ${q}`);
      res.status(404).json({ error: 'No results found' });
    }
  } catch (error) {
    console.error('Music search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

app.get('/api/history', (req, res) => {
  try {
    const data = fs.readFileSync(HISTORY_FILE, 'utf8');
    res.json(JSON.parse(data));
  } catch (error) {
    res.status(500).json({ error: 'Failed to read history' });
  }
});

app.post('/api/history', (req, res) => {
  try {
    const data = fs.readFileSync(HISTORY_FILE, 'utf8');
    let history = JSON.parse(data);
    const newSession = req.body;
    
    // Check if session already exists
    const index = history.findIndex((s: any) => s.id === newSession.id);
    if (index !== -1) {
      history[index] = newSession;
    } else {
      history.unshift(newSession);
    }
    
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(history.slice(0, 50))); // Keep last 50
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save history' });
  }
});

app.delete('/api/history/:id', (req, res) => {
  try {
    const { id } = req.params;
    const data = fs.readFileSync(HISTORY_FILE, 'utf8');
    let history = JSON.parse(data);
    history = history.filter((s: any) => s.id !== id);
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(history));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete history' });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
