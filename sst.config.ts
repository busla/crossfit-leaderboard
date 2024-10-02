/// <reference path="./.sst/platform/config.d.ts" />
const baseDomain = "dev.fairgame.is";

export default $config({
  app(input) {
    return {
      name: "crossfit-leaderboard",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "aws",
    };
  },
  async run() {
    const stageDomain = `${$app.stage}.${baseDomain}`;
    const stageUrl = `https://${stageDomain}`;
    const bucket = new sst.aws.Bucket("CrossfitLeaderboardBucket", {
      public: true,
    });
    new sst.aws.Nextjs("CrossfitLeaderboardWeb", {
      link: [bucket],
      environment: {
        NEXT_PUBLIC_BASE_URL: stageUrl,
      },
      domain: {
        name: stageDomain,
        cert: "arn:aws:acm:us-east-1:285215523486:certificate/75e77351-a4d6-4dd1-a20a-abc52bafaee1",
        dns: sst.aws.dns({
          zone: "Z0516150OQ0TIC6MDCUG",
        }),
      },
      assets: {
        nonVersionedFilesCacheHeader: "public,max-age=0,s-maxage=10,stale-while-revalidate=300"
      }
    });
  },
});
