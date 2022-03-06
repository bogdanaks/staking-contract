import { expect } from "chai";
import { parseEther, formatEther } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import {
  Staking__factory,
  Staking,
  LPToken,
  LPToken__factory,
} from "../typechain";

describe("Staking", function () {
  let StakingContract: Staking__factory;
  let LPToken: LPToken__factory;
  let staking: Staking;
  let lpToken: LPToken;
  let rewardTokenAddress: string;
  let owner: SignerWithAddress;

  beforeEach(async function () {
    StakingContract = await ethers.getContractFactory("Staking");
    LPToken = await ethers.getContractFactory("LPToken");
    [owner] = await ethers.getSigners();

    lpToken = await LPToken.deploy();
    staking = await StakingContract.deploy(lpToken.address);
    await lpToken.approve(staking.address, parseEther("100"));
    rewardTokenAddress = await staking.rewardsToken();
  });

  describe("Test functions", function () {
    it("Error balance", async function () {
      const errorMessage = "Balance less than amount";
      await staking.stake(parseEther("10"));

      await expect(staking.unstake(parseEther("11"))).to.be.revertedWith(
        errorMessage
      );
    });

    it("Error claim", async function () {
      const errorMessage = "You can claim after available reward time";
      await staking.stake(parseEther("10"));
      await ethers.provider.send("evm_increaseTime", [60 * 9]); // 9 min

      await expect(staking.claim()).to.be.revertedWith(errorMessage);
    });

    it("Stake LP tokens", async function () {
      await staking.stake(parseEther("1"));

      const balances = await staking.balances(owner.address);
      expect(balances).to.equal(parseEther("1"));
    });

    it("Rewards after 11 minutes", async function () {
      await staking.stake(parseEther("10"));
      await ethers.provider.send("evm_increaseTime", [60 * 11]);
      await staking.stake(parseEther("1"));

      const rewards = formatEther(await staking.rewards(owner.address));

      expect(rewards).to.equal("1.0");
    });

    it("Claim rewards", async function () {
      await staking.stake(parseEther("10"));
      await ethers.provider.send("evm_increaseTime", [60 * 11]);
      const rewardTokenContract = await ethers.getContractAt(
        "RewardToken",
        rewardTokenAddress
      );

      const balanceRewards = formatEther(
        await rewardTokenContract.balanceOf(owner.address)
      );

      expect(balanceRewards).to.equal("0.0");

      await staking.claim();

      const balanceRewardsAfter = formatEther(
        await rewardTokenContract.balanceOf(owner.address)
      );

      expect(balanceRewardsAfter).to.equal("1.0");
    });

    it("Unstake lp tokens", async function () {
      await staking.stake(parseEther("10"));
      await ethers.provider.send("evm_increaseTime", [60 * 11]);
      await staking.stake(parseEther("1"));
      const stakeTokens = formatEther(await staking.balances(owner.address));
      const rewards = formatEther(await staking.rewards(owner.address));

      expect(stakeTokens).to.equal("11.0");

      await staking.unstake(parseEther("6"));

      const stakeTokensAfter = formatEther(
        await staking.balances(owner.address)
      );

      expect(stakeTokensAfter).to.equal("5.0");
      expect(rewards).to.equal("1.0");
    });
  });
});
