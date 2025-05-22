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
  status?: string;
}

interface GroupedRequests {
  [key: string]: Request[];
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

const ValidatedRequestsPopup: React.FC<{ 
  requests: Request[]; 
  onClose: () => void;
  onNotifyAvailability: (requestId: string) => void;
}> = ({ requests, onClose, onNotifyAvailability }) => {
  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-content" onClick={e => e.stopPropagation()}>
        <div className="popup-header">
          <h3>Demandes validées</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div className="popup-body">
          {requests.length === 0 ? (
            <p>Aucune demande validée</p>
          ) : (
            <div className="validated-requests-list">
              {requests.map(request => (
                <div key={request._id} className="validated-request-item">
                  <div className="request-info">
                    <p><strong>Patient:</strong> {request.patientName}</p>
                    <p><strong>Médicament:</strong> {request.medicationName}</p>
                    <p><strong>Dosage:</strong> {request.dosage}</p>
                    <p><strong>Email:</strong> {request.patientEmail}</p>
                    <p><strong>Date de validation:</strong> {new Date(request.date).toLocaleDateString()}</p>
                  </div>
                  <button 
                    className="notify-button"
                    onClick={() => onNotifyAvailability(request._id)}
                  >
                    Notifier la disponibilité
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function PharmacyDashboard() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [validatedRequests, setValidatedRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNotes, setSelectedNotes] = useState<string | null>(null);
  const [selectedInfo, setSelectedInfo] = useState<{ title: string; content: string } | null>(null);
  const [isGrouped, setIsGrouped] = useState(false);
  const [groupedRequests, setGroupedRequests] = useState<GroupedRequests>({});
  const [showValidatedRequests, setShowValidatedRequests] = useState(false);

  const handleValidate = async (requestId: string) => {
    try {
      console.log("Validation de la demande:", requestId);
      console.log("URL API:", `${import.meta.env.VITE_API_URL}/api/requests/${requestId}`);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/requests/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'validated' }),
      });

      console.log("Réponse:", response.status, response.statusText);

      if (!response.ok) {
        throw new Error('Erreur lors de la validation de la demande');
      }

      // Retirer la demande validée du tableau
      setRequests(prevRequests => prevRequests.filter(request => request._id !== requestId));
      
      // Mettre à jour les demandes groupées si nécessaire
      if (isGrouped) {
        updateGroupedRequests(requests.filter(request => request._id !== requestId));
      }
      
      alert('Demande validée avec succès ! Un email de confirmation a été envoyé au patient.');
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

        // Retirer la demande du tableau
        setRequests(prevRequests => prevRequests.filter(request => request._id !== requestId));
        
        // Mettre à jour les demandes groupées si nécessaire
        if (isGrouped) {
          updateGroupedRequests(requests.filter(request => request._id !== requestId));
        }
        
        alert('Demande supprimée avec succès !');
      } catch (err) {
        console.error('Erreur lors de la suppression:', err);
        alert('Erreur lors de la suppression de la demande');
      }
    }
  };

  const updateGroupedRequests = (reqs: Request[]) => {
    const grouped: GroupedRequests = {};
    
    // Fonction pour normaliser le nom du médicament
    const normalizeMedicationName = (name: string): string => {
      return name
        .toLowerCase() // Convertir en minuscules
        .replace(/[^a-z0-9]/g, '') // Supprimer les caractères spéciaux
        .replace(/s$/, '') // Supprimer le 's' final
        .trim(); // Supprimer les espaces
    };

    reqs.forEach(request => {
      const normalizedName = normalizeMedicationName(request.medicationName);
      if (!grouped[normalizedName]) {
        grouped[normalizedName] = [];
      }
      grouped[normalizedName].push(request);
    });

    // Convertir les clés normalisées en noms originaux pour l'affichage
    const displayGrouped: GroupedRequests = {};
    Object.entries(grouped).forEach(([normalizedName, requests]) => {
      // Utiliser le nom le plus court comme clé d'affichage
      const displayName = requests.reduce((shortest, current) => 
        current.medicationName.length < shortest.length ? current.medicationName : shortest
      , requests[0].medicationName);
      
      displayGrouped[displayName] = requests;
    });

    setGroupedRequests(displayGrouped);
  };

  const toggleGrouping = () => {
    if (!isGrouped) {
      updateGroupedRequests(requests);
    }
    setIsGrouped(!isGrouped);
  };

  const handleNotifyAvailability = async (requestId: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/requests/${requestId}/notify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'envoi de la notification');
      }

      // Mettre à jour la liste des demandes validées en retirant la demande notifiée
      setValidatedRequests(prevRequests => prevRequests.filter(request => request._id !== requestId));
      
      alert('Le patient a été notifié de la disponibilité du médicament !');
    } catch (err) {
      console.error('Erreur lors de la notification:', err);
      alert('Erreur lors de l\'envoi de la notification');
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
        setRequests(data.filter((req: Request) => req.status !== 'validated'));
        setValidatedRequests(data.filter((req: Request) => req.status === 'validated'));
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

  const renderRequestRow = (request: Request) => (
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
  );

  const renderGroupedRequests = () => {
    return Object.entries(groupedRequests).map(([medicationName, reqs]) => (
      <div key={medicationName} className="medication-group">
        <div className="medication-header">
          <h3>{medicationName} ({reqs.length})</h3>
        </div>
        {reqs.map(request => renderRequestRow(request))}
      </div>
    ));
  };

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
        <div className="dashboard-actions">
          <button 
            className={`group-button ${isGrouped ? 'active' : ''}`} 
            onClick={toggleGrouping}
          >
            {isGrouped ? 'Affichage Normal' : 'Regrouper par Médicament'}
          </button>
          <button 
            className="validated-button"
            onClick={() => setShowValidatedRequests(true)}
          >
            Voir les demandes validées ({validatedRequests.length})
          </button>
        </div>
      </div>

      <div className="requests-table">
        <div className="requests-header">
          <div>Nom du patient</div>
          <div>Email</div>
          <div>Dosage / Forme</div>
          <div>Médicament</div>
          <div>Téléphone</div>
          <div>Urgence</div>
          <div>Date</div>
          <div>Notes</div>
          <div>Actions</div>
        </div>
        {isGrouped ? renderGroupedRequests() : requests.map(request => renderRequestRow(request))}
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

      {showValidatedRequests && (
        <ValidatedRequestsPopup 
          requests={validatedRequests}
          onClose={() => setShowValidatedRequests(false)}
          onNotifyAvailability={handleNotifyAvailability}
        />
      )}
    </div>
  );
}

export default PharmacyDashboard; 