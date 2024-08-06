This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

The project requires a Google sheet with the correct permissions. It will list categories from sheet names and use the following format for the category data:

| Division | Athlete  | Sled push | Cortadito | ... | Score |
| -------- | -------- | --------- | --------- | --- | ----- |
| Women    | Annie    | Item3.1   | Item4.1   | ... | 500   |
| Men      | Jonas    | Item3.2   | Item4.2   | ... | 400   |
| Men      | John     | Item3.3   | Item4.3   | ... | 300   |
| Women    | Christie | Item3.4   | Item4.4   | ... | 200   |

Division will become a child tab within the category and the rest will be rendered as a [DataGrid](https://mui.com/x/react-data-grid).

### Install

Create a `.env.local` file with the following content:

```bash

NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY='some-key'
NEXT_PUBLIC_GOOGLE_SPREADSHEET_ID='some-id'
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

Install the dependencies and start the server.

```bash
yarn install
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `src/components/leaderboard.tsx`. The page auto-updates as you edit the file.

### Deploy

Deploy the Next.js app to AWS using SST by following [their docs](https://ion.sst.dev/docs/start/aws/nextjs/)
