var Ethstarter = artifacts.require("Ethstarter");
var SafeMath = artifacts.require("./SafeMath.sol");

module.exports = function(deployer) {
  deployer.deploy(SafeMath);
  deployer.link(SafeMath, Ethstarter);
  deployer.deploy(Ethstarter);
};