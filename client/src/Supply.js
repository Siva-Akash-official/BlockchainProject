import React, { useState, useEffect } from 'react';
import { useHistory } from "react-router-dom";
import Web3 from "web3";
import SupplyChainABI from "./artifacts/SupplyChain.json";
import { formatTimestamp } from './utils/timestamp';
import './styles/Supply.css';

function Supply() {
    const history = useHistory();
    const [currentAccount, setCurrentAccount] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [supplyChain, setSupplyChain] = useState(null);
    const [medicines, setMedicines] = useState({});
    const [medicineStages, setMedicineStages] = useState({});
    const [timestamps, setTimestamps] = useState({});
    const [medicineId, setMedicineId] = useState("");
    const [selectedMedicine, setSelectedMedicine] = useState(null);

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
                const contract = new web3.eth.Contract(SupplyChainABI.abi, networkData.address);
                setSupplyChain(contract);

                const medCount = await contract.methods.medicineCtr().call();
                const medData = {};
                const stages = {};
                const timestampData = {};

                // In loadBlockchainData function, update the medicine data processing:
                for (let i = 1; i <= medCount; i++) {
                    const medicine = await contract.methods.MedicineStock(i).call();
                    medData[i] = {
                        ...medicine,
                        id: Number(medicine.id),
                        times: {
                            orderedAt: Number(medicine.times.orderedAt),
                            rmsSuppliedAt: Number(medicine.times.rmsSuppliedAt),
                            manufacturedAt: Number(medicine.times.manufacturedAt),
                            distributedAt: Number(medicine.times.distributedAt),
                            retailedAt: Number(medicine.times.retailedAt),
                            soldAt: Number(medicine.times.soldAt)
                        },
                        participants: {
                            RMSid: Number(medicine.participants.RMSid),
                            MANid: Number(medicine.participants.MANid),
                            DISid: Number(medicine.participants.DISid),
                            RETid: Number(medicine.participants.RETid)
                        }
                    };
                    stages[i] = await contract.methods.showStage(i).call();
                }

                setMedicines(medData);
                setMedicineStages(stages);
                setTimestamps(timestampData);
            } else {
                alert('Contract not deployed to current network');
            }
        } catch (error) {
            console.error("Error loading blockchain data:", error);
            alert("Failed to load data. See console for details.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleStageUpdate = async (methodName) => {
        if (!medicineId) {
            alert("Please enter a Medicine ID");
            return;
        }

        setIsLoading(true);
        try {
            const receipt = await supplyChain.methods[methodName](medicineId)
                .send({ from: currentAccount });

            if (receipt.status) {
                await loadBlockchainData();
                alert(`Medicine ${medicineId} updated successfully!`);
            }
        } catch (err) {
            alert(`Error: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadBlockchainData();
    }, []);

    if (isLoading) {
        return <div className="loader">Loading...</div>;
    }

    return (
        <div className="supply-container">
            <div className="header">
                <span>Account: {currentAccount}</span>
                <button onClick={() => history.push('/')} className="home-btn">Home</button>
            </div>

            <h2>Medicine Supply Chain</h2>
            <p>Order → Materials → Manufacture → Distribute → Retail → Sold</p>

            <table className="medicine-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Stage</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.keys(medicines).map(id => (
                        <tr key={id}>
                            <td>{medicines[id].id}</td>
                            <td>{medicines[id].name}</td>
                            <td>{medicineStages[id]}</td>
                            <td>
                                <button
                                    onClick={() => setSelectedMedicine(id)}
                                    className="view-btn"
                                >
                                    View Timeline
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="action-form">
                <h3>Update Medicine Stage</h3>
                <input
                    type="text"
                    value={medicineId}
                    onChange={(e) => setMedicineId(e.target.value)}
                    placeholder="Medicine ID"
                />
                <div className="action-buttons">
                    <button onClick={() => handleStageUpdate('RMSsupply')}>
                        Mark as Materials Supplied
                    </button>
                    <button onClick={() => handleStageUpdate('Manufacturing')}>
                        Mark as Manufactured
                    </button>
                    <button onClick={() => handleStageUpdate('Distribute')}>
                        Mark as Distributed
                    </button>
                    <button onClick={() => handleStageUpdate('Retail')}>
                        Mark as Retailed
                    </button>
                    <button onClick={() => handleStageUpdate('sold')}>
                        Mark as Sold
                    </button>
                </div>
            </div>

            {selectedMedicine && (
                <div className="timeline-modal">
                    <div className="modal-content">
                        <h3>Medicine #{selectedMedicine} Timeline</h3>
                        <ul>
                            <li>📅 Ordered: {formatTimestamp(medicines[selectedMedicine]?.times.orderedAt)}</li>
                            <li>🛒 Materials Supplied: {formatTimestamp(medicines[selectedMedicine]?.times.rmsSuppliedAt)}</li>
                            <li>🏭 Manufactured: {formatTimestamp(medicines[selectedMedicine]?.times.manufacturedAt)}</li>
                            <li>🚚 Distributed: {formatTimestamp(medicines[selectedMedicine]?.times.distributedAt)}</li>
                            <li>🏪 Retailed: {formatTimestamp(medicines[selectedMedicine]?.times.retailedAt)}</li>
                            <li>💰 Sold: {formatTimestamp(medicines[selectedMedicine]?.times.soldAt)}</li>
                        </ul>
                        <button onClick={() => setSelectedMedicine(null)}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Supply;