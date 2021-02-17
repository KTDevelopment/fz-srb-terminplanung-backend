import {plainToClass} from "class-transformer";
import {Event} from "../../../src/ressources/events/event.entity";

export function getNonPublicEvents() {
    return [
        plainToClass(Event, {
            "remoteId": "30",
            "startDate": "2018-08-17T03:24:00",
            "endDate": "2018-08-18T03:24:00",
            "summary": "19. Herbstfanfare 2018 - EnergieARENA - 03.10.2018 - 17:00 - 21:00",
            "description": "Abend-Show-Veranstaltung des Fanfarenzuges des KSC Strausberg e. V.Saisonabschluss und Dankeschön für alle Aktiven, Eltern, Helfer, Förderer, Sponsoren, Fan´s, Freunde und alle Strausberger...",
            "eventName": "19. Herbstfanfare 2018",
            "location": "EnergieARENA",
            "address": "Wriezener Str.",
            "postcode": 1234,
            "town": "Strausberg",
            "dress": "Showkleidung",
            "participatingGroup": "ALLE",
            "category": "HIGHLIGHT",
            "longitude": 123.23,
            "latitude": 321.23,
            "isPublic": false,
            "creationDate": "2018-09-20T20:56:00.891Z",
            "updateDate": "2018-09-20T20:56:00.891Z",
            "version": 1
        }),
        plainToClass(Event, {
            "remoteId": "40",
            "startDate": "2018-07-17T03:24:00",
            "endDate": "2018-07-18T03:24:00",
            "summary": "Oktoberfest Zinndorf - Oktoberfest Zinndorf - 05.10.2018 - 21:30 - 22:45",
            "description": "",
            "eventName": "Oktoberfest Zinndorf",
            "location": "Oktoberfest Zinndorf",
            "address": "Festzelt auf dem Anger",
            "postcode": 1234,
            "town": "Zinndorf",
            "dress": "-",
            "participatingGroup": "Drumline",
            "category": "AUFTRITT",
            "longitude": 123.23,
            "latitude": 321.23,
            "isPublic": false,
            "creationDate": "2018-09-20T20:56:00.907Z",
            "updateDate": "2018-09-20T20:56:00.907Z",
            "version": 1
        })
    ]
}

export function getPublicEvents() {
    let ms = new Date().getTime() + 86400000;
    let tomorrow = new Date(ms);
    return [
        plainToClass(Event, {
            "remoteId": "10",
            "startDate": "2018-09-17T03:24:00",
            "endDate": "2018-09-18T03:24:00",
            "summary": "Oktoberfest Zinndorf - Oktoberfest Zinndorf - 05.10.2018 - 21:30 - 22:45",
            "description": "",
            "eventName": "Oktoberfest Zinndorf",
            "location": "Oktoberfest Zinndorf",
            "address": "Festzelt auf dem Anger",
            "postcode": 1234,
            "town": "Zinndorf",
            "dress": "-",
            "participatingGroup": "Drumline",
            "category": "AUFTRITT",
            "longitude": 123.23,
            "latitude": 321.23,
            "isPublic": true,
            "creationDate": "2018-09-20T20:56:00.907Z",
            "updateDate": "2018-09-20T20:56:00.907Z",
            "version": 1
        }),
        plainToClass(Event, {
            "remoteId": "20",
            "startDate": new Date().toISOString(),
            "endDate": tomorrow.toISOString(),
            "summary": "Oktoberfest Zinndorf - Oktoberfest Zinndorf - 05.10.2018 - 21:30 - 22:45",
            "description": "",
            "eventName": "Oktoberfest Zinndorf",
            "location": "Oktoberfest Zinndorf",
            "address": "Festzelt auf dem Anger",
            "postcode": 1234,
            "town": "Zinndorf",
            "dress": "-",
            "participatingGroup": "Drumline",
            "category": "AUFTRITT",
            "longitude": 123.23,
            "latitude": 321.23,
            "isPublic": true,
            "creationDate": "2018-09-20T20:56:00.907Z",
            "updateDate": "2018-09-20T20:56:00.907Z",
            "version": 1
        }),
    ]
}

export function getEventThatShouldBeRemoved() {
    return plainToClass(Event, {
        "remoteId": "100",
        "startDate": '2100-01-01T00:00:00',
        "endDate": '2100-01-02T00:00:00',
        "summary": "Oktoberfest Zinndorf - Oktoberfest Zinndorf - 05.10.2018 - 21:30 - 22:45",
        "description": "",
        "eventName": "Oktoberfest Zinndorf",
        "location": "Oktoberfest Zinndorf",
        "address": "Festzelt auf dem Anger",
        "postcode": 1234,
        "town": "Zinndorf",
        "dress": "-",
        "participatingGroup": "Drumline",
        "category": "AUFTRITT",
        "longitude": 123.23,
        "latitude": 321.23,
        "isPublic": true,
        "creationDate": "2018-09-20T20:56:00.907Z",
        "updateDate": "2018-09-20T20:56:00.907Z",
        "version": 1
    });
}
