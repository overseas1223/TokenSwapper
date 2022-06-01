const EthSwap = artifacts.require("EthSwap");
const Token = artifacts.require("Token");

module.exports = async function(deployer) {
    // Deploy Token
    await deployer.deploy(Token);
    const token = await Token.deployed();
    // Deploy EthSwap
    await deployer.deploy(EthSwap, token.address);
    const ethSwap = await EthSwap.deployed();
    // Transfer all tokens to EthSwap contract
    await token.transfer(ethSwap.address, '1000000000000000000000000')
};
