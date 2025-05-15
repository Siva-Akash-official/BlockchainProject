import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import './styles/Login.css';

const Login = ({ onLogin, setRole }) => {
  const history = useHistory();
  const [view, setView] = useState('default');
  const [selectedRole, setSelectedRole] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(null);
  const [isMetaMaskLoading, setIsMetaMaskLoading] = useState(false);

  const roleMap = {
    admin: 'admin',
    rawmaterialsupplier: 'rms',
    manufacturer: 'manufacturer',
    distributor: 'distributor',
    retailer: 'retailer',
  };

  const handleMetaMaskLogin = async () => {
    setLoginError(null);
    setIsMetaMaskLoading(true);
    try {
      const formattedRole = selectedRole.toLowerCase().replace(/\s+/g, '');
      const roleKey = roleMap[formattedRole];

      if (!roleKey) {
        setLoginError('Invalid role selected.');
        return;
      }

      if (setRole) {
        setRole(roleKey);
      }

      await onLogin(roleKey);
      history.push('/home');
    } catch (error) {
      console.error('MetaMask login error:', error);
      setLoginError('MetaMask connection failed. Please ensure MetaMask is installed.');
    } finally {
      setIsMetaMaskLoading(false);
    }
  };

  const handleParticipantSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setLoginError('Enter username and password.');
      return;
    }

    await handleMetaMaskLogin();
  };

  const handleCustomerLogin = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setLoginError('Enter email and password.');
      return;
    }
    history.push('/track');
  };

  const resetAll = () => {
    setEmail('');
    setPassword('');
    setLoginError(null);
    setIsMetaMaskLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Supply Chain Login Portal</h1>

        {view === 'default' && (
          <>
            <button onClick={() => setView('participantRoles')} className="login-btn">
              Participant Login
            </button>
            <button onClick={() => setView('customer')} className="login-btn">
              Customer Login
            </button>
          </>
        )}

        {view === 'participantRoles' && (
          <>
            <h3>Select Role to Login</h3>
            {['Admin', 'Raw Material Supplier', 'Manufacturer', 'Distributor', 'Retailer'].map(role => (
              <button
                key={role}
                className="role-btn"
                onClick={() => {
                  resetAll();
                  setSelectedRole(role);
                  setView('participantAuth');
                }}
              >
                {role}
              </button>
            ))}
            <button onClick={() => setView('default')} className="back-btn">Back</button>
          </>
        )}

        {view === 'participantAuth' && (
          <form onSubmit={handleParticipantSubmit} className="auth-form">
            <h3>{selectedRole} Login</h3>
            {loginError && <p className="error-message">{loginError}</p>}
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Username"
              required
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
            />
            <button type="submit" className="login-btn" disabled={isMetaMaskLoading}>
              {isMetaMaskLoading ? 'Connecting to MetaMask...' : 'Login with MetaMask'}
            </button>
            <button onClick={() => setView('participantRoles')} type="button" className="back-btn">Back</button>
          </form>
        )}

        {view === 'customer' && (
          <form onSubmit={handleCustomerLogin} className="auth-form">
            <h3>Customer Login</h3>
            {loginError && <p className="error-message">{loginError}</p>}
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
            />
            <button type="submit" className="login-btn">Login</button>
            <p className="register-link">
              Don't have an account?{' '}
              <span onClick={() => history.push('/register')}>Register here</span>
            </p>
            <button onClick={() => setView('default')} type="button" className="back-btn">Back</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
