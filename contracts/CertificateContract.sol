// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CertificateContract {
    address public owner;

    struct Certificate {
        address recipient;
        string encryptedCID;
        bytes32 dataHash;
        bytes signature;
        bool isIssued;
        bool isRevoked;
    }

    mapping(address => Certificate) public certificates;
    address[] public recipients;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(
            msg.sender == owner,
            "Only the University can call this function"
        );
        _;
    }

    function issueCertificate(
        address recipient,
        string memory encryptedCID,
        bytes32 dataHash,
        bytes memory signature
    ) public onlyOwner {
        require(recipient != address(0), "Invalid recipient address");
        recipients.push(recipient);
        //bytes32 certificateHash = keccak256(abi.encodePacked(recipient));
        require(
            !certificates[recipient].isIssued ||
                certificates[recipient].isRevoked,
            "Certificate already issued or revoked for this recipient"
        );
        certificates[recipient] = Certificate(
            recipient,
            encryptedCID,
            dataHash,
            signature,
            true,
            false
        );
    }

    function verifyCertificate(address recipient) public view returns (bool) {
        require(recipient != address(0), "Invalid recipient address");
        //bytes32 certificateHash = keccak256(abi.encodePacked(recipient));
        require(
            certificates[recipient].recipient == recipient,
            "No certificate found for this recipient"
        );
        return
            certificates[recipient].isIssued &&
            !certificates[recipient].isRevoked;
    }

    function revokeCertificate(address recipient) public onlyOwner {
        require(
            msg.sender == owner,
            "Only the University can revoke certificates"
        );
        require(
            certificates[recipient].isIssued,
            "Certificate not issued or already revoked"
        );
        certificates[recipient].isRevoked = true;
    }

    function viewCertificate(
        address studentAddress
    ) public view returns (string memory encryptedCID, bytes32 dataHash, bytes memory signature) {
        require(
            certificates[studentAddress].recipient == studentAddress,
            "No certificate found for this student"
        );

        require(
            !certificates[studentAddress].isRevoked,
            "This certificate has been revoked"
        );
        return (
            certificates[studentAddress].encryptedCID,
            certificates[studentAddress].dataHash,
            certificates[studentAddress].signature
        );
    }

    function updateCertificate(
        address recipient,
        string memory encryptedCID,
        bytes32 dataHash,
        bytes memory signature
    ) public  {
        require(recipient != address(0), "Invalid recipient address");
        //bytes32 certificateHash = keccak256(abi.encodePacked(recipient));
        require(
            certificates[recipient].isIssued &&
                !certificates[recipient].isRevoked,
            "Certificate not issued or already revoked for this recipient"
        );

        Certificate storage certificateToUpdate = certificates[recipient];

        certificateToUpdate.encryptedCID = encryptedCID;
        certificateToUpdate.dataHash = dataHash;
        certificateToUpdate.signature = signature;
    }

}