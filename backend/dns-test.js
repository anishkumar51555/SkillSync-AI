
const dns = require("node:dns");

dns.resolveSrv(
  "_mongodb._tcp.cluster0.sc1kcli.mongodb.net",
  (error, records) => {
    if (error) {
      console.error("Node DNS error:", error);
      return;
    }

    console.log("MongoDB SRV records:", records);
  }
);
