import { task } from "hardhat/config";
import { parseEther } from "ethers/lib/utils";

import "@nomiclabs/hardhat-ethers";

interface IArgs {
  contract: string;
  amount: string;
}

task("unstake", "Unstake tokens")
  .addParam("contract", "Contract address")
  .addParam("amount", "Amount unstake tokens")
  .setAction(async (args: IArgs, hre) => {
    const Staking = await hre.ethers.getContractAt("Staking", args.contract);

    const tx = await Staking.unstake(parseEther(args.amount));
    await tx.wait();

    console.log(`Successfully unstaked ${args.amount}`);
  });

export {};
