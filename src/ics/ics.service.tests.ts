import {Test} from "@nestjs/testing";
import {ApplicationLogger} from "../logger/application-logger.service";
import {loggerMock} from "../../test/mocks/loggerMock";
import {ConfigService} from "../config/config.service";
import {IcsService} from "./ics.service";
import {plainToInstance} from "class-transformer";
import {Event} from "../ressources/events/event.entity";
import {configServiceMock} from "../../test/mocks/configServiceMock";
import {Settings} from "luxon";

const iCal = require('node-ical');
Settings.now = () => new Date(2023, 8, 25).valueOf();

describe('IcsServiceTests', () => {
    let icsService: IcsService;
    iCal.fromURL = jest.fn();

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [IcsService, {
                provide: ConfigService,
                useValue: configServiceMock({
                    ics: {
                        icsRootPath: 'https://fzsrbtest.de/termine/?ical=1'
                    }
                })
            }, {
                provide: ApplicationLogger,
                useValue: loggerMock
            }],
        }).compile();

        icsService = module.get<IcsService>(IcsService);
        jest.resetAllMocks()
    });

    it('should be defined', () => {
        expect(icsService).toBeDefined();
    });

    it('should parse events and remove duplicates', async () => {
        iCal.fromURL
            .mockImplementationOnce((url, options, callback) => callback(null, iCalRawData()))
            .mockImplementationOnce((url, options, callback) => callback(null, secondICalRawData()));

        const events = await icsService.downloadEvents();

        expect(events.length).toBe(4);
        expect(events).toEqual(expectedEvents());
    });

    it('should load current events and three month in future', async () => {
        iCal.fromURL.mockImplementation((url, options, callback) => callback(null, iCalRawData()));

        await icsService.downloadEvents();

        expect(iCal.fromURL.mock.calls[0][0]).toBe("https://fzsrbtest.de/termine/?ical=1");
        expect(iCal.fromURL.mock.calls[1][0]).toBe("https://fzsrbtest.de/termine/?ical=1&tribe-bar-date=2023-12-25");
    });

    it('should logg an reject error', async () => {
        iCal.fromURL.mockImplementation((url, options, callback) => callback(new Error('caboom')));

        const events = await icsService.downloadEvents();

        expect(events.length).toBe(0);
        expect(loggerMock.error).toBeCalled();
    });

    it('should handle nullable cats', async () => {
        iCal.fromURL.mockImplementation((url, options, callback) => callback(null, falsyData()));

        const events = await icsService.downloadEvents();

        expect(events.length).toBe(1);
        expect(events[0].category).toBe('');
    });

});

function iCalRawData(): any {
    return {
        customKey: {
            type: 'foo'
        },
        event1: {
            type: 'VEVENT',
            uid: 'event1',
            start: new Date('2020-02-17T12:00:00Z'),
            end: new Date('2020-02-17T17:00:00Z'),
            summary: 'HERBSTFANFARE',
            description: 'Beschreibung des Termins …\\n…\\n…\\n..\\n…. \\nINFOS ZUR HERBSTFANFARE',
            location: 'ENERGIE-ARENA, Wriezener Str. 30 e, Strausberg, 15344, Deutschland',
            categories: ['AUFTRITT', 'HIGHLIGHT']
        },
        event2: {
            type: 'VEVENT',
            uid: 'event2',
            start: new Date('2020-05-01T12:00:00Z'),
            end: new Date('2020-05-01T17:00:00Z'),
            summary: 'Kinderfest',
            description: 'Was genau geplant wird und vor allem durchgeführt werden kann, erfahrt ihr hier in den nächsten Wochen.',
            location: 'ENERGIE-ARENA, Wriezener Str. 30 e, Strausberg, 15344, Deutschland',
            categories: ['AUFTRITT']
        },
        event3: {
            type: 'VEVENT',
            uid: 'event3',
            start: new Date('2020-05-02T12:00:00Z'),
            end: new Date('2020-05-02T17:00:00Z'),
            summary: 'Custom',
            description: 'desc',
            location: 'ENERGIE-ARENA, Wriezener Str. 30 e, Strausberg, 15344, Deutschland',
            categories: ['AUFTRITT', 'noch was']
        }
    }
}
function secondICalRawData(): any {
    return {
        customKey: {
            type: 'foo'
        },
        event3: {
            type: 'VEVENT',
            uid: 'event3',
            start: new Date('2020-05-02T12:00:00Z'),
            end: new Date('2020-05-02T17:00:00Z'),
            summary: 'Custom',
            description: 'desc',
            location: 'ENERGIE-ARENA, Wriezener Str. 30 e, Strausberg, 15344, Deutschland',
            categories: ['AUFTRITT', 'noch was']
        },
        event4: {
            type: 'VEVENT',
            uid: 'event4',
            start: new Date('2022-05-01T12:00:00Z'),
            end: new Date('2022-05-01T17:00:00Z'),
            summary: 'einfacher Auftritt',
            description: 'irgend ein Text',
            location: 'ENERGIE-ARENA, Wriezener Str. 30 e, Strausberg, 15344, Deutschland',
            categories: ['AUFTRITT']
        },
    }
}


function falsyData(): any {
    return {
        event1: {
            type: 'VEVENT',
            uid: 'event1',
            start: new Date('2020-02-17T12:00:00Z'),
            end: new Date('2020-02-17T17:00:00Z'),
            summary: 'HERBSTFANFARE',
            description: 'Beschreibung des Termins …\\n…\\n…\\n..\\n…. \\nINFOS ZUR HERBSTFANFARE',
            location: 'ENERGIE-ARENA, Wriezener Str. 30 e, Strausberg, 15344, Deutschland',
            categories: undefined
        },
    }
}

function expectedEvents(): Event[] {
    return [
        plainToInstance(Event, {
            address: "Wriezener Str. 30 e",
            category: "HIGHLIGHT",
            description: "Beschreibung des Termins …\\n…\\n…\\n..\\n…. \\nINFOS ZUR HERBSTFANFARE",
            dress: "",
            endDate: new Date("2020-02-17T17:00:00.000Z"),
            eventName: "HERBSTFANFARE",
            isPublic: true,
            latitude: 0,
            location: "ENERGIE-ARENA",
            longitude: 0,
            participatingGroup: "",
            postcode: 15344,
            remoteId: "event1",
            startDate: new Date("2020-02-17T12:00:00.000Z"),
            summary: "HERBSTFANFARE",
            town: "Strausberg",
        }),
        plainToInstance(Event, {
            address: "Wriezener Str. 30 e",
            category: "AUFTRITT",
            description: "Was genau geplant wird und vor allem durchgeführt werden kann, erfahrt ihr hier in den nächsten Wochen.",
            dress: "",
            endDate: new Date("2020-05-01T17:00:00.000Z"),
            eventName: "Kinderfest",
            isPublic: true,
            latitude: 0,
            location: "ENERGIE-ARENA",
            longitude: 0,
            participatingGroup: "",
            postcode: 15344,
            remoteId: "event2",
            startDate: new Date("2020-05-01T12:00:00.000Z"),
            summary: "Kinderfest",
            town: "Strausberg",
        }),
        plainToInstance(Event, {
            address: "Wriezener Str. 30 e",
            category: "AUFTRITT",
            description: "desc",
            dress: "",
            endDate: new Date("2020-05-02T17:00:00.000Z"),
            eventName: "Custom",
            isPublic: true,
            latitude: 0,
            location: "ENERGIE-ARENA",
            longitude: 0,
            participatingGroup: "",
            postcode: 15344,
            remoteId: "event3",
            startDate: new Date("2020-05-02T12:00:00.000Z"),
            summary: "Custom",
            town: "Strausberg",
        }),
        plainToInstance(Event, {
            address: "Wriezener Str. 30 e",
            category: "AUFTRITT",
            description: "irgend ein Text",
            dress: "",
            endDate: new Date("2022-05-01T17:00:00Z"),
            eventName: "einfacher Auftritt",
            isPublic: true,
            latitude: 0,
            location: "ENERGIE-ARENA",
            longitude: 0,
            participatingGroup: "",
            postcode: 15344,
            remoteId: "event4",
            startDate: new Date("2022-05-01T12:00:00Z"),
            summary: "einfacher Auftritt",
            town: "Strausberg",
        })
    ]
}
