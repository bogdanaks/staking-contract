//SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.11;

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
