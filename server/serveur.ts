import express from 'express';
import type { Request as ExpressRequest, Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Connexion à MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://dfrancekie:Toto1234@cluster0.ydwvxo0.mongodb.net/pharmacy?retryWrites=true&w=majority';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connexion à MongoDB réussie'))
  .catch(err => console.error('Erreur de connexion à MongoDB:', err));

// Schéma et modèle pour les demandes
const requestSchema = new mongoose.Schema({
  patientName: String,
  medicationName: String,
  dosage: String,
  patientEmail: String,
  patientPhone: String,
  urgency: String,
  notes: String,
  status: {
    type: String,
    enum: ['pending', 'validated', 'rejected'],
    default: 'pending'
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const Request = mongoose.model('Request', requestSchema);

// Configuration de nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Fonction pour envoyer l'email de confirmation
const sendConfirmationEmail = async (email: string, patientName: string, medicationName: string) => {
  console.log('Tentative d\'envoi d\'email à:', email);
  console.log('Utilisation des identifiants:', {
    user: process.env.EMAIL_USER ? 'Configuré' : 'Non configuré',
    pass: process.env.EMAIL_PASSWORD ? 'Configuré' : 'Non configuré'
  });
  
  // Vérifier si les variables d'environnement sont définies
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.error('Les identifiants email ne sont pas configurés');
    return;
  }
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Confirmation de votre demande de médicament',
    html: `
      <h2>Bonjour ${patientName},</h2>
      <p>Nous avons bien reçu votre demande pour le médicament : <strong>${medicationName}</strong>.</p>
      <p>Votre demande a été validée et le médicament sera ajouté à notre stock dans les plus brefs délais.</p>
      <p>Nous vous contacterons dès que le médicament sera disponible.</p>
      <br>
      <p>Cordialement,</p>
      <p>L'équipe de La Grande pharmacie de Paron</p>
      <p>4 Av. Edme-Pierre Chauvot de Beauchêne, 89100 Paron</p>
    `
  };

  try {
    console.log('Envoi de l\'email en cours...');
    await transporter.sendMail(mailOptions);
    console.log('Email de confirmation envoyé avec succès');
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    return false;
  }
};

// Route pour récupérer toutes les demandes
app.get('/api/requests', async (req: ExpressRequest, res: Response) => {
  try {
    const requests = await Request.find().sort({ date: -1 });
    res.json(requests);
  } catch (error) {
    console.error('Erreur lors de la récupération des demandes:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des demandes' });
  }
});

// Route pour créer une nouvelle demande
app.post('/api/requests', async (req: ExpressRequest, res: Response) => {
  try {
    const newRequest = new Request(req.body);
    await newRequest.save();
    res.status(201).json(newRequest);
  } catch (error) {
    console.error('Erreur lors de la création de la demande:', error);
    res.status(500).json({ message: 'Erreur lors de la création de la demande' });
  }
});

// Route pour mettre à jour le statut d'une demande
app.put('/api/requests/:id', async (req: ExpressRequest, res: Response) => {
  try {
    console.log('Mise à jour de la demande:', req.params.id);
    console.log('Données reçues:', req.body);
    
    const request = await Request.findById(req.params.id);
    if (!request) {
      console.log('Demande non trouvée:', req.params.id);
      return res.status(404).json({ message: 'Demande non trouvée' });
    }

    request.status = req.body.status;
    await request.save();
    console.log('Demande mise à jour avec succès, statut:', request.status);

    // Si la demande est validée, envoyer l'email de confirmation
    if (req.body.status === 'validated') {
      console.log('Tentative d\'envoi d\'email pour la demande validée');
      
      if (!request.patientEmail) {
        console.error('Email du patient manquant');
        return res.status(400).json({ message: 'Email du patient manquant, impossible d\'envoyer l\'email' });
      }
      
      try {
        const emailSent = await sendConfirmationEmail(
          request.patientEmail, 
          request.patientName || 'Patient', 
          request.medicationName || 'Médicament demandé'
        );
        
        if (emailSent) {
          console.log('Email envoyé avec succès');
        } else {
          console.warn('L\'email n\'a pas pu être envoyé');
        }
      } catch (emailError) {
        console.error('Erreur lors de l\'envoi de l\'email:', emailError);
        // On continue malgré l'erreur d'email
      }
    }

    res.json({ 
      message: 'Demande mise à jour avec succès',
      request: request 
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour de la demande' });
  }
});

// Route pour supprimer une demande
app.delete('/api/requests/:id', async (req: ExpressRequest, res: Response) => {
  try {
    const request = await Request.findByIdAndDelete(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Demande non trouvée' });
    }
    res.json({ message: 'Demande supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression de la demande' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});

export default app; 