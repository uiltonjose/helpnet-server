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

module.exports = {
  NotificationStatus: NotificationStatus,
  State: State,
  Situations: Situations
};
