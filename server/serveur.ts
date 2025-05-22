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
    await transporter.sendMail(mailOptions);
    console.log('Email de confirmation envoyé avec succès');
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
  }
};

// Fonction pour envoyer l'email de notification de disponibilité
const sendAvailabilityEmail = async (email: string, patientName: string, medicationName: string, dosage: string) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Votre médicament est disponible',
    html: `
      <h2>Bonjour ${patientName},</h2>
      <p>Nous avons le plaisir de vous informer que votre médicament est maintenant disponible à la pharmacie.</p>
      <p><strong>Détails de votre commande :</strong></p>
      <ul>
        <li>Médicament : ${medicationName}</li>
        <li>Dosage : ${dosage}</li>
      </ul>
      <p>Vous pouvez venir le retirer à la pharmacie aux horaires d'ouverture habituels.</p>
      <br>
      <p>Cordialement,</p>
      <p>L'équipe de La Grande pharmacie de Paron</p>
      <p>4 Av. Edme-Pierre Chauvot de Beauchêne, 89100 Paron</p>
      <p>Tél : 03 86 97 00 00</p>
      <p>Horaires d'ouverture :</p>
      <ul>
        <li>Lundi - Vendredi : 8h30 - 19h30</li>
        <li>Samedi : 8h30 - 19h00</li>
        <li>Dimanche : 9h00 - 12h00</li>
      </ul>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email de disponibilité envoyé avec succès');
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email de disponibilité:', error);
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
    const request = await Request.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Demande non trouvée' });
    }

    request.status = req.body.status;
    await request.save();

    // Si la demande est validée, envoyer l'email de confirmation
    if (req.body.status === 'validated' && request.patientEmail && request.patientName && request.medicationName) {
      await sendConfirmationEmail(request.patientEmail, request.patientName, request.medicationName);
    }

    res.json(request);
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

// Route pour notifier la disponibilité
app.post('/api/requests/:id/notify', async (req: ExpressRequest, res: Response) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Demande non trouvée' });
    }

    if (!request.patientEmail || !request.patientName || !request.medicationName || !request.dosage) {
      return res.status(400).json({ message: 'Informations manquantes pour l\'envoi de l\'email' });
    }

    const emailSent = await sendAvailabilityEmail(
      request.patientEmail,
      request.patientName,
      request.medicationName,
      request.dosage
    );

    if (emailSent) {
      res.json({ message: 'Email de notification envoyé avec succès' });
    } else {
      res.status(500).json({ message: 'Erreur lors de l\'envoi de l\'email' });
    }
  } catch (error) {
    console.error('Erreur lors de la notification:', error);
    res.status(500).json({ message: 'Erreur lors de la notification' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});

export default app; 