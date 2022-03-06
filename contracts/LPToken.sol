//SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.11;

contract LPToken {
    string public name = "CryptonLP";
    string public symbol = "CRYPLP";
    uint8 public decimals = 18;
    uint256 public totalSupply = 1000000 * 10**decimals;
    address public owner;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    constructor() {
        owner = msg.sender;
        balanceOf[msg.sender] = totalSupply;
    }

    function transfer(address _to, uint256 _amount) external returns (bool status) {
        require(_amount > 0, "Amount must be greater than 0");
        balanceOf[msg.sender] -= _amount;
        balanceOf[_to] += _amount;
        emit Transfer(msg.sender, _to, _amount);
        return true;
    }

    function transferFrom(address _from, address _to, uint256 _amount) external returns (bool status) {
        require(_amount > 0, "Amount must be greater than 0");
        require(allowance[_from][msg.sender] >= _amount, "Transfer amount exceeds allowance");
        allowance[_from][msg.sender] -= _amount;
        balanceOf[_from] -= _amount;
        balanceOf[_to] += _amount;
        emit Transfer(_from, _to, _amount);
        return true;
    }

    function approve(address _spender, uint256 _amount) external returns (bool status) {
        require(_amount > 0, "Amount must be greater than 0");
        allowance[msg.sender][_spender] = _amount;
        emit Approval(msg.sender, _spender, _amount);
        return true;
    }

    function increaseAllowance(address _spender, uint256 _amount) external returns (bool status) {
        require(_amount > 0, "Amount must be greater than 0");
        allowance[msg.sender][_spender] += _amount;
        emit Approval(msg.sender, _spender, _amount);
        return true;
    }

    function decreaseAllowance(address _spender, uint256 _amount) external returns (bool status) {
        require(_amount > 0, "Amount must be greater than 0");
        uint256 currentAllowance = this.allowance(msg.sender, _spender);
        require(currentAllowance >= _amount, "Total allowance must be greater than 0");
        allowance[msg.sender][_spender] -= _amount;
        emit Approval(msg.sender, _spender, _amount);
        return true;
    }

    function mint(uint256 _amount) external onlyOwner {
        require(_amount > 0, "Amount must be greater than 0");
        balanceOf[msg.sender] += _amount;
        totalSupply += _amount;
        emit Transfer(address(0), msg.sender, _amount);
    }

    function burn(uint256 _amount) external onlyOwner {
        require(_amount > 0, "Amount must be greater than 0");
        uint256 accountBalance = balanceOf[msg.sender];
        require(accountBalance >= _amount, "Burn amount exceeds balance");
        balanceOf[msg.sender] -= _amount;
        totalSupply -= _amount;
        emit Transfer(msg.sender, address(0), _amount);
    }

    modifier onlyOwner() {
        require(owner == msg.sender, "Caller is not the owner");
        _;
    }

    event Approval(address indexed _owner, address indexed _spender, uint256 _amount);

    event Transfer(address indexed _from, address indexed _to, uint256 _amount);
}
