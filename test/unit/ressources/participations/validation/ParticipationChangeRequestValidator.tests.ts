import {ParticipationChangeRequestValidator} from "../../../../../src/ressources/participations/validation/ParticipationChangeRequestValidator";
import {ParticipationChangeRequest} from "../../../../../src/ressources/participations/validation/ParticipationChangeRequest";
import {Member} from "../../../../../src/ressources/members/member.entity";
import {Participation} from "../../../../../src/ressources/participations/participation.entity";
import {ParticipationState} from "../../../../../src/ressources/participations/participation-states/participation-state.entity";
import {Section} from "../../../../../src/ressources/sections/section.entity";
import {Role} from "../../../../../src/ressources/roles/role.entity";
import {Event} from "../../../../../src/ressources/events/event.entity";
import {plainToClass} from "class-transformer";
import {suite, test} from "@testdeck/jest";

@suite
class ParticipationChangeRequestValidatorTests {

    private validator: ParticipationChangeRequestValidator;
    private request: ParticipationChangeRequest;
    private callingMember: Member;
    private newStateId: number;
    private expectedResult: boolean;
    private member: Member;
    private testParticipation: Participation;

    before() {
        this.validator = new ParticipationChangeRequestValidator();
        this.request = new ParticipationChangeRequest();
        this.callingMember = null;
        this.newStateId = null;
        this.member = new Member();
        this.testParticipation = new Participation();
        this.testParticipation.participationState = new ParticipationState();
        this.testParticipation.member = new Member();
    }

    @test
    async validateRequestShouldReturnFalseWhenRequestIsIncomplete() {
        this.newStateId = 5;

        this.expectedResult = false;

        await this.testValidator();
    }

    @test
    async validateRequestShouldReturnTrueForRequestForFinalState6AndAdmin() {
        this.testParticipation.event = getTestEventWhichLiesInPast();
        this.callingMember = getAdminMember();
        this.newStateId = 6;

        this.expectedResult = true;

        await this.testValidator();
    }

    @test
    async validateRequestShouldReturnTrueForRequestForFinalState7AndAdmin() {
        this.testParticipation.event = getTestEventWhichLiesInPast();
        this.callingMember = getAdminMember();
        this.newStateId = 7;

        this.expectedResult = true;

        await this.testValidator();
    }

    @test
    async validateRequestShouldReturnTrueForRequestForFinalState6AndPlanner() {
        this.newStateId = 6;
        this.testParticipation.event = getTestEventWhichLiesInPast();
        this.callingMember = getPlannerMember();

        this.expectedResult = true;

        await this.testValidator();
    }

    @test
    async validateRequestShouldReturnTrueForRequestForFinalState7AndPlanner() {
        this.newStateId = 7;
        this.testParticipation.event = getTestEventWhichLiesInPast();
        this.callingMember = getPlannerMember();

        this.expectedResult = true;

        await this.testValidator();
    }

    @test
    async validateRequestShouldReturnFalseForRequestForState1WhenEventLiesInPast() {
        this.newStateId = 1;
        this.testParticipation.event = getTestEventWhichLiesInPast();
        this.callingMember = getPlannerMember();

        this.expectedResult = false;

        await this.testValidator();
    }

    @test
    async validateCombinationFrom0To2AdminSelfFuture() {
        this.testParticipation = getParticipationByStateId(0);
        this.newStateId = 2;
        this.callingMember = getAdminMember();
        this.testParticipation.member = this.callingMember;
        this.testParticipation.event = getTestEvent();

        this.expectedResult = true;

        await this.testValidator();
    }

    @test
    async validateCombinationFrom0To3AdminSelfFuture() {
        this.testParticipation = getParticipationByStateId(0);
        this.newStateId = 3;
        this.callingMember = getAdminMember();
        this.testParticipation.member = this.callingMember;
        this.testParticipation.event = getTestEvent();

        this.expectedResult = true;

        await this.testValidator();
    }

    @test
    async validateFALSECombinationFrom0To4AdminSelfFuture() {
        this.testParticipation = getParticipationByStateId(0);
        this.newStateId = 4;
        this.callingMember = getAdminMember();
        this.testParticipation.member = this.callingMember;
        this.testParticipation.event = getTestEvent();

        this.expectedResult = false;

        await this.testValidator();
    }

    @test
    async validateCombinationFrom1To2AdminSelfFuture() {
        this.testParticipation = getParticipationByStateId(1);
        this.newStateId = 2;
        this.callingMember = getAdminMember();
        this.testParticipation.member = this.callingMember;
        this.testParticipation.event = getTestEvent();

        this.expectedResult = true;

        await this.testValidator();
    }

    @test
    async validateCombinationFrom1To3AdminSelfFuture() {
        this.testParticipation = getParticipationByStateId(1);
        this.newStateId = 3;
        this.callingMember = getAdminMember();
        this.testParticipation.member = this.callingMember;
        this.testParticipation.event = getTestEvent();

        this.expectedResult = true;

        await this.testValidator();
    }

    @test
    async validateCombinationFrom2To3AdminSelfFuture() {
        this.testParticipation = getParticipationByStateId(2);
        this.newStateId = 3;
        this.callingMember = getAdminMember();
        this.testParticipation.member = this.callingMember;
        this.testParticipation.event = getTestEvent();

        this.expectedResult = true;

        await this.testValidator();
    }

    @test
    async validateCombinationFrom3To2AdminSelfFuture() {
        this.testParticipation = getParticipationByStateId(3);
        this.newStateId = 2;
        this.callingMember = getAdminMember();
        this.testParticipation.member = this.callingMember;
        this.testParticipation.event = getTestEvent();

        this.expectedResult = true;

        await this.testValidator();
    }

    @test
    async validateCombinationFrom3To2PlannerSelfFuture() {
        this.testParticipation = getParticipationByStateId(3);
        this.newStateId = 2;
        this.callingMember = getPlannerMember();
        this.testParticipation.member = this.callingMember;
        this.testParticipation.event = getTestEvent();

        this.expectedResult = true;

        await this.testValidator();
    }

    @test
    async validateCombinationFrom0To4MemberSelfFuture() {
        this.testParticipation = getParticipationByStateId(0);
        this.newStateId = 4;
        this.callingMember = getMember();
        this.testParticipation.member = this.callingMember;
        this.testParticipation.event = getTestEvent();

        this.expectedResult = true;

        await this.testValidator();
    }

    @test
    async validateCombinationFrom1To2MemberSelfFuture() {
        this.testParticipation = getParticipationByStateId(1);
        this.newStateId = 2;
        this.callingMember = getMember();
        this.testParticipation.member = this.callingMember;
        this.testParticipation.event = getTestEvent();

        this.expectedResult = true;

        await this.testValidator();
    }

    @test
    async validateCombinationFrom1To3MemberSelfFuture() {
        this.testParticipation = getParticipationByStateId(1);
        this.newStateId = 3;
        this.callingMember = getMember();
        this.testParticipation.member = this.callingMember;
        this.testParticipation.event = getTestEvent();

        this.expectedResult = true;

        await this.testValidator();
    }

    @test
    async validateCombinationFrom2To3MemberSelfFuture() {
        this.testParticipation = getParticipationByStateId(2);
        this.newStateId = 3;
        this.callingMember = getMember();
        this.testParticipation.member = this.callingMember;
        this.testParticipation.event = getTestEvent();

        this.expectedResult = true;

        await this.testValidator();
    }

    @test
    async validateCombinationFrom3To2MemberSelfFuture() {
        this.testParticipation = getParticipationByStateId(3);
        this.newStateId = 2;
        this.callingMember = getMember();
        this.testParticipation.member = this.callingMember;
        this.testParticipation.event = getTestEvent();

        this.expectedResult = true;

        await this.testValidator();
    }

    @test
    async validateFALSECombinationFrom0To1MemberOtherFuture() {
        this.testParticipation = getParticipationByStateId(0);
        this.newStateId = 1;
        this.callingMember = getMember();
        this.testParticipation.member = getPlannerMember();
        this.testParticipation.event = getTestEvent();

        this.expectedResult = false;

        await this.testValidator();
    }

    @test
    async validateCombinationFrom0To1PlannerOtherFuture() {
        this.testParticipation = getParticipationByStateId(0);
        this.newStateId = 1;
        this.callingMember = getPlannerMember();
        this.testParticipation.member = getMember();
        this.testParticipation.event = getTestEvent();

        this.expectedResult = true;

        await this.testValidator();
    }

    @test
    async validateCombinationFrom0To2PlannerOtherFuture() {
        this.testParticipation = getParticipationByStateId(0);
        this.newStateId = 2;
        this.callingMember = getPlannerMember();
        this.testParticipation.member = getMember();
        this.testParticipation.event = getTestEvent();

        this.expectedResult = true;

        await this.testValidator();
    }

    @test
    async validateCombinationFrom0To3PlannerOtherFuture() {
        this.testParticipation = getParticipationByStateId(0);
        this.newStateId = 3;
        this.callingMember = getPlannerMember();
        this.testParticipation.member = getMember();
        this.testParticipation.event = getTestEvent();

        this.expectedResult = true;

        await this.testValidator();
    }

    @test
    async validateCombinationFrom1To0PlannerOtherFuture() {
        this.testParticipation = getParticipationByStateId(1);
        this.newStateId = 0;
        this.callingMember = getPlannerMember();
        this.testParticipation.member = getMember();
        this.testParticipation.event = getTestEvent();

        this.expectedResult = true;

        await this.testValidator();
    }

    @test
    async validateCombinationFrom2To3PlannerOtherFuture() {
        this.testParticipation = getParticipationByStateId(2);
        this.newStateId = 3;
        this.callingMember = getPlannerMember();
        this.testParticipation.member = getMember();
        this.testParticipation.event = getTestEvent();

        this.expectedResult = true;

        await this.testValidator();
    }

    @test
    async validateCombinationFrom3To2PlannerOtherFuture() {
        this.testParticipation = getParticipationByStateId(3);
        this.newStateId = 2;
        this.callingMember = getPlannerMember();
        this.testParticipation.member = getMember();
        this.testParticipation.event = getTestEvent();

        this.expectedResult = true;

        await this.testValidator();
    }

    @test
    async validateCombinationFrom4To2PlannerOtherFuture() {
        this.testParticipation = getParticipationByStateId(4);
        this.newStateId = 2;
        this.callingMember = getPlannerMember();
        this.testParticipation.member = getMember();
        this.testParticipation.event = getTestEvent();

        this.expectedResult = true;

        await this.testValidator();
    }

    @test
    async validateCombinationFrom4To5PlannerOtherFuture() {
        this.testParticipation = getParticipationByStateId(4);
        this.newStateId = 5;
        this.callingMember = getPlannerMember();
        this.testParticipation.member = getMember();
        this.testParticipation.event = getTestEvent();

        this.expectedResult = true;

        await this.testValidator();
    }

    @test
    async validateCombinationFrom5To1PlannerOtherFuture() {
        this.testParticipation = getParticipationByStateId(5);
        this.newStateId = 1;
        this.callingMember = getPlannerMember();
        this.testParticipation.member = getMember();
        this.testParticipation.event = getTestEvent();

        this.expectedResult = true;

        await this.testValidator();
    }

    private async testValidator() {
        this.request
            .setNewStateId(this.newStateId)
            .setCurrentParticipation(this.testParticipation)
            .setCallingMember(this.callingMember);

        let result = this.validator.validateRequest(this.request);

        expect(result).toBe(this.expectedResult);
    }
}

function getTestEvent() {
    let ms = new Date().getTime() + 86400000;
    let tomorrow = new Date(ms);
    return plainToClass(Event, {
        eventId: 2,
        wpId: 10,
        startDate: new Date(),
        endDate: tomorrow,
        summary: 'summary',
        description: 'description',
        eventName: 'eventName',
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

function getTestEventWhichLiesInPast() {
    return plainToClass(Event, {
        eventId: 1,
        wpId: 10,
        startDate: new Date('2018-06-17T03:24:00'),
        endDate: new Date('2018-06-18T03:24:00'),
        summary: 'summary',
        description: 'description',
        eventName: 'eventName',
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

function getAdminMember() {
    let role = new Role();
    role.roleId = 0;
    role.roleName = 'admin';
    let member = new Member();
    member.roles = [role];
    member.memberId = 1;
    return member;
}

function getPlannerMember() {
    let role = new Role();
    role.roleId = 100;
    role.roleName = 'planner';
    let section = new Section();
    section.sectionId = 1;
    let member = new Member();
    member.roles = [role];
    member.section = section;
    member.memberId = 100;
    return member;
}

function getMember() {
    let role = new Role();
    role.roleId = 200;
    role.roleName = 'member';
    let section = new Section();
    section.sectionId = 1;
    let member = new Member();
    member.roles = [role];
    member.section = section;
    member.memberId = 200;
    return member;
}

function getParticipationByStateId(id) {
    let participation = new Participation();
    let state = new ParticipationState();
    state.stateId = id;
    participation.participationState = state;
    return participation;
}
