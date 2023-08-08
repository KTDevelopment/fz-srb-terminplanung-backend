import {EntityManager} from "typeorm";
import {getEventThatShouldBeRemoved, getNonPublicEvents, getPublicEvents} from "./events";
import {Role} from "../../../src/ressources/roles/role.entity";
import {Section} from "../../../src/ressources/sections/section.entity";
import {Member} from "../../../src/ressources/members/member.entity";
import {PasswordEncryptor} from "../../../src/auth/password.encryptor";
import {
    ParticipationState
} from "../../../src/ressources/participations/participation-states/participation-state.entity";
import {Participation} from "../../../src/ressources/participations/participation.entity";
import {DataSource} from "typeorm/data-source/DataSource";
import {Anniversary} from "../../../src/ressources/statistics/anniversaries/anniversary.entity";
import {StatisticsEntry} from "../../../src/ressources/statistics/statisticsEntry/statisticsEntry.entity";
import {
    StatisticsParticipation
} from "../../../src/ressources/statistics/statisticParticipation/statisticsParticipation.entity";

export class TestDataManager {

    private dataSource: DataSource;
    private passwordEncryptor: PasswordEncryptor;
    private entityManager: EntityManager;

    constructor(dataSource: DataSource) {
        this.dataSource = dataSource;
        this.entityManager = this.dataSource.createEntityManager();
        this.passwordEncryptor = new PasswordEncryptor();
    }

    public async populateTablesWithTestData() {
        await this.insertTestEvents();
        await this.insertTestSections();
        await this.insertTestMembers();
        await this.insertTestRoles();
        await this.insertParticipationStates();
        await this.insertTestParticipations();
        await this.insertTestDevices();
        await this.insertTestStatisticsEntries();
        await this.insertTestStatisticsParticipations();
        await this.insertTestAnniversaries();
    }

    /** used inside tests through global */
    async clearData() {
        await this.dataSource.destroy();
        await this.dataSource.initialize();
    }

    async cleanStatisticsDeletionProtocols() {
        await this.dataSource.query("DELETE FROM statistics_deletion_protocol")
    }

    public async addEventThatShouldBeRemoved() {
        await this.entityManager.save(getEventThatShouldBeRemoved());
    }

    private async insertTestAnniversaries() {
        await this.entityManager.save(this.entityManager.create(Anniversary, TestDataManager.getRawAnniversaries()));
    }

    private async insertTestRoles() {
        await this.entityManager.save(this.entityManager.create(Role, await this.getRawRoles()));
    }

    private async insertTestSections() {
        await this.entityManager.save(this.entityManager.create(Section, await this.getRawSections()));
    }

    private async insertTestMembers() {
        await this.entityManager.save(this.entityManager.create(Member, await this.getRawTestMember()));
    }

    private async insertTestEvents() {
        await this.entityManager.save(getPublicEvents());
        await this.entityManager.save(getNonPublicEvents())
    }

    private async insertTestParticipations() {
        const elements = this.entityManager.create(Participation, TestDataManager.getRawTestParticipations());
        await this.entityManager.save(elements);
    }

    private async insertParticipationStates() {
        const state5 = new ParticipationState();
        state5.stateId = 5;
        state5.stateName = 'invitation request reject';
        const state4 = new ParticipationState();
        state4.stateId = 4;
        state4.stateName = 'invitation request pending';
        const state0 = new ParticipationState();
        state0.stateId = 0;
        state0.stateName = 'not invited';
        const state1 = new ParticipationState();
        state1.stateId = 1;
        state1.stateName = 'invited';

        // (2, 'attend'),
        //     (3, 'do not attend'),
        //     (4, 'invitation request pending'),
        //     (5, 'invitation request reject'),
        //     (1, 'invited'),
        //     (0, 'not invited');
        return await this.dataSource.manager.save([state0, state1, state4, state5])
    }

    private async insertTestDevices() {
        await this.entityManager.save(this.entityManager.create('Device', await this.getRawDevices()));
    }

    private async getRawRoles() {
        const allMemberFromDB = await this.entityManager.find(Member);
        return [
            {
                roleId: 0,
                roleName: 'admin',
                members: [allMemberFromDB[0], allMemberFromDB[3]]
            },
            {
                roleId: 1,
                roleName: 'webadmin',
                members: [allMemberFromDB[0]]
            },
            {
                roleId: 25,
                roleName: 'newsMan',
                members: []
            },
            {
                roleId: 100,
                roleName: 'planner',
                members: [allMemberFromDB[0], allMemberFromDB[2], allMemberFromDB[3]]
            },
            {
                roleId: 200,
                roleName: 'member',
                members: allMemberFromDB
            }
        ]
    }

    private async getRawSections() {
        const allMemberFromDB = await this.entityManager.find(Member);
        return [
            {
                sectionId: 2,
                sectionName: 'Marschtrommler',
                members: [allMemberFromDB[0], allMemberFromDB[3]]
            },
            {
                sectionId: 1,
                sectionName: 'Hochtrommler',
                members: [allMemberFromDB[1], allMemberFromDB[2], allMemberFromDB[4], allMemberFromDB[5]]
            }
        ]
    }

    private async getRawDevices() {
        const allMemberFromDB = await this.entityManager.find(Member);
        return [
            {member: allMemberFromDB[0], registrationId: "deviceMember1", deviceType: "type_android"},
            {member: allMemberFromDB[1], registrationId: "deviceMember2", deviceType: "type_ios"}
        ]
    }

    async getRawTestMember() {
        return [
            {
                firstName: 'Kevin',
                lastName: 'Thürmann',
                performanceCount: 600,
                email: 'kevin.thuermann@web.de',
                password: this.passwordEncryptor.hashPassword('password_kevin'),
                isDeleted: false,
                sectionId: 2
            },
            {
                firstName: 'Jasmin',
                lastName: 'Schilke',
                performanceCount: 99,
                email: 'jasmin.schilke@web.de',
                refreshToken: 'refresh_token_value',
                password: this.passwordEncryptor.hashPassword('password_jasmin'),
                isDeleted: false,
                sectionId: 1
            },
            {
                firstName: 'Martin',
                lastName: 'Walter',
                performanceCount: 721,
                email: 'martin.walter@web.de',
                password: this.passwordEncryptor.hashPassword('password_martin'),
                isDeleted: false,
                sectionId: 1
            },
            {
                firstName: 'Amely',
                lastName: 'Börner',
                performanceCount: 2000,
                email: 'amely.boerner@web.de',
                password: this.passwordEncryptor.hashPassword('password_amely'),
                isDeleted: false,
                sectionId: 2
            },
            {
                firstName: 'Paul',
                lastName: 'Schulz',
                performanceCount: 60000,
                email: 'paul.schulz@web.de',
                password: this.passwordEncryptor.hashPassword('password_paul'),
                isDeleted: true,
                sectionId: 1
            },
            {
                firstName: 'Alexandra',
                lastName: 'Michel',
                performanceCount: 2000,
                email: 'alexandra.michel@web.de',
                password: this.passwordEncryptor.hashPassword('password_alexandra'),
                isDeleted: false,
                sectionId: 1
            },
        ]
    }


    static getRawTestParticipations() {
        return [
            {memberId: 2, eventId: 1, stateId: 5},
            {memberId: 4, eventId: 1, stateId: 5},
            {memberId: 3, eventId: 2, stateId: 0},
            {memberId: 3, eventId: 2, stateId: 1},
        ]
    }

    private static getRawAnniversaries() {
        return [
            {
                memberId: 6,
                statisticsEntryId: 1,
                performanceCount: 2000
            },
            {
                memberId: 2,
                statisticsEntryId: 1,
                performanceCount: 100
            },
            {
                memberId: 3,
                statisticsEntryId: 1,
                performanceCount: 100
            },
            {
                memberId: 3,
                statisticsEntryId: 4,
                performanceCount: 200
            },
        ]
    }

    private async insertTestStatisticsEntries() {
        await this.entityManager.save(this.entityManager.create(StatisticsEntry, TestDataManager.getRawStatisticsEntries()));
    }

    private static getRawStatisticsEntries() {
        const ms = new Date().getTime() + 86400000;
        const tomorrow = new Date(ms);
        return [
            {
                name: "TestStatisticEntry-1",
                locationString: "exampleLocation, string",
                date: new Date("2023-05-12T00:00:00Z"),
                eventId: 1,
                sectionId: 1,
                isProcessed: false,
            },
            {
                name: "TestStatisticEntry-1",
                locationString: "exampleLocation, string",
                date: new Date("2023-05-12T00:00:00Z"),
                eventId: 1,
                sectionId: 2,
                isProcessed: false,
            },
            {
                name: "TestStatisticEntry-2",
                locationString: "exampleLocation, string",
                date: new Date("2023-06-12T00:00:00Z"),
                eventId: 2,
                sectionId: 1,
                isProcessed: true,
            },
            {
                name: "TestStatisticEntry-Tomorrow",
                locationString: "exampleLocation, string",
                date: tomorrow,
                eventId: 3,
                sectionId: 1,
                isProcessed: true,
            }
        ]
    }

    private async insertTestStatisticsParticipations() {
        await this.entityManager.save(this.entityManager.create(StatisticsParticipation, TestDataManager.getRawStatisticsParticipations()));
    }

    private static getRawStatisticsParticipations() {
        return [
            {
                memberId: 1,
                statisticsEntryId: 1,
                performanceCount: 100,
            },
            {
                memberId: 2,
                statisticsEntryId: 1,
                performanceCount: 100,
            },
            {
                memberId: 6,
                statisticsEntryId: 1,
                performanceCount: 100,
            },
            {
                memberId: 3,
                statisticsEntryId: 1,
                performanceCount: 100,
            },
            {
                memberId: 3,
                statisticsEntryId: 3,
                performanceCount: 101,
            },
            {
                memberId: 3,
                statisticsEntryId: 4,
                performanceCount: 200,
            },
        ]
    }
}
