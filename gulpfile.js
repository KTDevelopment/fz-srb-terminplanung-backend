const {increaseJSVersion} = require("./scripts/VersionsHelper");
const {SentryHelper} = require("./scripts/SentryHelper");

function increaseVersion(cb) {
    try {
        increaseJSVersion();
        cb();
    } catch (e) {
        console.log('error while increasing Versions: ', e)
    }
}

function sentryRelease(cb) {
    SentryHelper.newRelease()
        .then(() => SentryHelper.uploadSourceMaps())
        .then(cb)
        .catch(e => {
            console.log('error while sentryRelease: ', e);
            process.exit(1)
        })
}

function uploadSourceMapsToSentry(cb) {
    SentryHelper.uploadSourceMaps()
        .then(cb)
        .catch(e => {
            console.log('error while sentryRelease: ', e);
            process.exit(1)
        })
}

exports.increaseVersion = increaseVersion;
exports.sourceMapsToSentry = uploadSourceMapsToSentry;
exports.releaseToSentry = sentryRelease;
