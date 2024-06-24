async function main() {
  // Get the signer (one of the default Hardhat accounts)
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance before deployment:", (await deployer.getBalance()).toString());

  // Get the ContractFactory and deploy the contract
  const CertificateContract = await ethers.getContractFactory("CertificateContract");
  const certificateContract = await CertificateContract.deploy(deployer.address);

  // Wait for the contract to be deployed
  await certificateContract.deployed();

  // Get the deployment receipt
  const deploymentReceipt = await certificateContract.deployTransaction.wait();

  // Log the contract address and deployment details
  console.log("CertificateContract deployed to:", certificateContract.address);
  console.log("Deployment complete");

  console.log("Account balance after deployment:", (await deployer.getBalance()).toString());

  // Log the gas used and effective gas price
  console.log("Gas used for deployment:", deploymentReceipt.gasUsed.toString());
  console.log("Effective gas price (wei):", deploymentReceipt.effectiveGasPrice.toString());
}

// Handle any errors during the deployment process
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
