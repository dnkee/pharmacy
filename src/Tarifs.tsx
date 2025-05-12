import React from 'react';
import './App.css';

interface Service {
  name: string;
  items: {
    name: string;
    price: string;
  }[];
}

const services: Service[] = [
  {
    name: "Canapés",
    items: [
      { name: "Canapé 2 places", price: "À partir de 49€" },
      { name: "Canapé 3 places", price: "À partir de 69€" },
      { name: "Canapé d'angle", price: "À partir de 89€" },
      { name: "Canapé convertible", price: "À partir de 79€" }
    ]
  },
  {
    name: "Tapis",
    items: [
      { name: "Petit tapis (< 2m²)", price: "À partir de 29€" },
      { name: "Tapis moyen (2-4m²)", price: "À partir de 39€" },
      { name: "Grand tapis (> 4m²)", price: "À partir de 59€" },
      { name: "Tapis d'escalier", price: "À partir de 19€/m²" }
    ]
  },
  {
    name: "Entretien spécial",
    items: [
      { name: "Nettoyage poils d'animaux", price: "À partir de 15€" },
      { name: "Traitement anti-acariens", price: "À partir de 25€" },
      { name: "Désinfection", price: "À partir de 20€" },
      { name: "Protection anti-taches", price: "À partir de 30€" }
    ]
  }
];

const Tarifs = () => {
  return (
    <div className="container">
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

      <div className="dashboard-header">
        <h1>Nos Tarifs</h1>
      </div>

      <div className="tarifs-container">
        {services.map((service, index) => (
          <div key={index} className="service-section">
            <h2 className="service-title">{service.name}</h2>
            <div className="service-items">
              {service.items.map((item, itemIndex) => (
                <div key={itemIndex} className="service-item">
                  <div className="item-name">{item.name}</div>
                  <div className="item-price">{item.price}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Tarifs; 