async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const CertificateNFT = await ethers.getContractFactory("CertificateContract");
  
  console.log("Estimating gas...");
  const estimatedGas = await CertificateNFT.signer.estimateGas(
    CertificateNFT.getDeployTransaction()
  );
  console.log("Estimated gas:", estimatedGas.toString());

  console.log("Deploying...");
  const certificateNFT = await CertificateNFT.deploy({
    gasLimit: estimatedGas.mul(120).div(100) // Add 20% buffer
  });

  console.log("Waiting for deployment...");
  await certificateNFT.deployed();

  console.log("CertificateNFT deployed to:", certificateNFT.address);


  // Save deployment info to a file (useful for verification)
  const fs = require('fs');
  const deploymentInfo = {
    contractAddress: certificateNFT.address,
    deployerAddress: deployer.address,
  };
  fs.writeFileSync('deployment-info.json', JSON.stringify(deploymentInfo, null, 2));
  console.log("Deployment info saved to deployment-info.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });