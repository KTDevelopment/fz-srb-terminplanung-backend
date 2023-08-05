import {BadRequestException, CanActivate, ExecutionContext, Injectable} from "@nestjs/common";
import {Request} from 'express';
import {ParticipationChangeRequest} from "./ParticipationChangeRequest";
import {ParticipationsService} from "../participations.service";
import {Member} from "../../members/member.entity";
import {ParticipationChangeRequestValidator} from "./ParticipationChangeRequestValidator";
import {plainToInstance} from "class-transformer";
import {Participation} from "../participation.entity";
import {validateEntity} from "../../../_common/EntityValidator";
import {DeepPartial} from "typeorm";

@Injectable()
export class ParticipationsGuard implements CanActivate {

    constructor(
        private readonly participationsService: ParticipationsService,
        private readonly participationChangeRequestValidator: ParticipationChangeRequestValidator) {
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requests = await this.determineChangeRequests(context.switchToHttp().getRequest());

        return this.validateRequests(requests);
    }

    private async determineChangeRequests(req: Request): Promise<ParticipationChangeRequest[]> {
        if (Array.isArray(req.body.bulk)) {
            return this.determineRequestBulk(req.body.bulk, req.user as Member);
        }

        return [await this.determineSingleRequest(req.body, req.user as Member)]
    }

    private async determineRequestBulk(bulk: DeepPartial<Participation>[], member: Member): Promise<ParticipationChangeRequest[]> {
        return Promise.all(bulk.map(dto => this.determineSingleRequest(dto, member)))
    }

    private async determineSingleRequest(dto: DeepPartial<Participation>, member: Member): Promise<ParticipationChangeRequest> {
        const {memberId, eventId, stateId} = await validateEntity(plainToInstance(Participation, dto));
        const currentParticipation = await this.participationsService.findDetailedParticipation(memberId, eventId);

        return (new ParticipationChangeRequest())
            .setNewStateId(stateId)
            .setCurrentParticipation(currentParticipation)
            .setCallingMember(member)
    }

    private validateRequests(participationChangeRequests: ParticipationChangeRequest[]): boolean {
        participationChangeRequests.map(single => {
            const isValid = this.participationChangeRequestValidator.validateRequest(single);
            if (!isValid) {
                throw new BadRequestException("Illegal State Change from: " + single.currentParticipation.stateId + ' to ' + single.newStateId + '; event: ' + single.currentParticipation.event.eventId + '; member: ' + single.currentParticipation.member.memberId)
            }
        });

        return true;
    }
}
