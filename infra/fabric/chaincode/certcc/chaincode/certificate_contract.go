// Package chaincode implements the academic certificate smart contract for
// Hyperledger Fabric, replacing the old Solidity CertificateContract.sol.
package chaincode

import (
	"encoding/json"
	"errors"
	"fmt"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

// universityMSPID is the only MSP allowed to issue, update, or revoke
// certificates. In the 2-org network (see infra/fabric), Org1 plays the role
// of the University (issuer) and Org2 plays the role of the Verifier
// (read-only). This is the direct fix for the old contract's missing
// onlyOwner check on updateCertificate.
const universityMSPID = "Org1MSP"

// Certificate mirrors the old on-chain struct, minus the ECDSA signature
// field: Fabric already guarantees a write came from an endorsed,
// authenticated identity, so there is nothing left for a signer-recovery
// check to add.
type Certificate struct {
	Recipient     string `json:"recipient"`
	EncryptedData string `json:"encryptedData"`
	DataHash      string `json:"dataHash"`
	IsIssued      bool   `json:"isIssued"`
	IsRevoked     bool   `json:"isRevoked"`
}

// CertificateContract implements the 5 certificate operations.
type CertificateContract struct {
	contractapi.Contract
}

var errCertificateNotFound = errors.New("certificate not found")

// IssueCertificate creates a new certificate for recipient. Only callable by
// the University org, and only if no active (issued, non-revoked)
// certificate already exists for this recipient.
func (c *CertificateContract) IssueCertificate(ctx contractapi.TransactionContextInterface, recipient string, encryptedData string, dataHash string) error {
	if err := requireUniversityIdentity(ctx); err != nil {
		return err
	}
	if recipient == "" {
		return fmt.Errorf("invalid recipient")
	}

	existing, err := readCertificate(ctx, recipient)
	if err != nil && !errors.Is(err, errCertificateNotFound) {
		return err
	}
	if existing != nil && existing.IsIssued && !existing.IsRevoked {
		return fmt.Errorf("certificate already issued and not revoked for recipient %s", recipient)
	}

	return writeCertificate(ctx, Certificate{
		Recipient:     recipient,
		EncryptedData: encryptedData,
		DataHash:      dataHash,
		IsIssued:      true,
		IsRevoked:     false,
	})
}

// ViewCertificate returns the stored certificate details for recipient.
// Fails if no certificate exists, or if it has been revoked — matching the
// old contract's viewCertificate behavior.
func (c *CertificateContract) ViewCertificate(ctx contractapi.TransactionContextInterface, recipient string) (*Certificate, error) {
	cert, err := readCertificate(ctx, recipient)
	if err != nil {
		return nil, err
	}
	if cert.IsRevoked {
		return nil, fmt.Errorf("certificate for %s has been revoked", recipient)
	}
	return cert, nil
}

// VerifyCertificate reports whether recipient currently holds an issued,
// non-revoked certificate. A missing certificate is reported as false rather
// than an error, matching the old contract's boolean-return semantics.
func (c *CertificateContract) VerifyCertificate(ctx contractapi.TransactionContextInterface, recipient string) (bool, error) {
	cert, err := readCertificate(ctx, recipient)
	if err != nil {
		if errors.Is(err, errCertificateNotFound) {
			return false, nil
		}
		return false, err
	}
	return cert.IsIssued && !cert.IsRevoked, nil
}

// UpdateCertificate overwrites the encrypted data / hash for an existing,
// active certificate. Only callable by the University org.
func (c *CertificateContract) UpdateCertificate(ctx contractapi.TransactionContextInterface, recipient string, encryptedData string, dataHash string) error {
	if err := requireUniversityIdentity(ctx); err != nil {
		return err
	}

	cert, err := readCertificate(ctx, recipient)
	if err != nil {
		return err
	}
	if !cert.IsIssued || cert.IsRevoked {
		return fmt.Errorf("certificate not issued or already revoked for recipient %s", recipient)
	}

	cert.EncryptedData = encryptedData
	cert.DataHash = dataHash
	return writeCertificate(ctx, *cert)
}

// RevokeCertificate marks recipient's certificate as revoked. Only callable
// by the University org.
func (c *CertificateContract) RevokeCertificate(ctx contractapi.TransactionContextInterface, recipient string) error {
	if err := requireUniversityIdentity(ctx); err != nil {
		return err
	}

	cert, err := readCertificate(ctx, recipient)
	if err != nil {
		return err
	}
	if !cert.IsIssued {
		return fmt.Errorf("certificate not issued for recipient %s", recipient)
	}

	cert.IsRevoked = true
	return writeCertificate(ctx, *cert)
}

func requireUniversityIdentity(ctx contractapi.TransactionContextInterface) error {
	mspID, err := ctx.GetClientIdentity().GetMSPID()
	if err != nil {
		return fmt.Errorf("failed to read submitter MSP ID: %w", err)
	}
	if mspID != universityMSPID {
		return fmt.Errorf("submitter org %s is not authorized to issue, update, or revoke certificates", mspID)
	}
	return nil
}

func readCertificate(ctx contractapi.TransactionContextInterface, recipient string) (*Certificate, error) {
	data, err := ctx.GetStub().GetState(recipient)
	if err != nil {
		return nil, fmt.Errorf("failed to read world state: %w", err)
	}
	if data == nil {
		return nil, fmt.Errorf("%w: no certificate found for recipient %s", errCertificateNotFound, recipient)
	}

	var cert Certificate
	if err := json.Unmarshal(data, &cert); err != nil {
		return nil, fmt.Errorf("failed to unmarshal certificate: %w", err)
	}
	return &cert, nil
}

func writeCertificate(ctx contractapi.TransactionContextInterface, cert Certificate) error {
	data, err := json.Marshal(cert)
	if err != nil {
		return fmt.Errorf("failed to marshal certificate: %w", err)
	}
	return ctx.GetStub().PutState(cert.Recipient, data)
}
