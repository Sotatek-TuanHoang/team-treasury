pragma solidity ^0.8.0;

import "./SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Strike's Treasury Contract
 * @author Strike
 */

interface IERC20 {
    function transfer(address recipient, uint256 amount) external returns (bool);
    function balanceOf(address who) external view returns (uint256);
} 

contract TeamTreasure is Ownable {
    using SafeMath for uint;
    /// @notice Emitted when owner withdraw amount;
    event WithdrawByOwner(address token, uint amount);

    uint public claimedAmount;
    IERC20 public token;
    uint public startTimestamp;
    uint public period = 30 days;
    uint public unlockAmountPeriod = 250000000000000000000000;

    constructor(IERC20 _token) public Ownable() {
        token = _token;
        startTimestamp = block.timestamp;
    }
    function withdrawAllUnlockToken() public onlyOwner {
        uint unlockAmount = getUnlockedAmount();
        require(unlockAmount > 0, "INVALID AMOUNT");
        claimedAmount = claimedAmount.add(unlockAmount);
        token.transfer(owner(), unlockAmount);
        emit WithdrawByOwner(address(token), unlockAmount);
    }

    function getUnlockedAmount() view public returns (uint) {
        uint currentTime = block.timestamp;
        uint numberPeriodPass = currentTime.sub(startTimestamp).div(period);
        uint amountByPeriod = unlockAmountPeriod.mul(numberPeriodPass);
        uint unlockAmount = amountByPeriod.sub(claimedAmount);
        uint maximumAvalableAmount = token.balanceOf(address(this));
        if (unlockAmount > maximumAvalableAmount) {
            unlockAmount = maximumAvalableAmount;
        }
        return unlockAmount;
    }

    function getLockAmount() view public returns (uint) {
        uint unlockAmount = getUnlockedAmount();
        uint maximumAvalableAmount = token.balanceOf(address(this));
        return maximumAvalableAmount.sub(unlockAmount);
    }

    function getClaimedAmount() view public returns (uint) {
        return claimedAmount;
    }

}
