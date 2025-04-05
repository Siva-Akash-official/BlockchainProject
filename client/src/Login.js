import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import './Login.css';

const Login = ({ onLogin }) => {
    const history = useHistory();
    const [isCustomer, setIsCustomer] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isMetaMaskLoading, setIsMetaMaskLoading] = useState(false);
    const [loginError, setLoginError] = useState(null);
    const [customerAuthError, setCustomerAuthError] = useState(null);

    const handleMetaMaskLogin = async () => {
        setLoginError(null);
        setIsMetaMaskLoading(true);
        try {
            await onLogin();
            // No need to redirect here - App.js will handle the redirection
        } catch (error) {
            console.error('MetaMask login error:', error);
            setLoginError('Failed to connect with MetaMask. Please ensure MetaMask is installed and you have selected an account.');
        } finally {
            setIsMetaMaskLoading(false);
        }
    };

    const handleCustomerLogin = async (e) => {
        e.preventDefault();
        setCustomerAuthError(null);

        // Here you would typically call your authentication API
        try {
            // Simulate authentication - replace with actual API call
            // const response = await authenticateCustomer(email, password);
            // if (!response.success) throw new Error('Invalid credentials');

            // For demo purposes, we'll just check if fields are filled
            if (!email || !password) {
                throw new Error('Please enter both email and password');
            }

            history.push('/track');
        } catch (error) {
            console.error('Customer login error:', error);
            setCustomerAuthError(error.message || 'Login failed. Please try again.');
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h2>Supply Chain Login</h2>

                {!isCustomer ? (
                    <>
                        <div className="login-option">
                            <h3>Blockchain Participants</h3>
                            <p>Admin, Suppliers, Manufacturers, Distributors, Retailers</p>
                            <button
                                onClick={handleMetaMaskLogin}
                                className="metamask-btn"
                                disabled={isMetaMaskLoading}
                            >
                                {isMetaMaskLoading ? (
                                    <span>Connecting to MetaMask...</span>
                                ) : (
                                    <span>Login with MetaMask</span>
                                )}
                            </button>
                            {loginError && (
                                <p className="error-message">{loginError}</p>
                            )}
                        </div>

                        <div className="divider">
                            <span>OR</span>
                        </div>

                        <div className="login-option">
                            <h3>Customer Login</h3>
                            <button
                                onClick={() => setIsCustomer(true)}
                                className="customer-btn"
                            >
                                Customer Login
                            </button>
                        </div>
                    </>
                ) : (
                    <form onSubmit={handleCustomerLogin} className="customer-form">
                        <h3>Customer Login</h3>
                        {customerAuthError && (
                            <p className="error-message">{customerAuthError}</p>
                        )}
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
                        <button type="submit" className="login-btn">
                            Login
                        </button>
                        <p className="register-link">
                            Don't have an account?{' '}
                            <span onClick={() => history.push('/register')}>
                                Register here
                            </span>
                        </p>
                        <button
                            type="button"
                            onClick={() => {
                                setIsCustomer(false);
                                setCustomerAuthError(null);
                            }}
                            className="back-btn"
                        >
                            Back
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Login;