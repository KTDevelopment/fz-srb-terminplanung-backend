import {App} from "./app";
import {configServiceMock} from "../../test/mocks/configServiceMock";
import {loggerMock} from "../../test/mocks/loggerMock";
import {NestFactory} from "@nestjs/core";
import {SwaggerModule} from "@nestjs/swagger";
import {BasicAuthorizer} from "../auth/basic.authorizer";
import {EventsService} from "../ressources/events/events.service";
import {SectionsService} from "../ressources/sections/sections.service";
import {RolesService} from "../ressources/roles/roles.service";
import {MembersService} from "../ressources/members/members.service";
import {ParticipationStatesService} from "../ressources/participations/participation-states/participation-states.service";

describe('App', () => {
    it('does start up stuff', async () => {
        NestFactory.create = jest.fn().mockResolvedValue({
            enableCors: jest.fn(),
            use: jest.fn(),
            get: jest.fn().mockImplementation((arg) => {
                if (arg === BasicAuthorizer) return {authorize: jest.fn()};
                if (arg === EventsService) return {importEventsFromWebsite: jest.fn()};
                if (arg === SectionsService) return {insertDefaultSectionsIdNeeded: jest.fn()};
                if (arg === RolesService) return {insertDefaultRolesNeeded: jest.fn()};
                if (arg === MembersService) return {insertKevinThuermann: jest.fn()};
                if (arg === ParticipationStatesService) return {insertParticipationStates: jest.fn()};

                return {}
            }),
            listen: jest.fn(),
            getHttpServer: jest.fn().mockReturnValue({address: () => ({port:123})}),
        })
        SwaggerModule.createDocument = jest.fn().mockReturnValue({});
        SwaggerModule.setup = jest.fn().mockReturnValue({});

        await App.create(configServiceMock({
            database: {
                type: 'sqlite'
            }
        }), loggerMock).start()
    });
});
