import {useState} from 'react'

export default function InfoTooltip() {
    const [showTooltip, setShowTooltip] = useState(false);
  
    return (
      <div className="tooltip-container">
        <button 
          onClick={() => setShowTooltip(!showTooltip)}
          className="info-button"
        >
          ⓘ Segurança
        </button>
        
        {showTooltip && (
          <div className="tooltip">
            <p>Este chat usa criptografia ponta-a-ponta.</p>
            <p><em>Implementação independente não auditada.</em></p>
          </div>
        )}
      </div>
    );
  }