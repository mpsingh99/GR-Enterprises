import React from 'react';
import { CustomerAuthModal } from './CustomerAuthModal';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = (props) => {
  return <CustomerAuthModal {...props} initialTab="signup" />;
};
