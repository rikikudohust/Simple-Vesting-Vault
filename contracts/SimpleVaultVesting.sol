// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity >=0.8;

import "hardhat/console.sol";

interface IERC20 {
    function balanceOf(address account) external view returns (uint256);

    function transfer(
        address recipient,
        uint256 amount
    ) external returns (bool);

    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) external;
}

contract SimpleVestingVault {
    struct Vesting {
        uint64 start;
        uint64 duration;
        uint256 amount;
        uint256 vestingAmount;
        uint256 withdrawed;
    }

    uint256 public currentMonth;
    IERC20 public token;
    address public owner;
    address public withdrawer;

    Vesting[] public vestingData; // Only Onwer can set

    modifier onlyOnwer() {
        require(msg.sender == owner, "!Authorisation");
        _;
    }

    modifier onlyWithdrawer() {
        require(msg.sender == withdrawer, "!Authorisation");
        _;
    }

    function changeOwner(address _newOwner) external onlyOnwer {
        owner = msg.sender;
    }

    constructor() public {
        owner = msg.sender;
    }

    function unlocked() public view returns (uint256) {
        uint256 vested = 0;
        for (uint256 i = 0; i < vestingData.length; i++) {
            uint256 run = (block.timestamp < vestingData[i].start)
                ? 0
                : block.timestamp - vestingData[i].start;
            if (run > vestingData[i].duration) {
                run = vestingData[i].duration;
            }
            if (block.timestamp < vestingData[i].start) {
                vested += 0;
            } else {
                vested +=
                    vestingData[i].amount +
                    (vestingData[i].vestingAmount * run) /
                    vestingData[i].duration -
                    vestingData[i].withdrawed;
            }
        }
        return vested;
    }

    function totalReward() external view returns (uint256 total) {
        for (uint256 i = currentMonth; i < vestingData.length; i++) {
            uint256 run = (block.timestamp < vestingData[i].start)
                ? 0
                : block.timestamp - vestingData[i].start;
            if (run >= vestingData[i].duration) {
                run = vestingData[i].duration;
            }
            if (block.timestamp < vestingData[i].start) {
                total += 0;
            } else {
                uint256 vestedTmp = vestingData[i].amount +
                    vestingData[i].vestingAmount -
                    vestingData[i].withdrawed;
                total += vestedTmp;
            }
        }
    }

    function setUser(address _account) external onlyOnwer {
        withdrawer = _account;
    }

    function setToken(IERC20 _token) external onlyOnwer {
        token = _token;
    }

    function withdraw() external onlyWithdrawer {
        uint256 vested = 0;
        for (uint256 i = currentMonth; i < vestingData.length; i++) {
            uint256 run = (block.timestamp < vestingData[i].start)
                ? 0
                : block.timestamp - vestingData[i].start;
            if (run >= vestingData[i].duration) {
                run = vestingData[i].duration;
                currentMonth += 1;
            }
        if (block.timestamp < vestingData[i].start) {
            vested += 0;
        } else {
            uint256 vestedTmp = vestingData[i].amount +
                (vestingData[i].vestingAmount * run) /
                vestingData[i].duration -
                vestingData[i].withdrawed;
            vestingData[i].withdrawed += vestedTmp;
            vested += vestedTmp;
        }

        }

        token.transfer(msg.sender, vested);
    }

    function deposit(
        uint256 _amount,
        uint256 _vestingAmount,
        uint256 _start,
        uint256 _duration
    ) external {
        token.transferFrom(msg.sender, address(this), _amount + _vestingAmount);
        vestingData.push(
            Vesting(
                uint64(_start),
                uint64(_duration),
                _amount,
                _vestingAmount,
                0
            )
        );
    }

    function inCaseStuck(IERC20 _token, uint256 amount) external onlyOnwer {
        _token.transfer(msg.sender, amount);
    }
}
