import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './App.css';

interface Request {
  _id: string;
  patientName: string;
  medicationName: string;
  dosage: string;
  patientEmail: string;
  patientPhone: string;
  urgency: string;
  notes: string;
  date: string;
}

const NotesPopup: React.FC<{ notes: string; onClose: () => void }> = ({ notes, onClose }) => {
  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-content" onClick={e => e.stopPropagation()}>
        <div className="popup-header">
          <h3>Notes complémentaires</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div className="popup-body">
          <p>{notes || 'Aucune note complémentaire'}</p>
        </div>
      </div>
    </div>
  );
};

function PharmacyDashboard() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNotes, setSelectedNotes] = useState<string | null>(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/requests');
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des données');
        }
        const data = await response.json();
        setRequests(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return 'high-urgency';
      case 'medium':
        return 'medium-urgency';
      case 'low':
        return 'low-urgency';
      default:
        return '';
    }
  };

  if (loading) return <div className="loading">Chargement...</div>;
  if (error) return <div className="error">Erreur: {error}</div>;

  return (
    <div className="container">
      <div className="logo-container">
        <img src="https://cdn.mesoigner.fr/uploads/logos/logo-mon-pharmacien-upp.svg" alt="Logo Pharmacie" className="logo" />
        <div className="pharmacy-title">
          <h2>La Grande pharmacie de Paron</h2>
          <div className="location">4 Av. Edme-Pierre Chauvot de Beauchêne, 89100 Paron</div>
        </div>
      </div>

      <div className="dashboard-header">
        <h1>Tableau de bord des demandes</h1>
       
      </div>

      <div className="requests-table">
        <div className="requests-header">
          <div>Nom du patient</div>
          <div>Email</div>
          <div>Dosage</div>
          <div>Médicament</div>
          <div>Téléphone</div>
          <div>Urgence</div>
          <div>Date</div>
          <div>Actions</div>
        </div>

        {requests.map((request) => (
          <div key={request._id} className="request-row">
            <div className="request-item">{request.patientName}</div>
            <div className="request-item contact-info">
              <div>{request.patientEmail}</div>
            </div>
            <div className="request-item">{request.dosage}</div>
            <div className="request-item">{request.medicationName}</div>
            <div className="request-item">{request.patientPhone}</div>
            <div className="request-item">
              <span className={`urgency-badge ${getUrgencyColor(request.urgency)}`}>
                {request.urgency === 'high' ? 'Urgent' : 
                 request.urgency === 'medium' ? 'Moyen' : 'Faible'}
              </span>
            </div>
            <div className="request-item">
              {new Date(request.date).toLocaleDateString()}
            </div>
            <div className="request-item">
              <button className="notes-button" onClick={() => setSelectedNotes(request.notes)}>
                Voir
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedNotes !== null && (
        <NotesPopup 
          notes={selectedNotes} 
          onClose={() => setSelectedNotes(null)} 
        />
      )}
    </div>
  );
}

export default PharmacyDashboard; 