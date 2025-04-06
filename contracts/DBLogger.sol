// contracts/DBLogger.sol
// A minimal contract to log CRUD operations
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DBLogger {
    event DBChange(
        string operation, // "INSERT", "UPDATE", "DELETE"
        string tableName,
        string rowId,
        string dataHash,
        uint timestamp
    );

    function logChange(
        string calldata operation,
        string calldata tableName,
        string calldata rowId,
        string calldata dataHash
    ) external {
        emit DBChange(operation, tableName, rowId, dataHash, block.timestamp);
    }
}
