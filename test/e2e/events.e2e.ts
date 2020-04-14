import {bodyLengthGreaterOrEqual, firstBodyItemMatchesObject} from "./_common/expectations";
import {get} from "./_common/testRequests";


describe('Events', () => {
    describe('/GET events', () => {
        it('it should GET all events', async () => {
            return get('/events')
                .expect(200)
                .expect((res) => bodyLengthGreaterOrEqual(res, 4))
                .expect((res) => firstBodyItemMatchesObject(res, {
                    "address": "Festzelt auf dem Anger",
                    "category": "AUFTRITT",
                    "description": "",
                    "dress": "-",
                    "eventName": "Oktoberfest Zinndorf",
                    "isPublic": true,
                    "latitude": 321.23,
                    "location": "Oktoberfest Zinndorf",
                    "longitude": 123.23,
                    "participatingGroup": "Drumline",
                    "postcode": 1234,
                    "summary": "Oktoberfest Zinndorf - Oktoberfest Zinndorf - 05.10.2018 - 21:30 - 22:45",
                    "town": "Zinndorf",
                    "wpId": 10,
                }))
        });
        it('it should GET all public events', async () => {
            return get('/events')
                .query('filter=isPublic||eq||true')
                .expect(200)
                .expect((res) => bodyLengthGreaterOrEqual(res, 2));
        });
    });
});
