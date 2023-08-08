import {plainToInstance} from "class-transformer";
import {Event} from "../../../src/ressources/events/event.entity";
import {TestResponses} from "./TestResponses";

export function getNonPublicEvents() {
    return [
        {
            "remoteId": "30",
            "startDate": "2018-08-17T03:24:00Z",
            "endDate": "2018-08-18T03:24:00Z",
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
        },
        {
            "remoteId": "40",
            "startDate": "2018-07-17T03:24:00Z",
            "endDate": "2018-07-18T03:24:00Z",
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
        }
    ].map(it => {
        return plainToInstance(Event, {
            ...it,
            startDate: new Date(it.startDate),
            endDate: new Date(it.endDate),
            creationDate: new Date(it.creationDate),
            updateDate: new Date(it.updateDate),
        })
    })
}

export function getPublicEvents() {
    const ms = new Date().getTime() + 86400000;
    const tomorrow = new Date(ms);
    return [
        {
            "remoteId": "10",
            "startDate": "2018-09-17T03:24:00Z",
            "endDate": "2018-09-18T03:24:00Z",
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
        },
        {
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
        },
        TestResponses.unfinishedEvent(),
        {
            "eventId": "12",
            "remoteId": "50",
            "startDate": "2018-09-17T03:24:00Z",
            "endDate": "2018-09-18T03:24:00Z",
            "summary": "etwas was kein Auftritt ist",
            "description": "",
            "eventName": "Oktoberfest Zinndorf",
            "location": "Oktoberfest Zinndorf",
            "address": "Festzelt auf dem Anger",
            "postcode": 1234,
            "town": "Zinndorf",
            "dress": "-",
            "participatingGroup": "Drumline",
            "category": "Meeting",
            "longitude": 123.23,
            "latitude": 321.23,
            "isPublic": true,
            "creationDate": "2018-09-20T20:56:00.907Z",
            "updateDate": "2018-09-20T20:56:00.907Z",
            "version": 1
        },
    ].map(it => {
        return plainToInstance(Event, {
            ...it,
            startDate: new Date(it.startDate),
            endDate: new Date(it.endDate),
            creationDate: new Date(it.creationDate),
            updateDate: new Date(it.updateDate),
        })
    })
}

export function getEventThatShouldBeRemoved() {
    return plainToInstance(Event, {
        "remoteId": "100",
        "startDate": new Date('2100-01-01T00:00:00Z'),
        "endDate": new Date('2100-01-02T00:00:00Z'),
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
        "creationDate": new Date("2018-09-20T20:56:00.907Z"),
        "updateDate": new Date("2018-09-20T20:56:00.907Z"),
        "version": 1
    });
}
