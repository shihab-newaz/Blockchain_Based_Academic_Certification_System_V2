package main

import (
	"log"

	"certcc/chaincode"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

func main() {
	cc, err := contractapi.NewChaincode(&chaincode.CertificateContract{})
	if err != nil {
		log.Panicf("error creating certcc chaincode: %v", err)
	}
	if err := cc.Start(); err != nil {
		log.Panicf("error starting certcc chaincode: %v", err)
	}
}
