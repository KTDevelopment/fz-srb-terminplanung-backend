import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {StatisticsEntry} from "./statisticsEntry/statisticsEntry.entity";
import {StatisticsEntryController} from "./statisticsEntry/statisticsEntry.controller";
import {StatisticsParticipationController} from "./statisticParticipation/statisticsParticipation.controller";
import {StatisticsEntryService} from "./statisticsEntry/statisticsEntry.service";
import {StatisticsParticipationService} from "./statisticParticipation/statisticsParticipation.service";
import {StatisticsParticipation} from "./statisticParticipation/statisticsParticipation.entity";
import {DeletionProtocolController} from "./deletionProtocol/deletionProtocol.controller";
import {DeletionProtocolService} from "./deletionProtocol/deletionProtocol.service";
import {DeletionProtocol} from "./deletionProtocol/deletionProtocol.entity";
import {Anniversary} from "./anniversaries/anniversary.entity";
import {AnniversariesService} from "./anniversaries/anniversaries.service";
import {AnniversariesController} from "./anniversaries/anniversaries.controller";

@Module({
    imports: [TypeOrmModule.forFeature([StatisticsEntry, StatisticsParticipation, DeletionProtocol, Anniversary])],
    controllers: [StatisticsEntryController, StatisticsParticipationController, DeletionProtocolController, AnniversariesController],
    providers: [StatisticsEntryService, StatisticsParticipationService, DeletionProtocolService, AnniversariesService]
})
export class StatisticsModule {
}
