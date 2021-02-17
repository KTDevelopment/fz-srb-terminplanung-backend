import {Test} from "@nestjs/testing";
import {ApplicationLogger} from "../../../src/logger/application-logger.service";
import {loggerMock} from "../mocks/loggerMock";
import {ConfigService} from "../../../src/config/config.service";
import {GeoService} from "../../../src/geo/geo.service";
import {HttpService} from "@nestjs/common";
import {httpServiceMock} from "../mocks/httpServiceMock";
import {plainToClass} from "class-transformer";
import {Event} from "../../../src/ressources/events/event.entity";


describe('FcmServiceTests', () => {
    let geoService: GeoService;
    let configServiceMock = {
        config: {
            ics: {
                icsRootPath: 'fooUrl'
            }
        }
    }

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [GeoService, {
                provide: ConfigService,
                useValue: configServiceMock
            }, {
                provide: ApplicationLogger,
                useValue: loggerMock
            }, {
                provide: HttpService,
                useValue: httpServiceMock
            }],
        }).compile();

        geoService = module.get<GeoService>(GeoService);
        jest.resetAllMocks()
    });

    it('should be defined', () => {
        expect(geoService).toBeDefined();
    });

    it('should load coordinates', async () => {
        httpServiceMock.get.mockReturnValue({
            toPromise: jest.fn().mockResolvedValue({data: [{lat: 1, lon: 2}]})
        })
        let event = testEvent();

        event = await geoService.enrichEventWithGeoCoordinates(event);

        expect(event.latitude).toEqual(1);
        expect(event.longitude).toEqual(2);
    });

    it('should handle empty http response', async () => {
        httpServiceMock.get.mockReturnValue({
            toPromise: jest.fn().mockResolvedValue({data: []})
        })
        let event = testEvent();

        event = await geoService.enrichEventWithGeoCoordinates(event);

        expect(event.latitude).toEqual(0);
        expect(event.longitude).toEqual(0);
    });

    it('should handle and log errors', async () => {
        httpServiceMock.get.mockReturnValue({
            toPromise: jest.fn().mockRejectedValue(new Error('caboom'))
        })
        let event = testEvent();

        event = await geoService.enrichEventWithGeoCoordinates(event);

        expect(loggerMock.error).toBeCalled();
        expect(event.latitude).toEqual(0);
        expect(event.longitude).toEqual(0);
    });


});

function testEvent() {
    return plainToClass(Event, {
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
    });
}
