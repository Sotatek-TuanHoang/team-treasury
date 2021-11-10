const ERC20Token = artifacts.require('ERC20Token');
const TeamTreasure = artifacts.require('TeamTreasure');
const { default: BigNumber } = require('bignumber.js');
const { assert } = require('chai');
const { ethers, waffle } = require('hardhat');

const BN = web3.utils.BN;
const {
  etherUnsigned
} = require('./Ethereum');

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bn')(BN))
  .should();

contract('Treasury Contract', function (accounts) {
  let root = accounts[0];
  let a1 = accounts[1];
  let a2 = accounts[2];
  let CHNToken;
  let initAmount = new BN("10000000000000000000000000");
  let periodAmount = new BN("250000000000000000000000");
  let period = 30 * 24 * 60 * 60;

  it('check amount token', async () => {
    const CHNToken = await ERC20Token.new("CHN", "CHN", 18, initAmount, {from: root});
    const treasuryContract = await TeamTreasure.new(CHNToken.address, {from: root});

    assertEqual(await CHNToken.balanceOf(root), initAmount);
    await CHNToken.transfer(treasuryContract.address, initAmount);
    assertEqual(await CHNToken.balanceOf(treasuryContract.address), initAmount);

    // check unlock amount token
    assertEqual(await treasuryContract.getUnlockedAmount(), 0);
    await increaseTime(period - 100);
    assertEqual(await treasuryContract.getUnlockedAmount(), 0);
    await increaseTime(100);
    assertEqual(await treasuryContract.getUnlockedAmount(), periodAmount);
    await increaseTime(period * 3.5);
    assertEqual(await treasuryContract.getUnlockedAmount(), periodAmount.mul(new BN(4)));
    await increaseTime(period * 0.4);
    assertEqual(await treasuryContract.getUnlockedAmount(), periodAmount.mul(new BN(4)));

    assertEqual(await CHNToken.balanceOf(root), 0);

    // check withdraw

    expectThrow(treasuryContract.withdrawAllUnlockToken({from: a1}), "Ownable: caller is not the owner");

    await treasuryContract.withdrawAllUnlockToken({from: root});
    assertEqual(await CHNToken.balanceOf(root), periodAmount.mul(new BN(4)));
    assertEqual(await CHNToken.balanceOf(treasuryContract.address), initAmount.sub(periodAmount.mul(new BN(4))));

    expectThrow(treasuryContract.withdrawAllUnlockToken({from: root}), "INVALID AMOUNT");
    assertEqual(await CHNToken.balanceOf(root), periodAmount.mul(new BN(4)));

    await increaseTime(period * 0.2);
    assertEqual(await treasuryContract.getUnlockedAmount(), periodAmount);
    await treasuryContract.withdrawAllUnlockToken({from: root});


    assertEqual(await treasuryContract.getClaimedAmount(), periodAmount.mul(new BN(5)));
    assertEqual(await treasuryContract.getUnlockedAmount(), 0);

    // period > 40 period => unlock amount = initAmount - claimAmount
    await increaseTime(period * 42);
    assertEqual(await treasuryContract.getClaimedAmount(), periodAmount.mul(new BN(5)));
    assertEqual(await treasuryContract.getUnlockedAmount(), initAmount.sub(periodAmount.mul(new BN(5))));
  });


  it('check not enough amount token', async () => {
    const CHNToken = await ERC20Token.new("CHN", "CHN", 18, initAmount, {from: root});
    const treasuryContract = await TeamTreasure.new(CHNToken.address, {from: root});

    assertEqual(await CHNToken.balanceOf(root), initAmount);
    await CHNToken.transfer(treasuryContract.address, periodAmount.sub(new BN(1000)));
    await increaseTime(period);
    // check unlock amount token
    assertEqual(await treasuryContract.getUnlockedAmount(), periodAmount.sub(new BN(1000)));
  });


  it('changeOwner', async () => {
    const CHNToken = await ERC20Token.new("CHN", "CHN", 18, initAmount, {from: root});
    const treasuryContract = await TeamTreasure.new(CHNToken.address, {from: root});
    await treasuryContract.transferOwnership(a1, {from: root});
    assertEqual(await treasuryContract.owner(), a1);
    await expectThrow(treasuryContract.transferOwnership(a2), {from: root}, "Ownable: caller is not the owner");
  });

});



function assertEqual (val1, val2, errorStr) {
  val2 = val2.toString();
  val1 = val1.toString()
  assert(new BN(val1).should.be.a.bignumber.that.equals(new BN(val2)), errorStr);
}

function expectError(message, messageCompare) {
  messageCompare = "Error: VM Exception while processing transaction: revert " + messageCompare;
  assert(message, messageCompare);
}

async function expectThrow(f1, messageCompare) {
  try {
    await f1;
  } catch (e) {
    expectError(e.toString(), messageCompare)
  }; 
}

async function increaseTime(second) {
  await ethers.provider.send('evm_increaseTime', [second]); 
  await ethers.provider.send('evm_mine');
}
