import { ethers } from "hardhat";

async function main() {
  const StakingContract = await ethers.getContractFactory("Staking");
  const LPTokenContract = await ethers.getContractFactory("LPToken");
  const lpToken = await LPTokenContract.deploy();
  const staking = await StakingContract.deploy(
    process.env.ERC20_CONTRACT_ADDRESS || lpToken.address
  );
  await staking.deployed();
  const [owner] = await ethers.getSigners();

  console.log("Staking deployed to:", staking.address);
  console.log("LPToken deployed to:", await staking.stakingToken());
  console.log("Reward token address is:", await staking.rewardsToken());
  console.log("Owner address is: ", owner.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
