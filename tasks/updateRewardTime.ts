import { task } from "hardhat/config";
import { parseEther } from "ethers/lib/utils";

import "@nomiclabs/hardhat-ethers";

interface IArgs {
  contract: string;
  time: string;
}

task("updateRewardTime", "Update staking contract reward time")
  .addParam("contract", "Contract address")
  .addParam("time", "Time in seconds")
  .setAction(async (args: IArgs, hre) => {
    const Staking = await hre.ethers.getContractAt("Staking", args.contract);

    const tx = await Staking.updateRewardTime(args.time);
    await tx.wait();

    console.log(`Successfully update time on ${args.time} seconds`);
  });

export {};
