
export class SeasonsDeterminator {

    static isInWinterTime(date) {
        return date.getTime() > SeasonsDeterminator.calculateWinterTimeStartMillis(date.getFullYear()) || // date ist nach letztem sonntag in oktober
            date.getTime() < SeasonsDeterminator.calculateSummerTimeStartMillis(date.getFullYear()); // date ist vor letztem sonntag in März
    }

    private static calculateSummerTimeStartMillis(currentFullYear) {
        let date = new Date();
        date.setFullYear(currentFullYear);
        date.setHours(0, 0, 0, 0); // 00:00:00:00
        date.setMonth(2); // märz
        date.setDate(31); // letzter Tag im März
        while (date.getDay() !== 0) { // 0 ist Sonntag
            date.setDate(date.getDate() - 1)
        }
        //jetzt ist das date der letzte sonntag im märz
        return date.getTime();
    }

    private static calculateWinterTimeStartMillis(currentFullYear) {
        let date = new Date();
        date.setFullYear(currentFullYear);
        date.setHours(0, 0, 0, 0); // 00:00:00:00
        date.setMonth(9); // oktober
        date.setDate(31); // letzter Tag im Oktober
        while (date.getDay() !== 0) { // 0 ist Sonntag
            date.setDate(date.getDate() - 1)
        }
        //jetzt ist das date der letzte sonntag im Oktober
        return date.getTime();
    }
}