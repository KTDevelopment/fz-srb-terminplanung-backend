import {SentryHelper} from "./scripts/SentryHelper.mjs";
import gulp from 'gulp';

gulp.task('releaseToSentry',(cb) => {
    SentryHelper.newRelease()
        .then(() => SentryHelper.uploadSourceMaps())
        .then(cb)
        .catch(e => {
            console.log('error while sentryRelease: ', e);
            process.exit(1)
        })
});

gulp.task('sourceMapsToSentry',(cb) => {
    SentryHelper.uploadSourceMaps()
        .then(cb)
        .catch(e => {
            console.log('error while sentryRelease: ', e);
            process.exit(1)
        })
});
