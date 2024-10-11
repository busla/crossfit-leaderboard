/// <reference path="./.sst/platform/config.d.ts" />
import { CACHE_CONTROL } from "./src/app/constants";

const config = {
  cfr: {
    domain: "islandsmot.cfr.is",
    zone: "Z09538653JXB6VRD1OZMT",
    cert: "arn:aws:acm:us-east-1:285215523486:certificate/40429b65-78e7-400a-a3d7-76c33bb059d4",
    spreadsheetId: "1K6e9xbY_bPDqdmL0kYO484B7PAcpojPDuCNA_fYmvlo",
  },
  ["cfr-dev"]: {
    domain: "cfr.dev.fairgame.is",
    zone: "Z0516150OQ0TIC6MDCUG",
    cert: "arn:aws:acm:us-east-1:285215523486:certificate/75e77351-a4d6-4dd1-a20a-abc52bafaee1",
    // spreadsheetId: '1K6e9xbY_bPDqdmL0kYO484B7PAcpojPDuCNA_fYmvlo'
    spreadsheetId: "1wyOAviLuRpI-nWkT8ts5M7iHbYPlpN9EGOeppgT3tjE",
  },
};
export default $config({
  app(input) {
    return {
      name: "crossfit-leaderboard",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "aws",
    };
  },
  async run() {
    console.log(process.env);
    const env = config[`${$app.stage}`];
    const url = `https://${env.domain}`;
    const bucket = new sst.aws.Bucket("CrossfitLeaderboardBucket", {
      public: true,
    });
    new sst.aws.Nextjs("CrossfitLeaderboardWeb", {
      link: [bucket],
      environment: {
        NEXT_PUBLIC_BASE_URL: url,
        GOOGLE_SPREADSHEET_ID: env.spreadsheetId,
      },
      domain: {
        name: env.domain,
        cert: env.cert,
        dns: sst.aws.dns({
          zone: env.zone,
        }),
      },
      assets: {
        nonVersionedFilesCacheHeader: CACHE_CONTROL,
      },
    });
  },
});
