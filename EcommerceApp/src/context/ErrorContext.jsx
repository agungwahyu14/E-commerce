import React, { createContext, useContext, useState } from 'react';

const ErrorContext = createContext(null);

export const ErrorProvider = ({ children }) => {
  const [error, setError] = useState({
    visible: false,
    title: '',
    message: '',
  });

  const showError = (title, message) => {
    setError({
      visible: true,
      title: title || 'Terjadi Kesalahan',
      message: message || 'Maaf, terjadi kesalahan yang tidak terduga. Silakan coba lagi nanti.',
    });
  };

  const hideError = () => {
    setError((prev) => ({ ...prev, visible: false }));
  };

  return (
    <ErrorContext.Provider value={{ error, showError, hideError }}>
      {children}
    </ErrorContext.Provider>
  );
};

export const useError = () => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
};
