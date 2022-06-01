const { assert } = require('chai');
// const { Item } = require('react-bootstrap/lib/Breadcrumb');

const EthSwap = artifacts.require("EthSwap");
const Token = artifacts.require("Token");

require('chai')
    .use(require('chai-as-promised'))
    .should()

function tokens(n) {
    return web3.utils.toWei(n, 'ether');
}

contract ('EthSwap', ([deployer, investor]) => {

    let token, ethSwap

    before(async() => {
        token = await Token.new()
        ethSwap = await EthSwap.new(token.address)
        await token.transfer(ethSwap.address, tokens('1000000'))
    })

    describe('EthSwap deployment', async () => {
        it('contract has a name', async () => {
            const name = await ethSwap.name()
            assert.equal(name, "Token Swap")
        })
        it('contract has tokens', async () => {
            let balance = await token.balanceOf(ethSwap.address)
            assert.equal(balance.toString(), tokens('1000000'))
        })
    })

    describe('Token deployment', async () => {
        it('contract has a name', async () => {
            const name = await token.name()
            assert.equal(name, "Ren Token")
        })
    })

    describe('buyTokens(100)', async () => {
        let result
        before(async()=>{
            result = await ethSwap.buyTokens({ from: investor, value: web3.utils.toWei('1', 'ether')})
        })
        it('Investor has balance of 100 REN', async () => {
            let investorBalance = await token.balanceOf(investor)
            assert.equal(investorBalance.toString(), tokens('100'))
        })
        it('EthSwap REN balance went down 999900 tokens', async() => {
            let ethSwapBalance = await token.balanceOf(ethSwap.address)
            assert.equal(ethSwapBalance.toString(), tokens('999900'))
        })
        it('EthSwap eth balance went up by 1 eth', async() => {
            let ethSwapBalance = await web3.eth.getBalance(ethSwap.address)
            assert.equal(ethSwapBalance.toString(), web3.utils.toWei('1', 'ether'))
        })
        it('Transfer event correctly emitted', async() => {
            const event = result.logs[0].args
            assert.equal(event.account, investor)
            assert.equal(event.token, token.address)
            assert.equal(event.amount.toString(), tokens('100').toString())
            assert.equal(event.rate.toString(), '100')
        })
    })

    describe('sellTokens(100)', async () => {
        let result
        before(async()=>{
            await token.approve(ethSwap.address, tokens('100'), {from: investor })
            result = await ethSwap.sellTokens(tokens('100'), {from: investor })
        })
        it('Investor has balance of 0 REN', async () => {
            let investorBalance = await token.balanceOf(investor)
            assert.equal(investorBalance.toString(), tokens('0'))
        })
        it('EthSwap REN balance went back to 1000000 tokens', async() => {
            let ethSwapBalance = await token.balanceOf(ethSwap.address)
            assert.equal(ethSwapBalance.toString(), tokens('1000000'))
        })
        it('EthSwap eth balance went back to 0 eth', async() => {
            let ethSwapBalance = await web3.eth.getBalance(ethSwap.address)
            assert.equal(ethSwapBalance.toString(), web3.utils.toWei('0', 'ether'))
        })
        it('Transfer event correctly emitted', async() => {
            const event = result.logs[0].args
            assert.equal(event.account, investor)
            assert.equal(event.token, token.address)
            assert.equal(event.amount.toString(), tokens('100').toString())
            assert.equal(event.rate.toString(), '100')
        })
        it('FAILURE TEST: trying to sell more tokens than owned', async() => {
            await ethSwap.sellTokens(tokens('500'), {from: investor}).should.be.rejected;
        })
    })

})