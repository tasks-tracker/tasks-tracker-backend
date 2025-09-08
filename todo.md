- При регистрации клиента, чтобы создавалась дефолтная борда
  это должно просходить через эвент в кафку. Тоесть пользователь 
  регистрируется -> шлётся эвент

___
(without outbox)
RegisterUserCommandHandler -> UserRepository -> if event === RegisterUserByLogin -> kafka.sendEvent()

kafka -> entrypoint/UserRegisteredByLoginConsumer -> CreateDefaultBoardCommandHandler

___
(outbox)

RegisterUserCommandHandler -> UserRepository ->

start transaction;
outboxTable.insert(event)
user.insert(user)
commit;

if event === RegisterUserByLogin -> kafka.sendEvent()

kafka -> entrypoint/UserRegisteredByLoginConsumer -> CreateDefaultBoardCommandHandler

- Редис для findBoardById, чтобы быстрее было
- Распилить этот монолит на микросервисы. 1 контекст это 1 микросервис
