import {Member} from "../../ressources/members/member.entity";
import {Event} from "../../ressources/events/event.entity";

export class SendFirebaseMessageEvent {
    newStateId: number;
    callingMember: Member;
    changedMember: Member;
    event: Event;
}
