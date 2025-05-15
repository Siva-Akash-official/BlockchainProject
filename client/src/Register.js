import React, { useState } from 'react';
import { useHistory } from "react-router-dom";
import './styles/Register.css';

function Register() {
    const history = useHistory();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: ""
    });
    const [error, setError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Basic validation
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords don't match");
            return;
        }

        // Here you would typically send data to backend
        // For demo, we'll just proceed to login
        alert("Registration successful! Please login.");
        history.push('/login');
    };

    return (
        <div className="register-container">
            <div className="register-box">
                <h2>Customer Registration</h2>
                {error && <div className="error-message">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Full Name"
                        required
                    />
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Email"
                        required
                    />
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Password"
                        required
                    />
                    <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirm Password"
                        required
                    />
                    <button type="submit" className="register-btn">
                        Register
                    </button>
                </form>
                <p className="login-link">
                    Already have an account? <span onClick={() => history.push('/login')}>Login here</span>
                </p>
            </div>
        </div>
    );
}

export default Register;