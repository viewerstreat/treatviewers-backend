- Create index on `users` collection on `id` field `unique`.
- Create index on `movies` collection on `name` field `unique`.
- Create index on `contests` collection on `title` field `unique`.
- Create index on `clips` collection on `name` field `unique`.
- Create index on `questions` collection on `contestId` and `questionNo` (composite key, unique).
- Create index on `favourites` collection on `userId` and `mediaId` (composite key, unique).
- Create index on `movieViews` collection on `userId` and `movieId` (composite key, unique).
- Create index on `wallets` collection on `userId` field `unique`.
- Create index on `playTrackers` collection on `userId` and `contestId` (composite key, unique)

# playTracker (post)

- check if `contestId` is valid
- if the `playTracker` exists and status is `FINISHED` then return 409
- if the `playTracker` exists and status is `STARTED` then update resumeTs and return 200
- if the `playTracker` exists and status is `PAID` then update `STARTED`, startTs and return 200
- if the contest entryFee is not zero then return 409.
- if the `playTracker` do not exists then insertOne in `STARTED` status.
- if the `playTracker` exists and status is `INIT` then update to `STARTED` and return 200

# wallet/payContest (post)

- check if `contestId` is valid.
- if the `playTracker` exists and status is `FINISHED` then return 409
- if the `playTracker` exists and status is `STARTED` then return 409
- if the `playTracker` exists and status is `PAID` then return 409
- if the entryFee is zero and `playTracker` exists then update to PAID return 200
- if the entryFee is zero and `playTracker` do not exists then insertOne in `PAID` started
- if the `playTracker` do not exists then insertOne in `INIT` status
- check if the balance is greater than wallet balance otherwise return 409
- start session
- subtract wallet balance
- update playTracker update to status PAID
- end session
- if transaction is ok then return 200
