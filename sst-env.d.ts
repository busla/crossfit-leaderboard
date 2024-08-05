/* tslint:disable */
/* eslint-disable */
import "sst"
declare module "sst" {
  export interface Resource {
    "CrossfitLeaderboardBucket": {
      "name": string
      "type": "sst.aws.Bucket"
    }
    "CrossfitLeaderboardWeb": {
      "type": "sst.aws.Nextjs"
      "url": string
    }
  }
}
export {}
