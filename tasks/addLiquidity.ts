import { task } from "hardhat/config";

import "@nomiclabs/hardhat-ethers";

interface IArgs {
  contract: string;
}

const ROUTER_UNISWAP = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
const WETH_RINKEBY = "0xc778417E063141139Fce010982780140Aa0cD5Ab";

task("addliquidity", "Add liquidity to Uniswap V2")
  .addParam("contract", "Contract address")
  .setAction(async (args: IArgs, hre) => {
    const [owner] = await hre.ethers.getSigners();
    const IRouter = await hre.ethers.getContractAt(
      "IUniswapV2Router",
      ROUTER_UNISWAP
    );
    const ERC20 = await hre.ethers.getContractFactory("RewardToken");
    const wEth = await ERC20.attach(WETH_RINKEBY);
    const stakingToken = await ERC20.attach(args.contract);

    const ethersAmount = await hre.ethers.utils.parseEther("0.1");
    const txEthApprove = await wEth.approve(ROUTER_UNISWAP, ethersAmount);
    txEthApprove.wait();

    const stakingTokenAmount = await hre.ethers.utils.parseEther("100");
    const txStakingTokenApprove = await stakingToken.approve(
      ROUTER_UNISWAP,
      stakingTokenAmount
    );
    txStakingTokenApprove.wait();

    const blockNumber = await hre.ethers.provider.getBlockNumber();
    const block = await hre.ethers.provider.getBlock(blockNumber);
    const liquidCreate = await IRouter.addLiquidity(
      WETH_RINKEBY,
      args.contract,
      ethersAmount,
      stakingTokenAmount,
      1,
      1,
      owner.address,
      block.timestamp + 333
    );
    liquidCreate.wait();

    console.log(`Success addLiquidity tokens to uniswap v2`);
  });

export {};
