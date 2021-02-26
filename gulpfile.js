const {SentryHelper} = require("./scripts/SentryHelper");

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

exports.sourceMapsToSentry = uploadSourceMapsToSentry;
exports.releaseToSentry = sentryRelease;
