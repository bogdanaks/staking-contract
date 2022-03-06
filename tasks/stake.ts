import { task } from "hardhat/config";
import { parseEther } from "ethers/lib/utils";

import "@nomiclabs/hardhat-ethers";

interface IArgs {
  contract: string;
  lptoken: string;
  amount: string;
}

task("stake", "Stake tokens")
  .addParam("contract", "Contract address")
  .addParam("lptoken", "LP token address")
  .addParam("amount", "Amount stake tokens")
  .setAction(async (args: IArgs, hre) => {
    const Staking = await hre.ethers.getContractAt("Staking", args.contract);
    const LPToken = await hre.ethers.getContractAt("LPToken", args.lptoken);

    const txApprove = await LPToken.approve(
      Staking.address,
      parseEther(args.amount)
    );
    await txApprove.wait();

    const tx = await Staking.stake(parseEther(args.amount));
    await tx.wait();

    console.log(`Successfully staked ${args.amount}`);
  });

export {};
