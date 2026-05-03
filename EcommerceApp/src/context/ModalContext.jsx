import React, { createContext, useState, useCallback } from 'react';
import AppModal from '../components/common/AppModal';

export const ModalContext = createContext({
  showModal: () => {},
  hideModal: () => {},
});

export const ModalProvider = ({ children }) => {
  const [modalProps, setModalProps] = useState({
    visible: false,
    type: 'info',
    title: '',
    message: '',
    confirmText: 'OK',
    cancelText: 'Batal',
    onConfirm: () => {},
    onCancel: null,
    loading: false,
  });

  const hideModal = useCallback(() => {
    setModalProps((prev) => ({ ...prev, visible: false }));
  }, []);

  const showModal = useCallback((props) => {
    setModalProps({
      visible: true,
      type: props.type || 'info',
      title: props.title || '',
      message: props.message || '',
      confirmText: props.confirmText || 'OK',
      cancelText: props.cancelText || 'Batal',
      onConfirm: () => {
        if (props.onConfirm) {
          const result = props.onConfirm();
          // If onConfirm doesn't return anything or returns true/truthy, hide modal
          // If it returns false or a promise that resolves to false, keep modal (useful for loading states)
          if (result !== false) {
            hideModal();
          }
        } else {
          hideModal();
        }
      },
      onCancel: props.onCancel ? () => {
        props.onCancel();
        hideModal();
      } : null,
      loading: props.loading || false,
    });
  }, [hideModal]);

  return (
    <ModalContext.Provider value={{ showModal, hideModal }}>
      {children}
      <AppModal {...modalProps} />
    </ModalContext.Provider>
  );
};
