import { expect } from "chai";
import { parseEther, formatEther } from "ethers/lib/utils";
import { ethers } from "hardhat";
import Big from "bignumber.js";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import {
  Staking__factory,
  Staking,
  LPToken,
  LPToken__factory,
  RewardToken,
  RewardToken__factory,
} from "../typechain";

describe("Staking", function () {
  let StakingContract: Staking__factory;
  let LPToken: LPToken__factory;
  let RewardToken: RewardToken__factory;
  let staking: Staking;
  let lpToken: LPToken;
  let rewardToken: RewardToken;
  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;

  beforeEach(async function () {
    StakingContract = await ethers.getContractFactory("Staking");
    LPToken = await ethers.getContractFactory("LPToken");
    RewardToken = await ethers.getContractFactory("RewardToken");
    [owner, addr1] = await ethers.getSigners();

    lpToken = await LPToken.deploy();
    rewardToken = await RewardToken.deploy();
    staking = await StakingContract.deploy(
      lpToken.address,
      rewardToken.address
    );
    await lpToken.approve(staking.address, parseEther("100"));
  });

  describe("Test functions", function () {
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

      expect(rewards).to.equal("11.0");
    });

    it("Claim rewards", async function () {
      await staking.stake(parseEther("10"));
      await ethers.provider.send("evm_increaseTime", [60 * 11]);
      await staking.stake(parseEther("1"));

      const rewards = formatEther(await staking.rewards(owner.address));
      console.log("rewards: ", rewards);

      // expect(rewards).to.equal("11.0");
    });
  });
});
