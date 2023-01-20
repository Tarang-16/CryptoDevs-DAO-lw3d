const { ethers } = require("hardhat");

module.exports = async function ({ getNamedAccounts, deployments }) {
  const { deployer } = await getNamedAccounts();
  const { deploy, log } = deployments;
  const CRYPTODEVS_CONTRACT_ADDRESS = process.env.CRYPTODEVS_CONTRACT;

  const fakeNFTMarketplace = await deploy("FakeNFTMarketplace", {
    from: deployer,
    log: true,
    args: [],
  });

  log(`FakeNFTMarketplace address:${fakeNFTMarketplace.address}`);

  const cryptoDevsDAO = await deploy("CryptoDevsDAO", {
    from: deployer,
    log: true,
    args: [fakeNFTMarketplace.address, CRYPTODEVS_CONTRACT_ADDRESS],
    value: ethers.utils.parseEther("0.01"),
  });

  log(`CryptoDevs DAO address:${cryptoDevsDAO.address}`);
};

module.exports.tags = ["all"];
