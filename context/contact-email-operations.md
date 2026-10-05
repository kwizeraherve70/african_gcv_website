# Contact email delivery

Contact submission commits the enquiry and its email jobs in one PostgreSQL
transaction, then responds with HTTP 201. Admins can read the saved enquiry
immediately. Receipt does not mean that its notification email was delivered.

## Deployment

Deploy the additive `20261004010000_contact_email_outbox` migration before
starting the updated API (`backend/start.sh` already runs `prisma migrate deploy`).
There is no backfill: existing enquiries will not generate new emails.
Deploy the frontend to publish the updated receipt text in all four languages.

The worker runs inside each API process and shares the database queue. It needs
the existing `EMAIL_USER` and `EMAIL_PASS` Gmail settings. `ADMIN_EMAIL` selects
the internal inbox, falling back to `EMAIL_USER`. General enquiries also get a
sender confirmation; agent enquiries notify their agent only.

Set `CONTACT_EMAIL_WORKER_ENABLED=false` to pause delivery while continuing to
save enquiries and jobs. Missing Gmail credentials also pause the worker. Restart
the service after changing settings. Do not enable Railway service sleeping for
this API if timely background delivery is required: an inactive process cannot
drain jobs.

## Retry and inspection

Each API process sends one job at a time. Attempts have a 25-second total
deadline and a 90-second claim lease. Retry delays are 1 minute, 5 minutes,
15 minutes, 1 hour, and 6 hours, with six attempts total. Exhausted attempts
remain `FAILED`; their enquiry remains available in the admin dashboard.
Expired claims recover automatically after process restarts.

Run from `backend/` with the intended environment's `DATABASE_URL`:

```sh
npm run contact:email-jobs -- --list
npm run contact:email-jobs -- --retry <failed-job-id>
```

The list shows counts and up to 50 recent failed jobs, without recipients or
message bodies. Retry only after resolving the delivery failure; it resets the
selected failed job's attempt count. Sent or active jobs cannot be requeued by
this command. Logs retain only job identifiers, attempt counts, and error codes.

Production logs showed Gmail connection timeouts during investigation. This
change removes that wait from the form and retains delivery work; it does not
repair SMTP connectivity. Verify the Railway plan's outbound SMTP support and
Gmail credentials, or configure a separately approved HTTPS email provider.
Use an explicitly authorized test inbox to verify actual delivery.

Delivery is at least once: if SMTP accepts an email and the process dies before
saving its acknowledgement, a retry may duplicate it. A final expired attempt
is marked `DELIVERY_OUTCOME_UNKNOWN` for operator review. Deleting an enquiry
deletes its jobs, cancelling unclaimed work; an already in-flight email may
still finish. Updating an enquiry does not rewrite the original notification.

## Local verification

Use a disposable localhost database with `gcv_contact_test` in its name, apply
the migrations, then run `npm run test:contact` with that `DATABASE_URL`.
Tests exercise real HTTP and database transactions, inject fake SMTP delivery,
and never send email. Keep the worker disabled for browser tests as well.

## Rollback

Pause the worker first if necessary. Revert application code while retaining
the additive database table and its jobs. The prior API resumes synchronous
email handling for new enquiries; retained jobs wait until the worker returns.
Do not drop the table or reset the database to roll back this release.
