'use strict';
import log from 'fancy-log';
import {exec} from "node:child_process";

export const executeBash = (command) => {
    return new Promise((resolve, reject) => {
        let error = '';
        const buffer = exec(command);

        buffer.stdout.on('data', function (data) {
            log(data.toString().trim());
        });

        buffer.stderr.on('data', function (data) {
            error += data.toString().trim();
        });

        buffer.on('exit', function (code) {
            if (code !== 0) {
                reject(error)
            }
            resolve();
        });
    })
};
