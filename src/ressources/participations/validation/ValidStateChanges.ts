export const KEY_FOR_SELF = 'forSelf';
export const KEY_FOR_OTHER = 'forOther';
export const VALID_CHANGES_FOR_MEMBER = {
    [KEY_FOR_SELF]: {
        0: [4],
        1: [2, 3],
        2: [3],
        3: [2],
        4: [],
        5: [],
    },
    [KEY_FOR_OTHER]: {
        0: [],
        1: [],
        2: [],
        3: [],
        4: [],
        5: [],
    }
};

export const VALID_CHANGES_FOR_PLANNER_ADMIN_WEBADMINS = {
    [KEY_FOR_SELF]: {
        0: [2, 3],
        1: [2, 3],
        2: [3],
        3: [2],
        4: [],
        5: [],
    },
    [KEY_FOR_OTHER]: {
        0: [1, 2, 3], //(2,3) zugesagt und abgesagt wenn keine Devices
        1: [0],
        2: [3], //(3) abgesagt wenn keine Devices
        3: [2], //(2) zugesagt wenn keine Devices
        4: [2, 5],
        5: [1],
    }
};
