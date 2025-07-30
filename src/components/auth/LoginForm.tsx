'use client';

import React, { useState } from 'react';

import { Button, Card, Input } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToSignUp?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onSwitchToSignUp,
}) => {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error: signInError } = await signIn(email, password);

    if (signInError !== null) {
      setError(signInError.message);
    } else {
      onSuccess?.();
    }

    setLoading(false);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  return (
    <Card className='max-w-md w-full'>
      <div className='p-6'>
        <div className='text-center mb-6'>
          <div className='w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4'>
            <span className='text-white font-bold text-lg'>SAD</span>
          </div>
          <h2 className='text-2xl font-bold text-gray-900'>Iniciar Sesión</h2>
          <p className='text-gray-600 mt-2'>Accede a tu cuenta de SAD LAS</p>
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

          <Input
            label='Email'
            placeholder='tu@email.com'
            type='email'
            value={email}
            onChange={handleEmailChange}
            required
          />

          <Input
            label='Contraseña'
            placeholder='••••••••'
            type='password'
            value={password}
            onChange={handlePasswordChange}
            required
          />

          <Button className='w-full' loading={loading} type='submit'>
            Iniciar Sesión
          </Button>
        </form>

        <div className='mt-6 text-center'>
          <button
            className='text-sm text-blue-600 hover:text-blue-800'
            onClick={onSwitchToSignUp}
            type='button'
          >
            ¿No tienes cuenta? Regístrate
          </button>
        </div>
      </div>
    </Card>
  );
};

export default LoginForm;
