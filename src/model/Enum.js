const NotificationStatus = {
  SENT: "Sent",
  READ: "Read"
};

const State = {
  BLOCKED: "Bloqueado",
  ACTIVE: "Ativo",
  INACTIVE: "Inativo"
};

const Situations = {
  OPEN: 1,
  WORK_IN_PROGRESS: 2,
  CLOSED: 3,
  CONCLUDED: 4
};

const EventType = {
  OPEN_OS: 1,
  PUT_IN_PROGRESS: 2,
  PUT_OFF: 3,
  CLOSED_OS: 4,
  CHANGE_TECHNICAL: 5
};

module.exports = {
  NotificationStatus: NotificationStatus,
  State: State,
  Situations: Situations,
  EventType: EventType
};
