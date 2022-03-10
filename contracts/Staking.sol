//SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.11;

import "./RewardToken.sol";
import "../interfaces/IERC20.sol";

contract Staking {
    RewardToken public rewardsToken;
    IERC20 public stakingToken;
    address public owner;

    uint32 public rewardTime = 60 * 10; // 10 min
    uint256 public rewardPercentage = 20 * 1e18; // 20% every 10min
    uint256 private totalSupply;

    struct StakingData {
        uint256 rewards; 
        uint256 balances;
        uint256 stakeTimes;
    }

    mapping(address => StakingData) private stakingData;

    constructor(address _stakingToken) {
        stakingToken = IERC20(_stakingToken);
        rewardsToken = new RewardToken();
        owner = msg.sender;
    }

    modifier updateReward(address _account) {
        stakingData[_account].rewards = earned(_account);
        _;
    }

    modifier onlyOwner() {
        require(owner == msg.sender, "Caller is not the owner");
        _;
    }

    function earned(address _account) internal view returns (uint256 earnedAmount) {
        if (totalSupply == 0) return 0;

        return ((stakingData[_account].balances / 100 * rewardPercentage * 1e18) / totalSupply) / 1e18;
    }

    function isGreaterThanRewardTime() internal view returns (bool status) {
        return (block.timestamp - stakingData[msg.sender].stakeTimes > rewardTime) ? true : false;
    }

    function stake(uint256 _amount) external updateReward(msg.sender) {
        stakingData[msg.sender].stakeTimes = block.timestamp;
        totalSupply += _amount;
        stakingData[msg.sender].balances += _amount;
        stakingToken.transferFrom(msg.sender, address(this), _amount);
    }

    function unstake(uint256 _amount) external updateReward(msg.sender) {
        require(isGreaterThanRewardTime(), "You can claim after available reward time");
        require(stakingData[msg.sender].balances >= _amount, "Balance less than amount");

        stakingData[msg.sender].stakeTimes = block.timestamp;
        totalSupply -= _amount;
        stakingData[msg.sender].balances -= _amount;
        stakingToken.transfer(msg.sender, _amount);
    }

    function claim() external updateReward(msg.sender) {
        require(isGreaterThanRewardTime(), "You can claim after available reward time");

        stakingData[msg.sender].stakeTimes = block.timestamp;

        uint256 reward = stakingData[msg.sender].rewards;
        stakingData[msg.sender].rewards = 0;
        rewardsToken.mint(reward);
        rewardsToken.transfer(msg.sender, reward);
    }

    function updateRewardTime(uint32 _time) external onlyOwner {
        require(_time > 0, "Time must be greater than zero");
        rewardTime = _time;
    }

    function updateRewardPercent(uint256 _percent) external onlyOwner {
        require(_percent > 0, "Percent must be greater than zero");
        rewardPercentage = _percent;
    }
}
