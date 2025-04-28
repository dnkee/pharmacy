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

const InfoPopup: React.FC<{ title: string; content: string; onClose: () => void }> = ({ title, content, onClose }) => {
  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-content" onClick={e => e.stopPropagation()}>
        <div className="popup-header">
          <h3>{title}</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div className="popup-body">
          <p>{content}</p>
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
  const [selectedInfo, setSelectedInfo] = useState<{ title: string; content: string } | null>(null);

  const handleValidate = async (requestId: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/requests/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'validated' }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la validation de la demande');
      }

      // Rafraîchir la liste des demandes
      const updatedResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/requests`);
      const updatedData = await updatedResponse.json();
      setRequests(updatedData);
    } catch (err) {
      console.error('Erreur lors de la validation:', err);
      alert('Erreur lors de la validation de la demande');
    }
  };

  const handleRemove = async (requestId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir retirer cette demande ?')) {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/requests/${requestId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Erreur lors de la suppression de la demande');
        }

        // Rafraîchir la liste des demandes
        const updatedResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/requests`);
        const updatedData = await updatedResponse.json();
        setRequests(updatedData);
      } catch (err) {
        console.error('Erreur lors de la suppression:', err);
        alert('Erreur lors de la suppression de la demande');
      }
    }
  };

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/requests`);
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des données');
        }
        const data = await response.json();
        setRequests(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
        console.error('Erreur:', err);
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

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Chargement en cours...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="error-message">
          <h2>Erreur de chargement</h2>
          <p>{error}</p>
          <p>Le serveur backend n'est peut-être pas démarré ou n'est pas accessible.</p>
          <button onClick={() => window.location.reload()}>Réessayer</button>
        </div>
      </div>
    );
  }

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
          <div>Notes</div>
          <div>Actions</div>
        </div>
        {requests.map((request) => (
          <div key={request._id} className="request-row">
            <div className="clickable" onClick={() => setSelectedInfo({ title: 'Nom du patient', content: request.patientName })}>
              {request.patientName}
            </div>
            <div className="clickable" onClick={() => setSelectedInfo({ title: 'Email', content: request.patientEmail })}>
              {request.patientEmail}
            </div>
            <div className="clickable" onClick={() => setSelectedInfo({ title: 'Dosage', content: request.dosage })}>
              {request.dosage}
            </div>
            <div className="clickable" onClick={() => setSelectedInfo({ title: 'Médicament', content: request.medicationName })}>
              {request.medicationName}
            </div>
            <div className="clickable" onClick={() => setSelectedInfo({ title: 'Téléphone', content: request.patientPhone })}>
              {request.patientPhone}
            </div>
            <div className={`urgency-badge ${getUrgencyColor(request.urgency)}`}>
              {request.urgency === 'high' ? 'Urgent' : 
               request.urgency === 'medium' ? 'Moyen' : 'Faible'}
            </div>
            <div className="clickable" onClick={() => setSelectedInfo({ title: 'Date', content: new Date(request.date).toLocaleDateString() })}>
              {new Date(request.date).toLocaleDateString()}
            </div>
            <div className="notes-column">
              <button 
                className="notes-button"
                onClick={() => setSelectedNotes(request.notes)}
                title="Voir les notes"
              >
                📝
              </button>
            </div>
            <div className="actions-column">
              <div className="quick-actions">
                <button 
                  className="validate-button"
                  onClick={() => handleValidate(request._id)}
                  title="Valider"
                >
                  ✓
                </button>
                <button 
                  className="remove-button"
                  onClick={() => handleRemove(request._id)}
                  title="Retirer"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedNotes && (
        <NotesPopup 
          notes={selectedNotes} 
          onClose={() => setSelectedNotes(null)} 
        />
      )}
      {selectedInfo && (
        <InfoPopup 
          title={selectedInfo.title}
          content={selectedInfo.content}
          onClose={() => setSelectedInfo(null)} 
        />
      )}
    </div>
  );
}

export default PharmacyDashboard; 