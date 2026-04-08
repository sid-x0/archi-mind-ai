import React, { useState } from 'react';
import { useBuilding } from '../../context/BuildingContext';
import './ConfigurationModal.css';

interface ConfigurationModalProps {
  onComplete: () => void;
}

export function ConfigurationModal({ onComplete }: ConfigurationModalProps) {
  const { dispatch } = useBuilding();

  // default to config values, or our new setup defaults
  const [budgetLakhs, setBudgetLakhs] = useState<string>('50');
  const [roomSqft, setRoomSqft] = useState<string>('500');
  const [shape, setShape] = useState<string>('rectangle');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const budgetVal = parseInt(budgetLakhs, 10);
    const sqftVal = parseInt(roomSqft, 10);

    if (isNaN(budgetVal) || budgetVal <= 0) return;
    if (isNaN(sqftVal) || sqftVal <= 0) return;

    setIsSubmitting(true);

    try {
      // Budget is stored in Lakhs in the state but the value passed to backend is direct INR
      const totalBudgetInr = budgetVal * 100000;
      
      const res = await fetch('http://localhost:8000/api/configure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          total_budget: totalBudgetInr,
          default_room_sqft: sqftVal,
          shape: shape
        })
      });

      if (!res.ok) {
        throw new Error('Failed to configure building');
      }

      const updatedState = await res.json();
      
      dispatch({ type: 'SET_STATE', payload: updatedState });
      onComplete();
    } catch (err) {
      console.error("Configuration error:", err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-panel">
        <h2 className="modal-title">Project Setup</h2>
        <p className="modal-subtitle">Define your project budget and room dimensions before starting.</p>
        
        <form onSubmit={handleSubmit} className="setup-form">
          <div className="form-group">
            <label htmlFor="budget">Total Budget (in ₹ Lakhs)</label>
            <input 
              id="budget"
              type="number" 
              min="1"
              value={budgetLakhs} 
              onChange={(e) => setBudgetLakhs(e.target.value)} 
              className="setup-input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="sqft">Default Room Area (sq. ft.)</label>
            <input 
              id="sqft"
              type="number" 
              min="50"
              step="10"
              value={roomSqft} 
              onChange={(e) => setRoomSqft(e.target.value)} 
              className="setup-input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="shape">Building Shape</label>
            <select 
              id="shape"
              value={shape}
              onChange={(e) => setShape(e.target.value)}
              className="setup-input"
              required
            >
              <option value="rectangle">Rectangle</option>
              <option value="square">Square</option>
              <option value="pyramid">Pyramid</option>
            </select>
          </div>

          <button 
            type="submit" 
            className="setup-button" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Starting...' : 'Start Building 👋'}
          </button>
        </form>
      </div>
    </div>
  );
}
