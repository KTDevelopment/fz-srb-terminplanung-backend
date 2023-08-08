import {ParticipationChangeRequest} from "./ParticipationChangeRequest";
import {
    KEY_FOR_OTHER,
    KEY_FOR_SELF,
    VALID_CHANGES_FOR_MEMBER,
    VALID_CHANGES_FOR_PLANNER_ADMIN_WEBADMINS
} from "./ValidStateChanges";
import {STATE_DEPRECATIONS} from "../participation-states/participation-state.entity";
import {Injectable} from "@nestjs/common";

@Injectable()
export class ParticipationChangeRequestValidator {

    validateRequest(participationChangeRequest: ParticipationChangeRequest) {
        if (!ParticipationChangeRequestValidator.baseValidation(participationChangeRequest)) {
            return false
        }

        const event = participationChangeRequest.currentParticipation.event;
        const memberToChange = participationChangeRequest.currentParticipation.member;
        const currentStateId = participationChangeRequest.currentParticipation.participationState.stateId;
        const newStateId = participationChangeRequest.newStateId;
        const callingMember = participationChangeRequest.callingMember;

        // guard when event is in the past, no more changes are valid
        if (event.isInPast()) {
            return false;
        }

        if (!memberToChange) {
            return false;
        }

        const isForSelf = callingMember.memberId === memberToChange.memberId;

        if (callingMember.isAdmin()) {
            return this.validateForAdmin(isForSelf, currentStateId, newStateId)
        }

        if (callingMember.isPlanner()) {
            return this.validateForPlanner(
                callingMember.section.sectionId === memberToChange.section.sectionId,
                isForSelf, currentStateId, newStateId
            );
        }

        return this.validateForMember(isForSelf, currentStateId, newStateId);
    }

    private validateForAdmin(isForSelf: boolean, oldStateId: number, newStateId: number): boolean {
        if (isForSelf) {
            return VALID_CHANGES_FOR_PLANNER_ADMIN_WEBADMINS[KEY_FOR_SELF][oldStateId].some(validStateId => validStateId === newStateId)
        } else {
            return VALID_CHANGES_FOR_PLANNER_ADMIN_WEBADMINS[KEY_FOR_OTHER][oldStateId].some(validStateId => validStateId === newStateId)
        }
    }

    private validateForPlanner(sameSection: boolean, isForSelf: boolean, oldStateId: number, newStateId: number): boolean {
        if (!sameSection) {
            return false;
        }

        if (isForSelf) {
            return VALID_CHANGES_FOR_PLANNER_ADMIN_WEBADMINS[KEY_FOR_SELF][oldStateId].some(validStateId => validStateId === newStateId)
        } else {
            return VALID_CHANGES_FOR_PLANNER_ADMIN_WEBADMINS[KEY_FOR_OTHER][oldStateId].some(validStateId => validStateId === newStateId)
        }
    }

    private validateForMember(isForSelf: boolean, oldStateId: number, newStateId: number): boolean {
        if (isForSelf) {
            return VALID_CHANGES_FOR_MEMBER[KEY_FOR_SELF][oldStateId].some(validStateId => validStateId === newStateId)
        } else {
            return VALID_CHANGES_FOR_MEMBER[KEY_FOR_OTHER][oldStateId].some(validStateId => validStateId === newStateId)
        }
    }

    private static baseValidation(participationChangeRequest: ParticipationChangeRequest) {
        return (
            participationChangeRequest.newStateId !== null &&
            participationChangeRequest.newStateId !== STATE_DEPRECATIONS.STATE__HAS_NOT_PARTICIPATED &&
            participationChangeRequest.newStateId !== STATE_DEPRECATIONS.STATE__HAS_PARTICIPATED &&
            participationChangeRequest.currentParticipation !== null &&
            participationChangeRequest.callingMember !== null
        );
    }
}
