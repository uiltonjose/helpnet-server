const synchronizeController = require("../controller/synchronizeController"),
  dateUtil = require("../utils/DateUtil"),
  cron = require("node-cron");

require("dotenv").config();

const seconds = process.env.CRON_SEG,
  minutes = process.env.CRON_MIN,
  hour = process.env.CRON_HOU,
  dayOfMonth = process.env.CRON_DAY_OF_MONTH,
  month = process.env.CRON_MONTH,
  dayOfWeek = process.env.CRON_DAY_OF_WEEK;

const cronExpress = `${seconds} ${minutes} ${hour} ${dayOfMonth} ${month} ${dayOfWeek}`;

/**
 * @deprecated We won't use this. Keep this class just in case for the future.
 */
const syncCustomers = () => {
  cron.schedule(cronExpress, () => {
    synchronizeController
      .synchronizeCustomersFromFilesAllProviders()
      .then(result => {
        console.log(result);
      });

    console.log(
      dateUtil.getDateString() +
        " - Iniciada a sincronização da base de dados dos provedores com o Helpnet"
    );
  });
};

module.exports = {
  syncCustomers: syncCustomers
};
