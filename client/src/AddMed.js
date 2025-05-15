import React, { useState, useEffect } from 'react';
import { useHistory } from "react-router-dom";
import Web3 from "web3";
import SupplyChainABI from "./artifacts/SupplyChain.json";
import { formatTimestamp } from './utils/timestamp';
import './styles/AddMed.css';

function AddMed() {
    const history = useHistory();
    const [currentAccount, setCurrentAccount] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [supplyChain, setSupplyChain] = useState(null);
    const [medicines, setMedicines] = useState({});
    const [medicineName, setMedicineName] = useState("");
    const [medicineDescription, setMedicineDescription] = useState("");

    const loadWeb3 = async () => {
        if (window.ethereum) {
            window.web3 = new Web3(window.ethereum);
            await window.ethereum.enable();
        } else {
            alert("Please install MetaMask!");
        }
    };

    const loadBlockchainData = async () => {
        setIsLoading(true);
        try {
            await loadWeb3();
            const web3 = window.web3;
            const accounts = await web3.eth.getAccounts();
            setCurrentAccount(accounts[0]);

            const networkId = await web3.eth.net.getId();
            const networkData = SupplyChainABI.networks[networkId];

            if (networkData) {
                const contract = new web3.eth.Contract(
                    SupplyChainABI.abi,
                    networkData.address
                );
                setSupplyChain(contract);

                const medCount = await contract.methods.medicineCtr().call();
                const medData = {};

                for (let i = 1; i <= medCount; i++) {
                    const medicine = await contract.methods.MedicineStock(i).call();
                    medData[i] = {
                        ...medicine,
                        id: Number(medicine.id),
                        orderedAt: Number(medicine.times.orderedAt)
                    };
                }

                setMedicines(medData);
            }
        } catch (error) {
            console.error("Error loading data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddMedicine = async (e) => {
        e.preventDefault();
        if (!medicineName.trim() || !medicineDescription.trim()) {
            alert("Name and description cannot be empty!");
            return;
        }

        setIsLoading(true);
        try {
            const receipt = await supplyChain.methods
                .addMedicine(medicineName, medicineDescription)
                .send({ from: currentAccount });

            if (receipt.status) {
                const newId = await supplyChain.methods.medicineCtr().call();
                const newMedicine = await supplyChain.methods.MedicineStock(newId).call();

                setMedicines(prev => ({
                    ...prev,
                    [newId]: {
                        ...newMedicine,
                        id: Number(newMedicine.id),
                        orderedAt: Number(newMedicine.times.orderedAt)
                    }
                }));

                setMedicineName("");
                setMedicineDescription("");
                alert("Medicine added successfully!");
            }
        } catch (err) {
            console.error("Order failed:", err);
            alert(`Error: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadBlockchainData();
    }, []);

    if (isLoading) {
        return <div className="loader">Loading medicines...</div>;
    }

    return (
        <div className="addmed-container">
            <div className="header">
                <span>Account: {currentAccount}</span>
                <button onClick={() => history.push('/')}>Home</button>
            </div>

            <h2>Order New Medicine</h2>
            <form onSubmit={handleAddMedicine}>
                <input
                    type="text"
                    value={medicineName}
                    onChange={(e) => setMedicineName(e.target.value)}
                    placeholder="Medicine Name"
                    required
                />
                <input
                    type="text"
                    value={medicineDescription}
                    onChange={(e) => setMedicineDescription(e.target.value)}
                    placeholder="Description"
                    required
                />
                <button type="submit" disabled={isLoading}>
                    {isLoading ? "Ordering..." : "Place Order"}
                </button>
            </form>

            <div className="medicine-list">
                <h3>Recent Orders</h3>
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Description</th>
                            <th>Order Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.keys(medicines)
                            .sort((a, b) => a - b)
                            .map(id => (
                                <tr key={id}>
                                    <td>{medicines[id].id}</td>
                                    <td>{medicines[id].name}</td>
                                    <td>{medicines[id].description}</td>
                                    <td>{formatTimestamp(medicines[id].orderedAt)}</td>
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default AddMed;