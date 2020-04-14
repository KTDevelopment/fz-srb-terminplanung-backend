import {Participation} from "../participation.entity";
import {Member} from "../../members/member.entity";

export class ParticipationChangeRequest {
    newStateId: number;
    currentParticipation: Participation;
    callingMember: Member;

    setNewStateId(stateId: number) {
        this.newStateId = stateId;
        return this;
    }

    setCallingMember(callingMember: Member) {
        this.callingMember = callingMember;
        return this;
    }

    setCurrentParticipation(participation: Participation) {
        this.currentParticipation = participation;
        return this;
    }
}
