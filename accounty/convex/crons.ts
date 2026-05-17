import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.daily(
  "generate-recurring-invoices",
  { hourUTC: 0, minuteUTC: 0 },
  internal.invoices.generateDueRecurring,
);

export default crons;
