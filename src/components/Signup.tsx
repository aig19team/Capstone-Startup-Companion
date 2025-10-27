import React, { useState } from 'react';
import { Eye, EyeOff, Info } from 'lucide-react';
import { auth } from '../lib/auth';

interface SignupProps {
  onNavigate?: (page: string) => void;
}

const Signup = ({ onNavigate }: SignupProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const validatePassword = (password: string) => {
    const minLength = 8;
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    
    if (password.length < minLength) {
      return 'Password must be at least 8 characters long';
    }
    if (!hasLetter) {
      return 'Password must contain at least one letter';
    }
    if (!hasNumber) {
      return 'Password must contain at least one number';
    }
    if (!hasSymbol) {
      return 'Password must contain at least one symbol';
    }
    return '';
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear messages when user starts typing
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate password
    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      setError(passwordError);
      return;
    }
    
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const result = await auth.signUp(formData.email, formData.password);
      
      if (result.error) {
        setError(result.error);
        return;
      }
      
      if (result.user) {
        setSuccess('Account created successfully! Logging you in...');

        // Auto-login after successful signup
        const loginResult = await auth.signIn(formData.email, formData.password);

        if (loginResult.user) {
          // Navigate directly to chat interface
          setTimeout(() => {
            if (onNavigate) {
              onNavigate('chat');
            }
          }, 1500);
        } else {
          // If auto-login fails, redirect to login page
          setTimeout(() => {
            if (onNavigate) {
              onNavigate('login');
            }
          }, 2000);
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginClick = () => {
    if (onNavigate) {
      onNavigate('login');
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-2">
            Create Your Account
          </h2>
          <p className="text-gray-400 text-lg">
            Your startup journey begins here!
          </p>
        </div>

        {/* Signup Form */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-700 p-8 shadow-2xl">
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-900/50 border border-red-500/50 rounded-lg">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}
          
          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-900/50 border border-green-500/50 rounded-lg">
              <p className="text-green-300 text-sm">{success}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-black/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter your email address"
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password *
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 pr-12 bg-black/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Create a secure password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              
              {/* Password Tooltip */}
              <div className="relative mt-2">
                <button
                  type="button"
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                  className="flex items-center space-x-1 text-gray-400 hover:text-gray-300 transition-colors duration-200"
                >
                  <Info className="h-4 w-4" />
                  <span className="text-sm">Password requirements</span>
                </button>
                
                {showTooltip && (
                  <div className="absolute top-full left-0 mt-2 p-3 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-10 w-full">
                    <p className="text-sm text-gray-300">
                      8+ characters with at least one letter, number, and symbol
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 hover:scale-105 shadow-xl"
            >
              {isLoading ? 'Creating Account...' : 'Sign Up & Get Started'}
            </button>
          </form>

          {/* Additional Info */}
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Already have an account?{' '}
              <button 
                onClick={handleLoginClick}
                className="text-blue-500 hover:text-blue-400 font-medium transition-colors duration-200"
              >
                Sign in here
              </button>
            </p>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-6 text-gray-500 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Personalized</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Reliable</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Beginner Friendly</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;