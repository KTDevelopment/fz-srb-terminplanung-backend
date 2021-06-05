import {Test} from "@nestjs/testing";
import {ApplicationLogger} from "../logger/application-logger.service";
import {loggerMock} from "../../test/mocks/loggerMock";
import {ConfigService} from "../config/config.service";
import {IcsService} from "./ics.service";
import {plainToClass} from "class-transformer";
import {Event} from "../ressources/events/event.entity";

const iCal = require('node-ical');

describe('FcmServiceTests', () => {
    let icsService: IcsService;
    let configServiceMock = {
        config: {
            ics: {
                icsRootPath: 'fooUrl'
            }
        }
    }
    iCal.fromURL = jest.fn();

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [IcsService, {
                provide: ConfigService,
                useValue: configServiceMock
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

    it('should parse events', async () => {
        iCal.fromURL.mockImplementation((url, options, callback) => callback(null, iCalRawData()));

        const events = await icsService.downloadEvents();

        expect(events.length).toBe(3);
        expect(events).toEqual(expectedEvents());
    });

    it('should logg an reject error', async () => {
        iCal.fromURL.mockImplementation((url, options, callback) => callback(new Error('caboom')));

        await expect(icsService.downloadEvents()).rejects.toThrow('caboom');

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
        plainToClass(Event, {
            address: "Wriezener Str. 30 e",
            category: "HIGHLIGHT",
            description: "Beschreibung des Termins …\\n…\\n…\\n..\\n…. \\nINFOS ZUR HERBSTFANFARE",
            dress: "",
            endDate: new Date("2020-02-17T18:00:00.000Z"),
            eventName: "HERBSTFANFARE",
            isPublic: true,
            latitude: 0,
            location: "ENERGIE-ARENA",
            longitude: 0,
            participatingGroup: "",
            postcode: 15344,
            remoteId: "event1",
            startDate: new Date("2020-02-17T13:00:00.000Z"),
            summary: "HERBSTFANFARE",
            town: "Strausberg",
        }),
        plainToClass(Event, {
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
        plainToClass(Event, {
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
    ]
}
