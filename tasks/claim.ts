import { task } from "hardhat/config";
import { formatEther } from "ethers/lib/utils";

import "@nomiclabs/hardhat-ethers";

interface IArgs {
  contract: string;
}

task("claim", "Claim reward tokens")
  .addParam("contract", "Contract address")
  .setAction(async (args: IArgs, hre) => {
    const Staking = await hre.ethers.getContractAt("Staking", args.contract);
    const RewardToken = await hre.ethers.getContractAt(
      "RewardToken",
      await Staking.rewardsToken()
    );
    const [owner] = await hre.ethers.getSigners();
    const rewards = formatEther(await RewardToken.balanceOf(owner.address));

    const tx = await Staking.claim();
    await tx.wait();

    console.log(`Successfully claimed ${rewards} tokens`);
  });

export {};
