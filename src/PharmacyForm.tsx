import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css'

interface FormData {
  patientName: string;
  medicationName: string;
  dosage: string;
  patientEmail: string;
  patientPhone: string;
  urgency: string;
  notes: string;
}

const PharmacyForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    patientName: '',
    medicationName: '',
    dosage: '',
    patientEmail: '',
    patientPhone: '',
    urgency: 'low',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'envoi de la demande');
      }

      // Réinitialiser le formulaire
      setFormData({
        patientName: '',
        medicationName: '',
        dosage: '',
        patientEmail: '',
        patientPhone: '',
        urgency: 'low',
        notes: '',
      });

      // Afficher un message de succès
      alert('Votre demande a été envoyée avec succès !');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <header className="header">
        <div className="logo-container">
          <img 
            src="https://cdn.mesoigner.fr/uploads/logos/logo-mon-pharmacien-upp.svg" 
            alt="Logo Mon Pharmacien UPP" 
            className="logo"
          />
          <div className="pharmacy-title">
            <h2>La Grande pharmacie de Paron</h2>
            <div className="location">4 Av. Edme-Pierre Chauvot de Beauchêne, 89100 Paron</div>
          </div>
        </div>
        <h1>Demande de médicament</h1>
      </header>
      
      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label>
            Votre nom
          </label>
          <input
            type="text"
            name="patientName"
            value={formData.patientName}
            onChange={handleChange}
            required
            placeholder="ex: Jean Dupont"
          />
        </div>

        <div className="form-group">
          <label>
            Nom du médicament
          </label>
          <input
            type="text"
            name="medicationName"
            value={formData.medicationName}
            onChange={handleChange}
            required
            placeholder="ex: Paracétamol"
          />
        </div>

        <div className="form-group">
          <label>
            Dosage / Forme
          </label>
          <input
            type="text"
            name="dosage"
            value={formData.dosage}
            onChange={handleChange}
            required
            placeholder="ex: 500mg / comprimé"
          />
        </div>

        <div className="form-group">
          <label>
            Email
          </label>
          <input
            type="email"
            name="patientEmail"
            value={formData.patientEmail}
            onChange={handleChange}
            required
            placeholder="ex: jean.dupont@email.com"
          />
        </div>

        <div className="form-group">
          <label>
            Téléphone
          </label>
          <input
            type="tel"
            name="patientPhone"
            value={formData.patientPhone}
            onChange={handleChange}
            required
            placeholder="ex: 06 12 34 56 78"
          />
        </div>

        <div className="form-group">
          <label>
            Niveau d'urgence
          </label>
          <select
            name="urgency"
            value={formData.urgency}
            onChange={handleChange}
          >
            <option value="low">Faible</option>
            <option value="medium">Moyen</option>
            <option value="high">Urgent</option>
          </select>
        </div>

        <div className="form-group">
          <label>
            Notes supplémentaires
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="ex: Allergie à la pénicilline, traitement en cours..."
          />
        </div>

        <button type="submit">
          Soumettre la demande
        </button>
      </form>
    </div>
  )
}

export default PharmacyForm;