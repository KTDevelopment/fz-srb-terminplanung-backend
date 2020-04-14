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

exports.parseArguments = (argList) => {
    let arg = {}, a, opt, thisOpt, curOpt;
    for (a = 0; a < argList.length; a++) {
        thisOpt = argList[a].trim();
        opt = thisOpt.replace(/^\-+/, '');

        if (opt === thisOpt) {
            // argument value
            if (curOpt) arg[curOpt] = opt;
            curOpt = null;
        } else {
            // argument name
            curOpt = opt;
            arg[curOpt] = true;
        }
    }

    return arg;
};
