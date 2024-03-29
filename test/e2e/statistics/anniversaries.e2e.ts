import {getAuthenticated} from "../_common/testRequests";
import {bodyItemMatchesObject, bodyLengthGreaterOrEqual} from "../_common/expectations";
import {adminToken} from "../_common/helper";
import {setUpE2E} from "../setup/e2e-setup";

setUpE2E()

describe('Anniversaries', () => {
    it('should get all anniversaries', async () => {
        return getAuthenticated('/anniversaries', await adminToken())
            .expect(200)
            .expect(res => bodyLengthGreaterOrEqual(res, 3))
            .expect(res => bodyItemMatchesObject(res, 1, {
                memberId: 2,
                statisticsEntryId: 1,
                performanceCount: 100
            }));
    });

    it('should get all anniversaries for member', async () => {
        return getAuthenticated('/anniversaries')
            .expect(200)
            .expect(res => bodyLengthGreaterOrEqual(res, 1))
            .expect(res => bodyItemMatchesObject(res, 0, {
                memberId: 6,
                statisticsEntryId: 1,
                performanceCount: 2000
            }));
    });

    it('should get anniversaries by memberId for admin', async () => {
        return getAuthenticated('/anniversaries', await adminToken())
            .query('filter=memberId||eq||3')
            .expect(200)
            .expect(res => bodyLengthGreaterOrEqual(res, 1))
            .expect(res => bodyItemMatchesObject(res, 0, {
                memberId: 3,
                statisticsEntryId: 1,
                performanceCount: 100
            }));
    });

    it('should get anniversaries by memberId for member', async () => {
        return getAuthenticated('/anniversaries')
            .query('filter=memberId||eq||6')
            .expect(200)
            .expect(res => bodyLengthGreaterOrEqual(res, 1))
            .expect(res => bodyItemMatchesObject(res, 0, {
                memberId: 6,
                statisticsEntryId: 1,
                performanceCount: 2000
            }));
    });
});
