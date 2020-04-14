const {executeBash} = require("./Helper");
const log = require('fancy-log');
const chalk = require('chalk');
const projectName = "fz-srb-terminplanung-backend";
const versionOfPackage = require("./../package").version;
const releaseTag = projectName + '@' + versionOfPackage;

exports.SentryHelper = {
    async newRelease() {
        const command = 'sentry-cli releases new ' + releaseTag;
        await executeBash(command);
        log(chalk.blue('create new sentry release:'), chalk.green(releaseTag));
    },

    async uploadSourceMaps() {
        const command = 'sentry-cli releases files ' + releaseTag + ' upload-sourcemaps dist/ --rewrite';
        await executeBash(command);
        log(chalk.green('sourcemaps uploaded') );
    }
};
