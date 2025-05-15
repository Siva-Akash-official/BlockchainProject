import React from 'react';
import { useHistory } from 'react-router-dom';
import './styles/Home.css';

const Home = ({ role, onLogout }) => {
    const history = useHistory();

    const redirectTo = (path) => {
        history.push(path);
    };

    return (
        <div className="home-container">
            <div className="header">
                <span>Logged in as: {role}</span>
                <button onClick={onLogout} className="logout-btn">Logout</button>
            </div>

            <div className="content">
                <h2>Supply Chain Manager</h2>
                <div className="button-group">
                    {role === 'admin' && (
                        <>
                            <button onClick={() => redirectTo('/roles')} className="action-btn">
                                Register Roles
                            </button>
                            <button onClick={() => redirectTo('/addmed')} className="action-btn">
                                Order Materials
                            </button>
                        </>
                    )}
                    {/* Show Supply button for all supply chain roles */}
                    {(role === 'admin' || role === 'rms' || role === 'manufacturer' || role === 'distributor' || role === 'retailer') && (
                        <button onClick={() => redirectTo('/supply')} className="action-btn">
                            Supply Materials
                        </button>
                    )}
                    <button onClick={() => redirectTo('/track')} className="action-btn">
                        Track Materials
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Home;