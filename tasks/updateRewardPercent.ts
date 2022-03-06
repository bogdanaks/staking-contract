import { parseEther } from "ethers/lib/utils";
import { task } from "hardhat/config";

import "@nomiclabs/hardhat-ethers";

interface IArgs {
  contract: string;
  percent: string;
}

task("updateRewardPercent", "Update staking contract reward percent")
  .addParam("contract", "Contract address")
  .addParam("percent", "Percent")
  .setAction(async (args: IArgs, hre) => {
    const Staking = await hre.ethers.getContractAt("Staking", args.contract);

    const tx = await Staking.updateRewardPercent(parseEther(args.percent));
    await tx.wait();

    console.log(`Successfully update percent on ${args.percent}`);
  });

export {};
