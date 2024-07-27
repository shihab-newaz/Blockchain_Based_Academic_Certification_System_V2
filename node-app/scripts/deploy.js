const { ethers } = require("hardhat");
const fs = require('fs');

async function main() {
  try {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    const CertificateNFT = await ethers.getContractFactory("CertificateContract");

    console.log("Deploying...");
    const certificateNFT = await CertificateNFT.deploy();

    console.log("Waiting for deployment...");
    await certificateNFT.waitForDeployment();

    const certificateNFTAddress = await certificateNFT.getAddress();
    console.log("CertificateNFT deployed to:", certificateNFTAddress);

    // Save deployment info to a file (useful for verification)
    const deploymentInfo = {
      contractAddress: certificateNFTAddress,
      deployerAddress: deployer.address,
      network: network.name,
      timestamp: new Date().toISOString(),
    };
    fs.writeFileSync('deployment-info.json', JSON.stringify(deploymentInfo, null, 2));
    console.log("Deployment info saved to deployment-info.json");

  } catch (error) {
    console.error("Deployment failed:", error);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});