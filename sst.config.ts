/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "crossfit-leaderboard",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "aws",
    };
  },
  async run() {
    const bucket = new sst.aws.Bucket("CrossfitLeaderboardBucket", {
      public: true,
    });
    new sst.aws.Nextjs("CrossfitLeaderboardWeb", {
      link: [bucket],
    });
  },
});
