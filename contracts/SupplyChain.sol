// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

contract SupplyChain {
    address public Owner;

    constructor() {
        Owner = msg.sender;
    }

    modifier onlyByOwner() {
        require(msg.sender == Owner, "Only owner can call this function");
        _;
    }

    enum STAGE {
        Ordered,
        RawMaterialSupply,
        Manufacture,
        Distribution,
        Retail,
        Sold
    }

    // Grouped timestamp fields
    struct Timestamps {
        uint256 orderedAt;
        uint256 rmsSuppliedAt;
        uint256 manufacturedAt;
        uint256 distributedAt;
        uint256 retailedAt;
        uint256 soldAt;
    }

    // Grouped participant IDs
    struct ParticipantIds {
        uint256 RMSid;
        uint256 MANid;
        uint256 DISid;
        uint256 RETid;
    }

    struct Medicine {
        uint256 id;
        string name;
        string description;
        Timestamps times;
        ParticipantIds participants;
        address owner;
        STAGE stage;
    }

    uint256 public medicineCtr = 0;
    mapping(uint256 => Medicine) public MedicineStock;

    // Participant structs
    struct RawMaterialSupplier {
        address addr;
        uint256 id;
        string name;
        string place;
    }
    uint256 public rmsCtr = 0;
    mapping(uint256 => RawMaterialSupplier) public RMS;

    struct Manufacturer {
        address addr;
        uint256 id;
        string name;
        string place;
    }
    uint256 public manCtr = 0;
    mapping(uint256 => Manufacturer) public MAN;

    struct Distributor {
        address addr;
        uint256 id;
        string name;
        string place;
    }
    uint256 public disCtr = 0;
    mapping(uint256 => Distributor) public DIS;

    struct Retailer {
        address addr;
        uint256 id;
        string name;
        string place;
    }
    uint256 public retCtr = 0;
    mapping(uint256 => Retailer) public RET;

    // Medicine functions
    function addMedicine(
        string memory _name,
        string memory _description
    ) public {
        medicineCtr++;

        MedicineStock[medicineCtr] = Medicine({
            id: medicineCtr,
            name: _name,
            description: _description,
            times: Timestamps({
                orderedAt: block.timestamp,
                rmsSuppliedAt: 0,
                manufacturedAt: 0,
                distributedAt: 0,
                retailedAt: 0,
                soldAt: 0
            }),
            participants: ParticipantIds({
                RMSid: 0,
                MANid: 0,
                DISid: 0,
                RETid: 0
            }),
            owner: msg.sender,
            stage: STAGE.Ordered
        });

        emit MedicineAdded(medicineCtr, _name, _description);
    }

    function showStage(
        uint256 _medicineID
    ) public view returns (string memory) {
        require(
            _medicineID > 0 && _medicineID <= medicineCtr,
            "Invalid medicine ID"
        );

        if (MedicineStock[_medicineID].stage == STAGE.Ordered)
            return "Medicine Ordered";
        else if (MedicineStock[_medicineID].stage == STAGE.RawMaterialSupply)
            return "Raw Material Supply Stage";
        else if (MedicineStock[_medicineID].stage == STAGE.Manufacture)
            return "Manufacturing Stage";
        else if (MedicineStock[_medicineID].stage == STAGE.Distribution)
            return "Distribution Stage";
        else if (MedicineStock[_medicineID].stage == STAGE.Retail)
            return "Retail Stage";
        else if (MedicineStock[_medicineID].stage == STAGE.Sold)
            return "Medicine Sold";
        return "Unknown Stage";
    }

    // Participant management
    function addRMS(
        address _address,
        string memory _name,
        string memory _place
    ) public onlyByOwner {
        rmsCtr++;
        RMS[rmsCtr] = RawMaterialSupplier(_address, rmsCtr, _name, _place);
    }

    function addManufacturer(
        address _address,
        string memory _name,
        string memory _place
    ) public onlyByOwner {
        manCtr++;
        MAN[manCtr] = Manufacturer(_address, manCtr, _name, _place);
    }

    function addDistributor(
        address _address,
        string memory _name,
        string memory _place
    ) public onlyByOwner {
        disCtr++;
        DIS[disCtr] = Distributor(_address, disCtr, _name, _place);
    }

    function addRetailer(
        address _address,
        string memory _name,
        string memory _place
    ) public onlyByOwner {
        retCtr++;
        RET[retCtr] = Retailer(_address, retCtr, _name, _place);
    }

    // Supply chain functions
    function RMSsupply(uint256 _medicineID) public {
        require(
            _medicineID > 0 && _medicineID <= medicineCtr,
            "Invalid medicine ID"
        );
        uint256 _id = findRMS(msg.sender);
        require(_id > 0, "RMS not found");
        require(
            MedicineStock[_medicineID].stage == STAGE.Ordered,
            "Invalid stage transition"
        );

        MedicineStock[_medicineID].participants.RMSid = _id;
        MedicineStock[_medicineID].stage = STAGE.RawMaterialSupply;
        MedicineStock[_medicineID].times.rmsSuppliedAt = block.timestamp;
    }

    function Manufacturing(uint256 _medicineID) public {
        require(
            _medicineID > 0 && _medicineID <= medicineCtr,
            "Invalid medicine ID"
        );
        uint256 _id = findMAN(msg.sender);
        require(_id > 0, "Manufacturer not found");
        require(
            MedicineStock[_medicineID].stage == STAGE.RawMaterialSupply,
            "Invalid stage transition"
        );

        MedicineStock[_medicineID].participants.MANid = _id;
        MedicineStock[_medicineID].stage = STAGE.Manufacture;
        MedicineStock[_medicineID].times.manufacturedAt = block.timestamp;
    }

    function Distribute(uint256 _medicineID) public {
        require(
            _medicineID > 0 && _medicineID <= medicineCtr,
            "Invalid medicine ID"
        );
        uint256 _id = findDIS(msg.sender);
        require(_id > 0, "Distributor not found");
        require(
            MedicineStock[_medicineID].stage == STAGE.Manufacture,
            "Invalid stage transition"
        );

        MedicineStock[_medicineID].participants.DISid = _id;
        MedicineStock[_medicineID].stage = STAGE.Distribution;
        MedicineStock[_medicineID].times.distributedAt = block.timestamp;
    }

    function Retail(uint256 _medicineID) public {
        require(
            _medicineID > 0 && _medicineID <= medicineCtr,
            "Invalid medicine ID"
        );
        uint256 _id = findRET(msg.sender);
        require(_id > 0, "Retailer not found");
        require(
            MedicineStock[_medicineID].stage == STAGE.Distribution,
            "Invalid stage transition"
        );

        MedicineStock[_medicineID].participants.RETid = _id;
        MedicineStock[_medicineID].stage = STAGE.Retail;
        MedicineStock[_medicineID].times.retailedAt = block.timestamp;
    }

    function sold(uint256 _medicineID) public {
        require(
            _medicineID > 0 && _medicineID <= medicineCtr,
            "Invalid medicine ID"
        );
        uint256 _id = findRET(msg.sender);
        require(_id > 0, "Retailer not found");
        require(
            _id == MedicineStock[_medicineID].participants.RETid,
            "Only assigned retailer can mark as sold"
        );
        require(
            MedicineStock[_medicineID].stage == STAGE.Retail,
            "Invalid stage transition"
        );

        MedicineStock[_medicineID].stage = STAGE.Sold;
        MedicineStock[_medicineID].times.soldAt = block.timestamp;
    }

    // Helper functions
    function findRMS(address _address) private view returns (uint256) {
        for (uint256 i = 1; i <= rmsCtr; i++) {
            if (RMS[i].addr == _address) return i;
        }
        return 0;
    }

    function findMAN(address _address) private view returns (uint256) {
        for (uint256 i = 1; i <= manCtr; i++) {
            if (MAN[i].addr == _address) return i;
        }
        return 0;
    }

    function findDIS(address _address) private view returns (uint256) {
        for (uint256 i = 1; i <= disCtr; i++) {
            if (DIS[i].addr == _address) return i;
        }
        return 0;
    }

    function findRET(address _address) private view returns (uint256) {
        for (uint256 i = 1; i <= retCtr; i++) {
            if (RET[i].addr == _address) return i;
        }
        return 0;
    }

    event MedicineAdded(uint256 id, string name, string description);
}
