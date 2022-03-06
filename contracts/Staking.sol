//SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.11;

import "hardhat/console.sol";

import "./RewardToken.sol";

contract Staking {
    RewardToken public rewardsToken;
    IERC20 public stakingToken;

    uint32 public rewardTime = 60 * 10; // 10 min
    uint256 public rewardPercentage = 100; // 100% every 10min
    uint256 public rewardPerTokenStored;
    uint256 private totalSupply;

    // mapping(address => uint256) public userRewardPerTokenPaid;
    mapping(address => uint256) public rewards;
    mapping(address => uint256) public balances;
    mapping(address => uint256) private stakeTimes;

    constructor(address _stakingToken) {
        stakingToken = IERC20(_stakingToken);
        rewardsToken = new RewardToken();
    }

    modifier updateReward(address _account) {
        uint256 earnAmount = earned(_account);
        rewards[_account] = earnAmount;
        _;
    }

    function earned(address _account) internal view returns (uint256) {
        if (totalSupply == 0) return 0;

        uint256 balanceStaking = balances[_account];
        return (balanceStaking / 100 * rewardPercentage * 1e18) / totalSupply;
    }

    function isGreaterThanRewardTime() internal view returns (bool) {
        return (block.timestamp - stakeTimes[msg.sender] > rewardTime) ? true : false;
    }

    function stake(uint256 _amount) external updateReward(msg.sender) {
        stakeTimes[msg.sender] = block.timestamp;
        totalSupply += _amount;
        balances[msg.sender] += _amount;
        stakingToken.transferFrom(msg.sender, address(this), _amount);
    }

    function unstake(uint256 _amount) external updateReward(msg.sender) {
        require(balances[msg.sender] >= _amount, "Balance less than amount");

        stakeTimes[msg.sender] = block.timestamp;
        totalSupply -= _amount;
        balances[msg.sender] -= _amount;
        stakingToken.transfer(msg.sender, _amount);
    }

    function claim() external updateReward(msg.sender) {
        require(isGreaterThanRewardTime(), "You can claim after available reward time");

        stakeTimes[msg.sender] = block.timestamp;

        uint256 reward = rewards[msg.sender];
        rewards[msg.sender] = 0;
        rewardsToken.mint(reward);
        rewardsToken.transfer(msg.sender, reward);
    }
}

interface IERC20 {
    function totalSupply() external view returns (uint);

    function balanceOf(address account) external view returns (uint);

    function transfer(address recipient, uint256 amount) external returns (bool);

    function allowance(address owner, address spender) external view returns (uint);

    function mint(uint256 amount) external;

    function burn(uint256 amount) external;

    function approve(address spender, uint256 amount) external returns (bool);

    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external returns (bool);

    event Transfer(address indexed from, address indexed to, uint amount);
    event Approval(address indexed owner, address indexed spender, uint amount);
}
