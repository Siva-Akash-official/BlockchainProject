import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import './Login.css';

const Login = ({ onLogin }) => {
    const history = useHistory();
    const [isCustomer, setIsCustomer] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleCustomerLogin = (e) => {
        e.preventDefault();
        history.push('/track');
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
                                onClick={onLogin}
                                className="metamask-btn"
                            >
                                Login with MetaMask
                            </button>
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
                            Don't have an account? <span onClick={() => history.push('/register')}>Register here</span>
                        </p>
                        <button
                            onClick={() => setIsCustomer(false)}
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