import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(cors());

// Configuration MongoDB Atlas
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://user:user@cluster83783.o4fhg.mongodb.net/pharmacy?retryWrites=true&w=majority&appName=Cluster83783';

// 🔌 Connexion à MongoDB avec options de configuration
mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
.then(() => {
  console.log('✅ Connecté à MongoDB Atlas');
})
.catch((err) => {
  console.error('❌ Erreur de connexion à MongoDB Atlas :');
  console.error('Message:', err.message);
  if (err.code) console.error('Code:', err.code);
  if (err.name) console.error('Name:', err.name);
});

// Schéma pour les demandes de médicaments
const requestSchema = new mongoose.Schema({
  patientName: String,
  medicationName: String,
  dosage: String,
  patientEmail: String,
  patientPhone: String,
  urgency: String,
  notes: String,
  date: { type: Date, default: Date.now }
});

const Request = mongoose.model('dashboard', requestSchema, 'dashboard');

// Routes API
app.get('/api/requests', async (req, res) => {
  try {
    const requests = await Request.find().sort({ date: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/requests', async (req, res) => {
  try {
    const newRequest = new Request(req.body);
    const savedRequest = await newRequest.save();
    res.status(201).json(savedRequest);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.put('/api/requests/:id', async (req, res) => {
  try {
    const updatedRequest = await Request.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedRequest);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/requests/:id', async (req, res) => {
  try {
    await Request.findByIdAndDelete(req.params.id);
    res.json({ message: 'Demande supprimée' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Servir les fichiers statiques en production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
