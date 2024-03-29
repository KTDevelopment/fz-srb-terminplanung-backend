import {Role} from "../src/ressources/roles/role.entity";
import {Member} from "../src/ressources/members/member.entity";
import {plainToInstance} from "class-transformer";
import {Event} from "../src/ressources/events/event.entity";
import {FcmPayload} from "../src/fcm/models/FcmPayload";
import {Device, DEVICE_TYPE_ANDROID, DEVICE_TYPE_IOS} from "../src/ressources/devices/device.entity";

export function getTestMember() {
    const role = new Role();
    role.roleId = 200;
    role.roleName = 'member';
    const member = new Member();
    member.roles = [role];
    member.memberId = 2;
    member.firstName = 'memberFirstName';
    member.lastName = 'memberLastName';
    member.email = 'member@email.de';
    member.devices = [];
    return member;
}

export function getTestPlanner() {
    const role = new Role();
    role.roleId = 100;
    role.roleName = 'planner';
    const planner = new Member();
    planner.roles = [role];
    planner.memberId = 1;
    planner.firstName = 'plannerFirstName';
    planner.lastName = 'plannerLastName';
    planner.email = 'plannerMail';
    return planner;
}

export function getPlannerList() {
    const planner1 = getTestPlanner();
    planner1.devices = [];
    const planner2 = getTestPlanner();
    planner2.devices = [];
    planner2.firstName = "planner2FistName";
    planner2.lastName = "planner2LastName";
    planner2.memberId = 2;
    planner2.email = 'planner2Mail';
    return [planner1, planner2]
}

export function getPasswordResetToken() {
    return 'jwt'
}

export function getTestEvent() {
    const ms = new Date().getTime() + 86400000;
    const tomorrow = new Date(ms);
    return plainToInstance(Event, {
        eventId: 2,
        wpId: 10,
        startDate: new Date(),
        endDate: tomorrow,
        summary: 'summary',
        description: 'description',
        eventName: 'foo_test_event',
        location: 'location',
        address: 'address',
        postcode: 1234,
        town: 'town',
        dress: 'dress',
        participatingGroup: 'participatingGroup',
        category: 'category',
        longitude: 123.23,
        latitude: 321.23,
        isPublic: true,
    });
}

export function testFcmPayload(eventId: number = null) {
    const payload = (new FcmPayload())
        .setType('999')
        .setMessage('foo_test_message')
        .setTitle('foo_title');

    if (eventId) {
        payload.setEventId(eventId + "")
    }

    return payload
}

export function getPlannerListWithOutDevices() {
    const planner1 = getTestPlanner();
    planner1.devices = [];
    const planner2 = getTestPlanner();
    planner2.devices = [];
    planner2.firstName = "planner2FistName";
    planner2.memberId = 2;
    return [planner1, planner2]
}

export function getPlannerListWithDevices() {
    const planner1 = getTestPlanner();
    planner1.devices = [getAndroidTestDevice()];
    const planner2 = getTestPlanner();
    planner2.devices = [getIosTestDevice()];
    planner2.firstName = "planner2FistName";
    planner2.memberId = 2;
    return [planner1, planner2]
}

export function getAndroidTestDevice() {
    const device = new Device();
    device.registrationId = "androidRegistrationId";
    device.deviceId = 1;
    device.deviceType = DEVICE_TYPE_ANDROID;
    return device;
}

export function getIosTestDevice() {
    const device = new Device();
    device.registrationId = "iosRegistrationId";
    device.deviceId = 2;
    device.deviceType = DEVICE_TYPE_IOS;
    return device;
}

export function getTestMemberList() {
    return [getTestMember(), getTestMember()]
}

export function getTestMemberListWithDevices() {
    return [getTestMemberWithDevices(), getTestMemberWithDevices()]
}

export function getTestMemberWithDevices() {
    const member = getTestMember();
    member.devices = [
        getIosTestDevice(),
        getAndroidTestDevice()
    ];
    return member;
}
