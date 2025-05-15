import React, { useState, useEffect } from 'react';
import { useHistory } from "react-router-dom";
import Web3 from "web3";
import SupplyChainABI from "./artifacts/SupplyChain.json";
import { QRCodeCanvas } from 'qrcode.react';
import { formatTimestamp } from './utils/timestamp';
import './styles/Track.css';

function Track() {
    const history = useHistory();
    const [currentAccount, setCurrentAccount] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [supplyChain, setSupplyChain] = useState(null);
    const [medicines, setMedicines] = useState({});
    const [medicineStages, setMedicineStages] = useState({});
    const [rmsSuppliers, setRmsSuppliers] = useState({});
    const [manufacturers, setManufacturers] = useState({});
    const [distributors, setDistributors] = useState({});
    const [retailers, setRetailers] = useState({});
    const [medicineId, setMedicineId] = useState("");
    const [trackedMedicine, setTrackedMedicine] = useState(null);

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
            const web3 = window.web3;
            const accounts = await web3.eth.getAccounts();
            setCurrentAccount(accounts[0]);

            const networkId = await web3.eth.net.getId();
            const networkData = SupplyChainABI.networks[networkId];

            if (networkData) {
                const contract = new web3.eth.Contract(SupplyChainABI.abi, networkData.address);
                setSupplyChain(contract);

                // Load medicines
                const medCount = await contract.methods.medicineCtr().call();
                const medData = {};
                const stages = {};

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

                // Load all participants
                const rmsCount = await contract.methods.rmsCtr().call();
                const rmsData = {};
                for (let i = 1; i <= rmsCount; i++) {
                    rmsData[i] = await contract.methods.RMS(i).call();
                }

                const manCount = await contract.methods.manCtr().call();
                const manData = {};
                for (let i = 1; i <= manCount; i++) {
                    manData[i] = await contract.methods.MAN(i).call();
                }

                const disCount = await contract.methods.disCtr().call();
                const disData = {};
                for (let i = 1; i <= disCount; i++) {
                    disData[i] = await contract.methods.DIS(i).call();
                }

                const retCount = await contract.methods.retCtr().call();
                const retData = {};
                for (let i = 1; i <= retCount; i++) {
                    retData[i] = await contract.methods.RET(i).call();
                }

                setMedicines(medData);
                setMedicineStages(stages);
                setRmsSuppliers(rmsData);
                setManufacturers(manData);
                setDistributors(disData);
                setRetailers(retData);
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

    const handleTrackMedicine = () => {
        if (!medicineId || !medicines[medicineId]) {
            alert("Invalid Medicine ID");
            return;
        }
        setTrackedMedicine(medicineId);
    };

    useEffect(() => {
        loadWeb3();
        loadBlockchainData();
    }, []);

    if (isLoading) {
        return <div className="loader">Loading...</div>;
    }

    return (
        <div className="track-container">
            <div className="header">
                <span>Account: {currentAccount}</span>
                <button onClick={() => history.push('/')} className="home-btn">Home</button>
            </div>

            <h2>Track Medicine</h2>

            <div className="track-form">
                <input
                    type="text"
                    value={medicineId}
                    onChange={(e) => setMedicineId(e.target.value)}
                    placeholder="Enter Medicine ID"
                />
                <button onClick={handleTrackMedicine}>Track</button>
            </div>

            {trackedMedicine && medicines[trackedMedicine] && (
                <div className="track-details">
                    <h3>Medicine #{trackedMedicine}</h3>

                    <div className="medicine-info">
                        <p><strong>Name:</strong> {medicines[trackedMedicine].name}</p>
                        <p><strong>Description:</strong> {medicines[trackedMedicine].description}</p>
                        <p><strong>Current Stage:</strong> {medicineStages[trackedMedicine]}</p>
                    </div>

                    <div className="participants-info">
                        <h4>Participants</h4>
                        <div className="participant-grid">
                            {medicines[trackedMedicine].participants.RMSid > 0 && (
                                <div className="participant-card">
                                    <h5>Raw Material Supplier</h5>
                                    <p>Name: {rmsSuppliers[medicines[trackedMedicine].participants.RMSid]?.name}</p>
                                    <p>Location: {rmsSuppliers[medicines[trackedMedicine].participants.RMSid]?.place}</p>
                                </div>
                            )}
                            {medicines[trackedMedicine].participants.MANid > 0 && (
                                <div className="participant-card">
                                    <h5>Manufacturer</h5>
                                    <p>Name: {manufacturers[medicines[trackedMedicine].participants.MANid]?.name}</p>
                                    <p>Location: {manufacturers[medicines[trackedMedicine].participants.MANid]?.place}</p>
                                </div>
                            )}
                            {medicines[trackedMedicine].participants.DISid > 0 && (
                                <div className="participant-card">
                                    <h5>Distributor</h5>
                                    <p>Name: {distributors[medicines[trackedMedicine].participants.DISid]?.name}</p>
                                    <p>Location: {distributors[medicines[trackedMedicine].participants.DISid]?.place}</p>
                                </div>
                            )}
                            {medicines[trackedMedicine].participants.RETid > 0 && (
                                <div className="participant-card">
                                    <h5>Retailer</h5>
                                    <p>Name: {retailers[medicines[trackedMedicine].participants.RETid]?.name}</p>
                                    <p>Location: {retailers[medicines[trackedMedicine].participants.RETid]?.place}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="timeline">
                        <h4>Supply Chain Timeline</h4>
                        <ul className="timeline-steps">
                            <li className={medicines[trackedMedicine].times.orderedAt > 0 ? "completed" : "pending"}>
                                <span className="step-icon">1</span>
                                <div className="step-content">
                                    <p className="step-title">Ordered</p>
                                    <p className="step-time">
                                        {medicines[trackedMedicine].times.orderedAt > 0
                                            ? formatTimestamp(medicines[trackedMedicine].times.orderedAt)
                                            : "Not yet ordered"}
                                    </p>
                                </div>
                            </li>

                            <li className={medicines[trackedMedicine].times.rmsSuppliedAt > 0 ? "completed" : "pending"}>
                                <span className="step-icon">2</span>
                                <div className="step-content">
                                    <p className="step-title">Raw Materials Supplied</p>
                                    <p className="step-time">
                                        {medicines[trackedMedicine].times.rmsSuppliedAt > 0
                                            ? formatTimestamp(medicines[trackedMedicine].times.rmsSuppliedAt)
                                            : "Pending materials supply"}
                                    </p>
                                </div>
                            </li>

                            <li className={medicines[trackedMedicine].times.manufacturedAt > 0 ? "completed" : "pending"}>
                                <span className="step-icon">3</span>
                                <div className="step-content">
                                    <p className="step-title">Manufactured</p>
                                    <p className="step-time">
                                        {medicines[trackedMedicine].times.manufacturedAt > 0
                                            ? formatTimestamp(medicines[trackedMedicine].times.manufacturedAt)
                                            : "Pending manufacturing"}
                                    </p>
                                </div>
                            </li>

                            <li className={medicines[trackedMedicine].times.distributedAt > 0 ? "completed" : "pending"}>
                                <span className="step-icon">4</span>
                                <div className="step-content">
                                    <p className="step-title">Distributed</p>
                                    <p className="step-time">
                                        {medicines[trackedMedicine].times.distributedAt > 0
                                            ? formatTimestamp(medicines[trackedMedicine].times.distributedAt)
                                            : "Pending distribution"}
                                    </p>
                                </div>
                            </li>

                            <li className={medicines[trackedMedicine].times.retailedAt > 0 ? "completed" : "pending"}>
                                <span className="step-icon">5</span>
                                <div className="step-content">
                                    <p className="step-title">Retailed</p>
                                    <p className="step-time">
                                        {medicines[trackedMedicine].times.retailedAt > 0
                                            ? formatTimestamp(medicines[trackedMedicine].times.retailedAt)
                                            : "Pending retail"}
                                    </p>
                                </div>
                            </li>

                            <li className={medicines[trackedMedicine].times.soldAt > 0 ? "completed" : "pending"}>
                                <span className="step-icon">6</span>
                                <div className="step-content">
                                    <p className="step-title">Sold</p>
                                    <p className="step-time">
                                        {medicines[trackedMedicine].times.soldAt > 0
                                            ? formatTimestamp(medicines[trackedMedicine].times.soldAt)
                                            : "Not yet sold"}
                                    </p>
                                </div>
                            </li>
                        </ul>
                    </div>

                    <div className="qr-code">
                        <QRCodeCanvas value={JSON.stringify({
                            id: trackedMedicine,
                            name: medicines[trackedMedicine].name,
                            description: medicines[trackedMedicine].description,
                            currentStage: medicineStages[trackedMedicine],
                            timestamps: medicines[trackedMedicine].times,
                            participants: {
                                supplier: rmsSuppliers[medicines[trackedMedicine].participants.RMSid],
                                manufacturer: manufacturers[medicines[trackedMedicine].participants.MANid],
                                distributor: distributors[medicines[trackedMedicine].participants.DISid],
                                retailer: retailers[medicines[trackedMedicine].participants.RETid]
                            }
                        })} size={200} />
                    </div>
                </div>
            )}

            <div className="all-medicines">
                <h3>All Medicines</h3>
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Description</th>
                            <th>Current Stage</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.keys(medicines).map(id => (
                            <tr key={id} onClick={() => setMedicineId(id)} style={{ cursor: 'pointer' }}>
                                <td>{medicines[id].id}</td>
                                <td>{medicines[id].name}</td>
                                <td>{medicines[id].description}</td>
                                <td>{medicineStages[id]}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Track;