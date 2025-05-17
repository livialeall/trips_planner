import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
  
    useEffect(() => {
      if (!currentUser) {
        navigate('/auth', { replace: true });
      }
    }, [currentUser, navigate]);
  
    return currentUser ? <>{children}</> : null;
  };