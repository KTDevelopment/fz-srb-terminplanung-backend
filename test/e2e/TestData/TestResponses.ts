export class TestResponses {
    static rol0WithMembers() {
        const role0 = this.role0();
        role0.members = [
            this.kevin(),
            this.amely()
        ];
        return role0;
    }

    static rolesWithMemberList() {
        const role0 = this.role0();
        role0.members = [
            this.kevin(),
            this.amely()
        ];
        const role1 = this.role1();
        role1.members = [
            this.kevin(),
        ];
        const role100 = this.role100();
        role100.members = [
            this.kevin(),
            this.martin(),
            this.amely()
        ];
        const role200 = this.role200();
        role200.members = [
            this.kevin(),
            this.jasmin(),
            this.martin(),
            this.amely(),
            this.alexandra()
        ];
        return [
            role0,
            role1,
            role100,
            role200
        ]
    }

    static rolesWithOutMemberList() {
        return [
            this.role0(),
            this.role1(),
            this.role100(),
            this.role200(),
        ]
    }

    static roleWithMemberList() {
        const role200 = this.role200();
        role200.members = [
            this.kevin(),
            this.jasmin(),
            this.martin(),
            this.amely(),
            this.alexandra()
        ];
        return role200;
    }

    static roleWithoutMemberList() {
        return this.role1()
    }

    static kevinWithSection() {
        const kevin = this.kevin();
        kevin.section = this.section2();
        return kevin;
    }

    static kevinWithRoles() {
        const kevin = this.kevin();
        kevin.roles = [
            this.role0(),
            this.role1(),
            this.role100(),
            this.role200(),
        ];
        return kevin;
    }

    static kevinWithDevices() {
        const kevin = this.kevin();
        kevin.devices = true;
        return kevin;
    }

    static allMemberWithOutSections() {
        return [
            this.kevin(),
            this.jasmin(),
            this.martin(),
            this.amely(),
            this.alexandra()
        ]
    }

    static allMemberWithSections() {
        const kevin = this.kevin();
        kevin.section = this.section2();
        const jasmin = this.jasmin();
        jasmin.section = this.section1();
        const martin = this.martin();
        martin.section = this.section1();
        const amely = this.amely();
        amely.section = this.section2();
        const alexandra = this.alexandra();
        alexandra.section = this.section1();
        return [
            kevin,
            jasmin,
            martin,
            amely,
            alexandra
        ]
    }


    static kevin(): any {
        return {
            "email": "kevin.thuermann@web.de",
            "firstName": "Kevin",
            "isDeleted": false,
            "lastName": "Thürmann",
            "performanceCount": 600,
        }
    }

    static paul(): any {
        return {
            "email": "paul.schulz@web.de",
            "firstName": "Paul",
            "isDeleted": true,
            "lastName": "Schulz",
            "performanceCount": 60000,
        }
    }

    static amely(): any {
        return {
            "email": "amely.boerner@web.de",
            "firstName": "Amely",
            "isDeleted": false,
            "lastName": "Börner",
            "performanceCount": 2000,
        }
    }

    static alexandra(): any {
        return {
            "email": "alexandra.michel@web.de",
            "firstName": "Alexandra",
            "isDeleted": false,
            "lastName": "Michel",
            "performanceCount": 2000,
        }
    }

    static jasmin(): any {
        return {
            "email": "jasmin.schilke@web.de",
            "firstName": "Jasmin",
            "isDeleted": false,
            "lastName": "Schilke",
            "performanceCount": 99,
        }
    }

    static martin(): any {
        return {
            "email": "martin.walter@web.de",
            "firstName": "Martin",
            "isDeleted": false,
            "lastName": "Walter",
            "performanceCount": 721,
        }
    }

    static section2(): any {
        return {
            "sectionId": 2,
            "sectionName": "Marschtrommler"
        }
    }

    static section1(): any {
        return {
            "sectionId": 1,
            "sectionName": "Hochtrommler",
        }
    }

    static role1(): any {
        return {
            "roleId": 1,
            "roleName": "webadmin",
        }
    }

    static role0(): any {
        return {
            "roleId": 0,
            "roleName": "admin",
        }
    }

    static role100(): any {
        return {
            "roleId": 100,
            "roleName": "planner",
        }
    }

    static role200(): any {
        return {
            "roleId": 200,
            "roleName": "member",
        }
    }

    static unfinishedEvent(): any {
        return {
            address: "Festzelt auf dem Anger",
            category: "AUFTRITT",
            creationDate: "2023-07-10T18:56:00.907Z",
            description: "",
            dress: "-",
            endDate: "2023-07-17T23:24:00.000Z",
            eventId: 3,
            eventName: "TestAuftritt",
            isPublic: true,
            latitude: 321.23,
            location: "Zinndorf",
            longitude: 123.23,
            participatingGroup: "Drumline",
            postcode: 1234,
            remoteId: "100",
            startDate: "2023-07-16T23:24:00.000Z",
            summary: "TestAuftritt für die unfinished",
            town: "Zinndorf",
            updateDate: "2023-07-11T18:56:00.907Z",
            version: 2
        }
    }
}
