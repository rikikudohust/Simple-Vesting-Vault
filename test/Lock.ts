import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Lock", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployOneYearLockFixture() {
    const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60;
    const ONE_GWEI = 1_000_000_000;

    const lockedAmount = ONE_GWEI;
    const unlockTime = (await time.latest()) + ONE_YEAR_IN_SECS;

    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    const Lock = await ethers.getContractFactory("Lock");
    const lock = await Lock.deploy(unlockTime, { value: lockedAmount });

    return { lock, unlockTime, lockedAmount, owner, otherAccount };
  }

  describe("Deployment", function () {
    var accounts: any;
    var vault: any;
    var erc20: any;

    beforeEach(async () => {
      accounts = await ethers.getSigners();
      const ERC20 = await ethers.getContractFactory("USDT");
      const amount = ethers.utils.parseEther('36000000');
      erc20 = await ERC20.deploy(amount);
      await erc20.deployed()

      console.log("=========== Deploy erc20 successs ===============")
      const SimpleVaultVesting = await ethers.getContractFactory("SimpleVestingVault");
      vault = await SimpleVaultVesting.deploy(erc20.address, "0x68a6c841040b05d60434d81000f523bf6355b31d");


      console.log("============ Deploy vault success ===============")

      const vestingAmount = ethers.utils.parseEther('2000')
      const nonVesting = ethers.utils.parseEther('1000')

      await vault.deployed()

      // Approve 

      await (await erc20.approve(vault.address, ethers.utils.parseEther('100000'))).wait();

    })
    it("Should deposit success", async function () {
      const vestingAmount = ethers.utils.parseEther('2000')
      const nonVesting = ethers.utils.parseEther('1000')
      var start: number = 1678147200
      const duration: number = 15552000
      await vault.deposit(nonVesting, vestingAmount, start, duration)
    
      console.log("=========== Deposit  Success 1st===============")
    });

    it("Should set the right owner", async function () {
      const vestingAmount = ethers.utils.parseEther('2000')
      const nonVesting = ethers.utils.parseEther('1000')
      
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
    });

    it("Should receive and store the funds to lock", async function () {
      const { lock, lockedAmount } = await loadFixture(
        deployOneYearLockFixture
      );

      expect(await ethers.provider.getBalance(lock.address)).to.equal(
        lockedAmount
      );
    });

    it("Should fail if the unlockTime is not in the future", async function () {
      // We don't use the fixture here because we want a different deployment
      const latestTime = await time.latest();
      const Lock = await ethers.getContractFactory("Lock");
      await expect(Lock.deploy(latestTime, { value: 1 })).to.be.revertedWith(
        "Unlock time should be in the future"
      );
    });
  });

  describe("Withdrawals", function () {
    describe("Validations", function () {
      it("Should revert with the right error if called too soon", async function () {
        const { lock } = await loadFixture(deployOneYearLockFixture);

        await expect(lock.withdraw()).to.be.revertedWith(
          "You can't withdraw yet"
        );
      });

      it("Should revert with the right error if called from another account", async function () {
        const { lock, unlockTime, otherAccount } = await loadFixture(
          deployOneYearLockFixture
        );

        // We can increase the time in Hardhat Network
        await time.increaseTo(unlockTime);

        // We use lock.connect() to send a transaction from another account
        await expect(lock.connect(otherAccount).withdraw()).to.be.revertedWith(
          "You aren't the owner"
        );
      });

      it("Shouldn't fail if the unlockTime has arrived and the owner calls it", async function () {
        const { lock, unlockTime } = await loadFixture(
          deployOneYearLockFixture
        );

        // Transactions are sent using the first signer by default
        await time.increaseTo(unlockTime);

        await expect(lock.withdraw()).not.to.be.reverted;
      });
    });

    describe("Events", function () {
      it("Should emit an event on withdrawals", async function () {
        const { lock, unlockTime, lockedAmount } = await loadFixture(
          deployOneYearLockFixture
        );

        await time.increaseTo(unlockTime);

        await expect(lock.withdraw())
          .to.emit(lock, "Withdrawal")
          .withArgs(lockedAmount, anyValue); // We accept any value as `when` arg
      });
    });

    describe("Transfers", function () {
      it("Should transfer the funds to the owner", async function () {
        const { lock, unlockTime, lockedAmount, owner } = await loadFixture(
          deployOneYearLockFixture
        );

        await time.increaseTo(unlockTime);

        await expect(lock.withdraw()).to.changeEtherBalances(
          [owner, lock],
          [lockedAmount, -lockedAmount]
        );
      });
    });
  });
});
