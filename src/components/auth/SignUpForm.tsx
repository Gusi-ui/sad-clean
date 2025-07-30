'use client';

import React, { useState } from 'react';

import { Button, Card, Input } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';

interface SignUpFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

const SignUpForm: React.FC<SignUpFormProps> = ({
  onSuccess,
  onSwitchToLogin,
}) => {
  const { signUp } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validaciones
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setLoading(false);
      return;
    }

    const userData = {
      first_name: formData.firstName,
      last_name: formData.lastName,
      full_name: `${formData.firstName} ${formData.lastName}`,
    };

    const { error: signUpError } = await signUp(
      formData.email,
      formData.password,
      userData
    );

    if (signUpError !== null) {
      setError(signUpError.message);
    } else {
      onSuccess?.();
    }

    setLoading(false);
  };

  const handleFieldChange =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      handleChange(field, e.target.value);
    };

  return (
    <Card className='max-w-md w-full'>
      <div className='p-6'>
        <div className='text-center mb-6'>
          <div className='w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4'>
            <span className='text-white font-bold text-lg'>SAD</span>
          </div>
          <h2 className='text-2xl font-bold text-gray-900'>Crear Cuenta</h2>
          <p className='text-gray-600 mt-2'>Únete a SAD LAS</p>
        </div>

        <form
          onSubmit={(e) => {
            // eslint-disable-next-line no-void
            void handleSubmit(e);
          }}
          className='space-y-4'
        >
          {error !== '' && (
            <div className='bg-red-50 border border-red-200 rounded-md p-3'>
              <p className='text-sm text-red-600'>{error}</p>
            </div>
          )}

          <div className='grid grid-cols-2 gap-4'>
            <Input
              label='Nombre'
              placeholder='Juan'
              value={formData.firstName}
              onChange={handleFieldChange('firstName')}
              required
            />
            <Input
              label='Apellido'
              placeholder='Pérez'
              value={formData.lastName}
              onChange={handleFieldChange('lastName')}
              required
            />
          </div>

          <Input
            label='Email'
            placeholder='tu@email.com'
            type='email'
            value={formData.email}
            onChange={handleFieldChange('email')}
            required
          />

          <Input
            label='Contraseña'
            placeholder='••••••••'
            type='password'
            value={formData.password}
            onChange={handleFieldChange('password')}
            required
          />

          <Input
            label='Confirmar Contraseña'
            placeholder='••••••••'
            type='password'
            value={formData.confirmPassword}
            onChange={handleFieldChange('confirmPassword')}
            required
          />

          <Button className='w-full' loading={loading} type='submit'>
            Crear Cuenta
          </Button>
        </form>

        <div className='mt-6 text-center'>
          <button
            className='text-sm text-blue-600 hover:text-blue-800'
            onClick={onSwitchToLogin}
            type='button'
          >
            ¿Ya tienes cuenta? Inicia sesión
          </button>
        </div>
      </div>
    </Card>
  );
};

export default SignUpForm;
