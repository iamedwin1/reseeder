import winston, { format, transports } from "winston";

export default winston.createLogger({
  level: "info",

  format: format.combine(format.colorize(), format.prettyPrint(), format.splat(), format.simple()),
  transports: [new transports.Console({})],
});
