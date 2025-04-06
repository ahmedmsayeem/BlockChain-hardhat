// import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
const {buildModule} = require("@nomicfoundation/hardhat-ignition/modules");
const LoggerModule = buildModule("LoggerModule", (m) => {
  const logger = m.contract("DBLogger");
  return { logger };
});

module.exports = LoggerModule;
