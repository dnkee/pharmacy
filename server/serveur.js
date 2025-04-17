import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors()); 
app.use(express.static("public"));
const port = 3000;

// 🔌 Connexion à MongoDB
mongoose.connect('mongodb+srv://user:user@cluster83783.o4fhg.mongodb.net/pharmacy?retryWrites=true&w=majority&appName=Cluster83783')
  .then(() => {
    console.log('✅ Connecté à MongoDB Atlas');
  })
  .catch((err) => {
    console.error('❌ Erreur de connexion à MongoDB Atlas :', err);
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

// Routes
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

app.listen(port, () => {
  console.log(`Serveur démarré sur le port ${port}`);
}); 