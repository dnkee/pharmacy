import React, { useState } from 'react';
import './PricingList.css';

interface PricingItem {
  name: string;
  prices: {
    description: string;
    price: string;
  }[];
}

const pricingData: PricingItem[] = [
  {
    name: "Tapis",
    prices: [
      { description: "Nettoyage basique", price: "15€" },
      { description: "Nettoyage complet", price: "25€" },
      { description: "Détachage", price: "10€" },
      { description: "Traitement anti-acariens", price: "20€" }
    ]
  },
  {
    name: "Canapé",
    prices: [
      { description: "Nettoyage 2 places", price: "45€" },
      { description: "Nettoyage 3 places", price: "65€" },
      { description: "Nettoyage d'angle", price: "85€" },
      { description: "Traitement anti-acariens", price: "30€" }
    ]
  }
];

const PricingList: React.FC = () => {
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const toggleItem = (name: string) => {
    setExpandedItem(expandedItem === name ? null : name);
  };

  return (
    <div className="pricing-container">
      <h2>Nos Tarifs</h2>
      <div className="pricing-list">
        {pricingData.map((item) => (
          <div key={item.name} className="pricing-item">
            <div 
              className="pricing-header"
              onClick={() => toggleItem(item.name)}
            >
              <h3>{item.name}</h3>
              <span className="expand-icon">
                {expandedItem === item.name ? '▼' : '▶'}
              </span>
            </div>
            {expandedItem === item.name && (
              <div className="pricing-details">
                {item.prices.map((price, index) => (
                  <div key={index} className="price-row">
                    <span className="price-description">{price.description}</span>
                    <span className="price-value">{price.price}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PricingList; 