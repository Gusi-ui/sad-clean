import React from 'react';

import Card from './Card';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
}) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
  };

  return (
    <div className='fixed inset-0 z-[9999] overflow-y-auto'>
      <div className='flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center'>
        {/* Background overlay */}
        <div
          className='fixed inset-0 bg-black bg-opacity-50 transition-opacity'
          onClick={onClose}
        />

        {/* Modal panel */}
        <div className='relative inline-block w-full text-left align-middle transition-all transform bg-white shadow-xl rounded-lg'>
          <div className={`${sizeClasses[size]} mx-auto`}>
            <Card className='p-0 shadow-none border-0'>
              {/* Header */}
              <div className='flex items-center justify-between p-6 border-b border-gray-200'>
                <h3 className='text-lg font-medium text-gray-900'>{title}</h3>
                <button
                  className='text-gray-400 hover:text-gray-600 transition-colors'
                  onClick={onClose}
                  type='button'
                >
                  <span className='text-2xl'>×</span>
                </button>
              </div>

              {/* Content */}
              <div className='p-6'>{children}</div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
