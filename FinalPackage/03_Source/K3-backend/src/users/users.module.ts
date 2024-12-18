import {CommandBus, CqrsModule, EventBus, QueryBus} from '@nestjs/cqrs';
import {Module, OnModuleInit} from '@nestjs/common';
import {CommandHandlers} from './commands/handlers';
import {EventHandlers} from './events/handlers';
import {UsersSagas} from './sagas/users.sagas';
import {UsersController} from './controllers/users.controller';
import {UsersService} from './services/users.service';
import {UserRepository} from './repository/user.repository';
import {EventStoreModule} from '../core/event-store/event-store.module';
import {EventStore} from '../core/event-store/event-store';
import {UserCreatedEvent} from './events/impl/user-created.event';
import {UserDeletedEvent} from './events/impl/user-deleted.event';
import {UserUpdatedEvent} from './events/impl/user-updated.event';
import {InjectRepository, TypeOrmModule} from '@nestjs/typeorm';
import {UserDto} from './dtos/users.dto';
import {QueryHandlers} from './queries/handler';
import {Repository} from 'typeorm';

@Module({
    imports: [
        TypeOrmModule.forFeature([UserDto]),
        CqrsModule,
        EventStoreModule.forFeature(),
    ],
    controllers: [UsersController],
    providers: [
        UsersService,
        UsersSagas,
        ...CommandHandlers,
        ...EventHandlers,
        ...QueryHandlers,

        /*** REPOSITORY */
        UserRepository,
    ],
    exports: [UsersService],
})
export class UsersModule implements OnModuleInit {
    constructor(
        private readonly command$: CommandBus,
        private readonly query$: QueryBus,
        private readonly event$: EventBus,
        private readonly usersSagas: UsersSagas,
        private readonly eventStore: EventStore,
        @InjectRepository(UserDto)
        private readonly repository: Repository<UserDto>,
    ) {
    }

    onModuleInit() {
        /** ------------ */
        this.eventStore.setEventHandlers(this.eventHandlers);
        this.eventStore.bridgeEventsTo((this.event$ as any).subject$);
        this.event$.publisher = this.eventStore;
        /** ------------ */
        this.event$.register(EventHandlers);
        this.command$.register(CommandHandlers);
        this.query$.register(QueryHandlers);
        this.event$.registerSagas([UsersSagas]);
        // TODO: auto create admin account
    }

    eventHandlers = {
        UserCreatedEvent: data => new UserCreatedEvent(data),
        UserDeletedEvent: data => new UserDeletedEvent(data),
        UserUpdatedEvent: data => new UserUpdatedEvent(data),
        // UserWelcomedEvent: data => new UserWelcomedEvent(data)
    };
}
