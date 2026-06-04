import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const BylawContext = createContext(null);

export const BylawProvider = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [bylaw, setBylaw] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchBylaw = async () => {
      try {
        const response = await api.get('/bylaw');
        if (response.data.success) {
          setBylaw(response.data.data);
        } else {
          setError('Failed to load academic bylaw');
        }
      } catch (err) {
        setError('Error connecting to bylaw service');
      } finally {
        setLoading(false);
      }
    };

    fetchBylaw();
  }, [user, authLoading]);

  return (
    <BylawContext.Provider value={{ bylaw, loading, error }}>
      {children}
    </BylawContext.Provider>
  );
};

export const useBylaw = () => {
  const context = useContext(BylawContext);
  if (!context) {
    throw new Error('useBylaw must be used within a BylawProvider');
  }
  return context;
};
