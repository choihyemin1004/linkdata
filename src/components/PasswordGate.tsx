import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { KeyRound, AlertCircle, Loader2 } from 'lucide-react';

const ADMIN_EMAIL = 'planhomekorea@gmail.com';

export const PasswordGate: React.FC = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { authenticate } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const isValid = await authenticate(ADMIN_EMAIL, password);
      if (!isValid) {
        setError('Invalid credentials');
        setPassword('');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-blue-100 rounded-full">
            <KeyRound className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-center mb-2">Admin Access</h1>
        <p className="text-center text-gray-600 mb-6">Please enter your admin password to continue</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={ADMIN_EMAIL}
              disabled
              className="w-full px-3 py-2 border rounded-lg bg-gray-50"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter admin password"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-500 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Authenticating...
              </>
            ) : (
              'Access Dashboard'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};