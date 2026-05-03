import { useContext } from 'react';
import { ModalContext } from '../context/ModalContext';

export const useAppModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useAppModal must be used within a ModalProvider');
  }
  return context;
};
