import { task } from "hardhat/config";

import "@nomiclabs/hardhat-ethers";

interface IArgs {
  contract: string;
}

const WETH_RINKEBY = "0xc778417E063141139Fce010982780140Aa0cD5Ab";
const FACTORY_UNISWAP = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";

task("createpair", "Create pair Uniswap V2")
  .addParam("contract", "Contract address")
  .setAction(async (args: IArgs, hre) => {
    const [owner] = await hre.ethers.getSigners();
    const uniswap = await hre.ethers.getContractAt(
      "IUniswapV2Factory",
      FACTORY_UNISWAP,
      owner
    );

    const pair = await uniswap.createPair(WETH_RINKEBY, args.contract);

    console.log(pair);

    console.log(`Success createPair on uniswap v2`);
  });

export {};
