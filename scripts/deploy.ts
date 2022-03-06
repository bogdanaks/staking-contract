import { ethers } from "hardhat";

async function main() {
  const StakingContract = await ethers.getContractFactory("Staking");
  const staking = await StakingContract.deploy();
  await staking.deployed();
  const [owner] = await ethers.getSigners();

  console.log("Staking deployed to:", staking.address);
  console.log("Owner address is: ", owner.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
