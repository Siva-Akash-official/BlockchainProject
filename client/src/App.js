import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Switch, Route, Redirect, useHistory } from 'react-router-dom';
import Web3 from 'web3';
import SupplyChainABI from './artifacts/SupplyChain.json';
import Home from './Home';
import AssignRoles from './AssignRoles';
import AddMed from './AddMed';
import Supply from './Supply';
import Track from './Track';
import Login from './Login';
import Register from './Register';
import './App.css';

function App() {
  return (
    <Router>
      <AuthWrapper />
    </Router>
  );
}

const AuthWrapper = () => {
  const history = useHistory();
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState('');
  const [role, setRole] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        try {
          const web3Instance = new Web3(window.ethereum);
          setWeb3(web3Instance);

          const accounts = await web3Instance.eth.getAccounts();
          if (accounts.length > 0) {
            setAccount(accounts[0]);
          }

          const networkId = await web3Instance.eth.net.getId();
          const networkData = SupplyChainABI.networks[networkId];
          if (networkData) {
            const contractInstance = new web3Instance.eth.Contract(
              SupplyChainABI.abi,
              networkData.address
            );
            setContract(contractInstance);
            if (accounts.length > 0) {
              await checkRole(contractInstance, accounts[0]);
            }
          }
        } catch (error) {
          console.error('Initialization error:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    init();

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        handleLogout();
      } else if (accounts[0] !== account) {
        setAccount(accounts[0]);
        if (contract) checkRole(contract, accounts[0]);
      }
    };

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
    }

    return () => {
      if (window.ethereum?.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, []);

  const checkRole = async (contract, address) => {
    try {
      // 1. First check if admin (owner)
      const owner = await contract.methods.Owner().call();
      if (address.toLowerCase() === owner.toLowerCase()) {
        setRole('admin');
        history.push('/');
        return;
      }
  
      // 2. Check RMS (Raw Material Supplier)
      const rmsCount = await contract.methods.rmsCtr().call();
      for (let i = 1; i <= rmsCount; i++) {
        const rms = await contract.methods.RMS(i).call();
        if (rms.addr.toLowerCase() === address.toLowerCase()) {
          setRole('rms');
          history.push('/');
          return;
        }
      }
  
      // 3. Check Manufacturer
      const manCount = await contract.methods.manCtr().call();
      for (let i = 1; i <= manCount; i++) {
        const man = await contract.methods.MAN(i).call();
        if (man.addr.toLowerCase() === address.toLowerCase()) {
          setRole('manufacturer');
          history.push('/');
          return;
        }
      }
  
      // 4. Check Distributor
      const disCount = await contract.methods.disCtr().call();
      for (let i = 1; i <= disCount; i++) {
        const dis = await contract.methods.DIS(i).call();
        if (dis.addr.toLowerCase() === address.toLowerCase()) {
          setRole('distributor');
          history.push('/');
          return;
        }
      }
  
      // 5. Check Retailer
      const retCount = await contract.methods.retCtr().call();
      for (let i = 1; i <= retCount; i++) {
        const ret = await contract.methods.RET(i).call();
        if (ret.addr.toLowerCase() === address.toLowerCase()) {
          setRole('retailer');
          history.push('/');
          return;
        }
      }
  
      // No role found
      setRole('');
      history.push('/login');
    } catch (error) {
      console.error('Role check error:', error);
      setRole('');
      history.push('/login');
    }
  };

  const handleLogin = async () => {
    if (!web3) return;

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        if (contract) {
          await checkRole(contract, accounts[0]);
        }
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleLogout = () => {
    setAccount('');
    setRole('');
    history.push('/login');
  };

  if (isLoading) {
    return <div className="loading-screen">Loading application...</div>;
  }

  return (
    <Switch>
      <Route path="/login">
        {account ? <Redirect to="/" /> : <Login onLogin={handleLogin} />}
      </Route>
      <Route path="/register">
        {account ? <Redirect to="/" /> : <Register />}
      </Route>

      <Route exact path="/">
        {account ? <Home role={role} onLogout={handleLogout} /> : <Redirect to="/login" />}
      </Route>

      <Route path="/roles">
        {account && role === 'admin' ? <AssignRoles /> : <Redirect to="/login" />}
      </Route>

      <Route path="/addmed">
        {account && role === 'admin' ? <AddMed /> : <Redirect to="/login" />}
      </Route>

      <Route path="/supply">
        {account && ['admin', 'rms', 'manufacturer', 'distributor', 'retailer'].includes(role)
          ? <Supply role={role} />
          : <Redirect to="/login" />}
      </Route>

      <Route path="/track">
        <Track />
      </Route>

      <Route path="*">
        <Redirect to="/login" />
      </Route>
    </Switch>
  );
};

export default App;