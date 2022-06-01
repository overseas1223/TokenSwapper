pragma solidity ^0.5.0;

import "./Token.sol";

contract EthSwap {
    string public name = "Token Swap";
    Token public token;
    uint public rate = 100;

    event TokenPurchased(
        address account,
        address token,
        uint amount,
        uint rate
    );

    event TokenSold(
        address account,
        address token,
        uint amount,
        uint rate
    );

    constructor(Token _token) public {
        token = _token;
    }

    function buyTokens() public payable {
        // Calculate number of tokens to purchase
        uint tokenAmount = msg.value * rate;
        // Require EthSwap exchange has enough tokens
        require(token.balanceOf(address(this)) >= tokenAmount, 'We do not have enough tokens for your purchase');
        // Transfer tokens to the user
        token.transfer(msg.sender, tokenAmount);
        // Emit event
        emit TokenPurchased(msg.sender, address(token), tokenAmount, rate);
    }

    function sellTokens(uint _amount) public {
        // Requre seller has enough tokens to sell
        require(token.balanceOf(msg.sender) >= _amount, 'You do not own enough tokens to sell this amount');
        // Calculate amount of ether to redeem
        uint etherAmount = _amount / rate;
        // Require  the EthSwap has enough Ether
        require(address(this).balance >= etherAmount, 'Not Enough ETH left in contract');
        // Perform sale
        token.transferFrom(msg.sender, address(this), _amount);
        msg.sender.transfer(etherAmount);
        // Emit event
        emit TokenSold(msg.sender, address(token), _amount, rate);
    }
}