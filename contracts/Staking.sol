//SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.11;

import "hardhat/console.sol";

contract Staking {
    IERC20 public rewardsToken;
    IERC20 public stakingToken;

    uint256 public rewardPercentage = 100;
    uint public rewardTime = 60 * 60 * 10; // 10 min
    uint256 public lastUpdateTime;
    uint256 public rewardPerTokenStored;
    uint256 private totalSupply;

    mapping(address => uint256) public userRewardPerTokenPaid;
    mapping(address => uint256) public rewards;
    mapping(address => uint256) public balances;
    mapping(address => uint256) private stakingTimes;

    constructor(address _stakingToken, address _rewardToken) {
        stakingToken = IERC20(_stakingToken);
        rewardsToken = IERC20(_rewardToken);
    }

    function earned(address account) internal view returns (uint256) {
        if (totalSupply == 0) return 0;

        uint256 balanceStaking = balances[account];
        return balanceStaking + (balanceStaking / 100 * rewardPercentage * 1e18) / totalSupply;
    }

    function isGreaterThanRewardTime() internal view returns (bool) {
        return (block.timestamp - stakingTimes[msg.sender] > rewardTime) ? true : false;
    }

    modifier updateReward(address account) {
        lastUpdateTime = block.timestamp;

        uint256 earnAmount = earned(account);
        rewards[account] = earnAmount;
        _;
    }

    function stake(uint256 _amount) external updateReward(msg.sender) {
        totalSupply += _amount;
        balances[msg.sender] += _amount;
        stakingTimes[msg.sender] = block.timestamp;
        stakingToken.transferFrom(msg.sender, address(this), _amount);
    }

    function unstake(uint256 _amount) external updateReward(msg.sender) {
        require(isGreaterThanRewardTime(), "You can claim after available reward time");

        totalSupply -= _amount;
        balances[msg.sender] -= _amount;
        stakingToken.transfer(msg.sender, _amount);
    }

    function claim() external updateReward(msg.sender) {
        require(isGreaterThanRewardTime(), "You can claim after available reward time");

        uint256 reward = rewards[msg.sender];
        rewards[msg.sender] = 0;
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
