import React from 'react';
import PricingList from '../components/PricingList';
import './Tarifs.css';

const Tarifs: React.FC = () => {
  return (
    <div className="tarifs-page">
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
      <PricingList />
    </div>
  );
};

export default Tarifs; 