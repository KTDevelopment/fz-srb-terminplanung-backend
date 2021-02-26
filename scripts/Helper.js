'use strict';
const exec = require('child_process').exec;
const log = require('fancy-log');

exports.executeBash = (command) => {
    return new Promise((resolve, reject) => {
        let error = '';
        let buffer = exec(command);

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
