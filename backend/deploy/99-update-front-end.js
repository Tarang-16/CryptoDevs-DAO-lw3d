const { ethers, network } = require("hardhat");
const fs = require("fs");

FRONT_END_ABI_FILE = "../frontend/constants/abi.json";
FRONT_END_ADDRESSES_FILE = "../frontend/constants/contractAddresses.json";
// FRONT_END_NFT_ABI_FILE = "../frontend/constants/nftabi.json";
// FRONT_END_NFT_ADDRESSES_FILE =
//   "../frontend/constants/nftcontractAddresses.json";

module.exports = async function () {
  if (process.env.UPDATE_FRONT_END) {
    console.log("Updating front end......");
    await updateContractAddresses();
    await updateAbi();
    console.log("front-end updated");
  }
};

async function updateAbi() {
  // const fakeNFTMarketplace = await ethers.getContract("FakeNFTMarketplace");
  // fs.writeFileSync(
  //   FRONT_END_NFT_ABI_FILE,
  //   fakeNFTMarketplace.interface.format(ethers.utils.FormatTypes.json)
  // );

  const cryptoDevsDAO = await ethers.getContract("CryptoDevsDAO");
  fs.writeFileSync(
    FRONT_END_ABI_FILE,
    cryptoDevsDAO.interface.format(ethers.utils.FormatTypes.json)
  );

  console.log("hu");
}

async function updateContractAddresses() {
  // const fakeNFTMarketplace = await ethers.getContract("FakeNFTMarketplace");
  const chainId = network.config.chainId.toString();
  // const nftcurrentAddresses = JSON.parse(
  //   fs.readFileSync(FRONT_END_NFT_ADDRESSES_FILE, "utf8")
  // );
  // if (chainId in nftcurrentAddresses) {
  //   if (!nftcurrentAddresses[chainId].includes(fakeNFTMarketplace.address)) {
  //     nftcurrentAddresses[chainId].push(fakeNFTMarketplace.address);
  //     console.log("hi");
  //   }
  // }
  // {
  //   nftcurrentAddresses[chainId] = [fakeNFTMarketplace.address]; // if chainId is not present
  // }
  // fs.writeFileSync(
  //   FRONT_END_NFT_ADDRESSES_FILE,
  //   JSON.stringify(nftcurrentAddresses)
  // );

  const cryptoDevsDAO = await ethers.getContract("CryptoDevsDAO");
  // const chainId = network.config.chainId.toString();
  const currentAddresses = JSON.parse(
    fs.readFileSync(FRONT_END_ADDRESSES_FILE, "utf8")
  );
  if (chainId in currentAddresses) {
    if (!currentAddresses[chainId].includes(cryptoDevsDAO.address)) {
      currentAddresses[chainId].push(cryptoDevsDAO.address);
      console.log("hi");
    }
  }
  {
    currentAddresses[chainId] = [cryptoDevsDAO.address]; // if chainId is not present
  }
  fs.writeFileSync(FRONT_END_ADDRESSES_FILE, JSON.stringify(currentAddresses));
}

module.exports.tags = ["all", "frontend"];
