"use strict";

const BigNum = require('bignumber.js');
const ethers = require('ethers');

function etherUnsigned(num) {
  return new BigNum(num).toFixed();
}

async function increaseTime(seconds) {
  await rpc({ method: 'evm_increaseTime', params: [seconds] });
  return rpc({ method: 'evm_mine' });
}

async function setTime(seconds) {
  await rpc({ method: 'evm_setTime', params: [new Date(seconds * 1000)] });
}

async function freezeTime(seconds) {
  await rpc({ method: 'evm_freezeTime', params: [seconds] });
  return rpc({ method: 'evm_mine' });
}


module.exports = {
  etherUnsigned,
  freezeTime,
  increaseTime,
  setTime,
};
