import { ethers, network } from "hardhat";
import { any, int } from "hardhat/internal/core/params/argumentTypes";

async function moveTimestamp(seconds: any) {
  await network.provider.send("evm_increaseTime", [seconds]);
  await network.provider.send("evm_mine");
}

async function jumpTo(timestamp: any) {
  var blockNumber: number = await ethers.provider.getBlockNumber()
  // ethers.provider.getBlock(e)
  var now: any = (await ethers.provider.getBlock(blockNumber)).timestamp;
  var distance: any = timestamp - now;
  await moveTimestamp(distance);
}

async function main() {

  const accounts = await ethers.getSigners();

  const ERC20 = await ethers.getContractFactory("USDT");
  const amount = ethers.utils.parseEther('36000000');
  const erc20 = await ERC20.deploy(amount);
  await erc20.deployed()

  console.log("=========== Deploy erc20 successs ===============")

  const SimpleVaultVesting = await ethers.getContractFactory("SimpleVestingVault");
  const vault = await SimpleVaultVesting.deploy(erc20.address, accounts[1].address);


  console.log("============ Deploy vault success ===============")

  const vestingAmount = ethers.utils.parseEther('2000')
  const nonVesting = ethers.utils.parseEther('1000')

  await vault.deployed()

  // Approve 

  await(await erc20.approve(vault.address, ethers.utils.parseEther('100000'))).wait();

  console.log(erc20.address)
  console.log(vault.address)

  // // 1st

  var start: number = 1678147200
  const duration: number = 15552000
  await vault.deposit(nonVesting, vestingAmount, start, duration)

  console.log("=========== Deposit  Success 1st===============")

  // 2st 
  start = 1680825600
  // const duration: number = 15552000
  await vault.deposit(nonVesting, vestingAmount, start, duration)

  console.log("=========== Deposit  Success 2st===============")

  // 3st 
  start = 1683417600
  // const duration: number = 15552000
  await vault.deposit(nonVesting, vestingAmount, start, duration)

  console.log("=========== Deposit  Success 3st===============")

  // 4st 
  start = 1686096000
  // const duration: number = 15552000
  await vault.deposit(nonVesting, vestingAmount, start, duration)

  console.log("=========== Deposit  Success 4st===============")

  // 5st 
  start = 1688688000
  // const duration: number = 15552000
  await vault.deposit(nonVesting, vestingAmount, start, duration)

  console.log("=========== Deposit  Success 5st===============")

  // 6st 
  start = 1691366400
  // const duration: number = 15552000
  await vault.deposit(nonVesting, vestingAmount, start, duration)

  console.log("=========== Deposit  Success 6st===============")

  // 7st 
  start = 1694044800
  // const duration: number = 15552000
  await vault.deposit(nonVesting, vestingAmount, start, duration)

  console.log("=========== Deposit  Success 7st===============")
  // var time: any = await vault.getTime();
  // console.log(time


  // Check 5st

  await jumpTo(1694044800)
  var unlock: any = await vault.unlocked()
  console.log(unlock)

  await vault.connect(accounts[1]).withdraw()
  console.log(await erc20.balanceOf(accounts[1].address))

  var unlock: any = await vault.unlocked()
  console.log(unlock)
  console.log(await vault.vestingData(1))
  console.log(await vault.currentMonth())
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
