require("dotenv").config();
const { deployments, ethers, artifacts } = require("hardhat");

const func = async function ({ deployments, getNamedAccounts, getChainId }) {
  const { deploy, execute } = deployments;
  const { deployer } = await getNamedAccounts();

  console.log( {deployer} );

  const treasury = await deploy("TeamTreasure", {
    from: deployer,
    args: [process.env.TOKEN_ADDRESS],
    log: true,
  });

  await hre.run('verify:verify', {
    address: treasury.address,
    constructorArguments: [process.env.TOKEN_ADDRESS],
  })
};

module.exports = func;

module.exports.tags = ['deploy-verify'];
