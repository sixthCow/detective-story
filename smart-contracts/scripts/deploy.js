const hre = require("hardhat");
const fs = require("fs");
async function main() {
  const Detective = await hre.ethers.getContractFactory("Detective");
  const detective = await Detective.deploy();
  console.log("deployed" , detective)

  await detective.waitForDeployment();

  console.log("detective deployed to:", detective.target);

  fs.writeFileSync(
    "./contractAddress.js", `
    export const detectiveAddress = "${detective.target}";
    `
  )

}
// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

//npx hardhat run scripts/deploy.js --network fantomTest
//npx hardhat verify --network fantomTest 0x342C3Eb307306C22b226A32985E344B603eb5E37 