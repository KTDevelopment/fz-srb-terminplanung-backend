'use strict';
const fs = require("fs");
const versionOfPackage = require("./../package").version;
const log = require('fancy-log');
const chalk = require('chalk');

exports.increaseJSVersion = () => {
    fs.writeFileSync("src/version.json", JSON.stringify({version: versionOfPackage}));
    log(chalk.blue('updated src to version:'), chalk.green(versionOfPackage));
};
