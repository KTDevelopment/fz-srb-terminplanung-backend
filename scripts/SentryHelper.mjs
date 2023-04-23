import log from 'fancy-log';
import chalk from "chalk";
import {readFile} from 'fs/promises';
import {executeBash} from "./Helper.mjs";

const {name, version} = JSON.parse(
    await readFile(
        new URL('./../package.json', import.meta.url)
    )
);
const releaseTag = name + '@' + version;

export const SentryHelper = {
    async newRelease() {
        const command = 'sentry-cli releases new ' + releaseTag;
        await executeBash(command);
        log(chalk.blue('create new sentry release:'), chalk.green(releaseTag));
    },

    async uploadSourceMaps() {
        const command = 'sentry-cli releases files ' + releaseTag + ' upload-sourcemaps dist/ --rewrite';
        await executeBash(command);
        log(chalk.green('sourcemaps uploaded'));
    }
};
