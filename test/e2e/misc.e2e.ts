import {bodyMatchesObject} from "./_common/expectations";
import {get, getAuthenticated, postAuthenticated} from "./_common/testRequests";
import {adminToken} from "./_common/helper";
import {existsSync, unlinkSync} from "fs";
import {setUpE2E} from "./setup/e2e-setup";

cleanUpFileStorage();
setUpE2E()

describe('Misc', () => {
    describe('/GET AppStoreLinks', () => {
        it('it should GET misc without authorization', async () => {
            return get('/misc')
                .expect(200)
                .expect((res) => bodyMatchesObject(res, {
                    "description": "misc stuff",
                }))
        });
        it('it should GET appStoreLinks without authorization', async () => {
            return get('/misc/fzSrbAppStoreLinks')
                .expect(200)
                .expect((res) => bodyMatchesObject(res, {
                    "androidLink": "https://play.google.com/store/apps/details?id=com.fanfarenzugstrausbergapp",
                    "iosLink": "https://itunes.apple.com/de/app/fanfarenzug-strausberg-app/id1439365342?mt=8",
                }));
        });
        it('it should POST appStoreLinks with authorization', async () => {
            return postAuthenticated('/misc/fzSrbAppStoreLinks', await adminToken())
                .send({
                    androidLink: "https://play.google.com/foo",
                    iosLink: "https://itunes.apple.com/de/bar",
                })
                .expect(201)
                .expect((res) => bodyMatchesObject(res, {
                    "androidLink": "https://play.google.com/foo",
                    "iosLink": "https://itunes.apple.com/de/bar",
                }));
        });
        it('it should POST dropBoxLinks with authorization', async () => {
            return postAuthenticated('/misc/dropBoxLinks', await adminToken())
                .send({
                    main: "https://dropBox.com/main",
                    music: "https://dropBox.com/music",
                    drill: "https://dropBox.com/drill",
                })
                .expect(201)
                .expect((res) => bodyMatchesObject(res, {
                    "main": "https://dropBox.com/main",
                    "music": "https://dropBox.com/music",
                    "drill": "https://dropBox.com/drill",
                }));
        });
        it('it should GET dropBoxLinks without authorization', async () => {
            return getAuthenticated('/misc/dropBoxLinks')
                .expect(200)
                .expect((res) => bodyMatchesObject(res, {
                    "main": "https://dropBox.com/main",
                    "music": "https://dropBox.com/music",
                    "drill": "https://dropBox.com/drill",
                }));
        });
    });
});

function cleanUpFileStorage() {
    const links = [
        'test/test-file-storage/dropBoxLinks.json',
        'test/test-file-storage/fzAppStoreLinks.json',
    ];
    links.forEach(link => {
        if(existsSync(link)) {
            unlinkSync(link)
        }
    });
}
