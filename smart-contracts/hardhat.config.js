require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config()

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.18",
  networks: {
    hardhat: {
    },
    op: {
      url: 'https://optimism.meowrpc.com',
      accounts: [process.env.MNENOMIC],

    },

    Base: {
      url: 'https://base-goerli.blockpi.network/v1/rpc/public',
      accounts: [process.env.MNENOMIC],

    },
    zora: {
      url: 'https://rpc.zora.energy',
      accounts: [process.env.MNENOMIC],

    },
    mode: {
      url: 'https://sepolia.mode.network',
      accounts: [process.env.MNENOMIC],

    },
  },

  etherscan: {           
    apiKey: process.env.SCAN,
  }

};
