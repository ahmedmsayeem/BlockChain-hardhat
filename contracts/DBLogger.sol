// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DBLogger {
    event DBChange(
        string operation,     // "INSERT", "UPDATE", "DELETE"
        string tableName,
        string rowId,
        string dataHash,
        string data,          // NEW: actual data (JSON string)
        uint timestamp        // UNIX timestamp
    );

    function logChange(
        string calldata operation,
        string calldata tableName,
        string calldata rowId,
        string calldata dataHash,
        string calldata data  // NEW: pass the raw data
    ) external {
        emit DBChange(operation, tableName, rowId, dataHash, data, block.timestamp);
    }
}
