// hardhat.config.js
require("dotenv").config();
require("@nomiclabs/hardhat-ethers");

console.log(process.env.AVALANCHE_NODE_URL)
module.exports = {
  solidity: "0.8.20",
  paths: {
    artifacts: './src/artifacts',
  },
  networks: {
    fuji: {
      url: `${process.env.REACT_APP_AVALANCHE_NODE_URL}`,
      accounts: [`${process.env.REACT_APP_PRIVATE_KEY}`],
      chainId: 43113,
    },
  },
};
