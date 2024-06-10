async function main() {
  // Get the signer (one of the default Hardhat accounts)
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Get the contract factory
  const MyNFT = await ethers.getContractFactory("CertificateContract");

  // Start deployment, returning a promise that resolves to a contract object
  const myNFT = await MyNFT.deploy();

  await myNFT.deployed();

  console.log("Contract deployed to:", myNFT.address);
  console.log("Deployment complete");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })