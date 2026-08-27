# Found Words — On-Demand Support Triage (runbook)

**How to run it:** while your computer is connected to the Claude session, say
something like *"run the Found Words support triage."* Claude reads your inbox,
sorts the messages, and prepares **reply drafts directly in your Outlook Drafts
folder** — threaded onto each original message, ready for you to review, edit,
and send. **Nothing is ever sent automatically, and the incoming mail is never
modified.** You always hit send yourself (with your normal Outlook login/MFA).

**Prerequisite:** the **Microsoft 365 connector** must be connected (signed in as
the mailbox account, josh@foundwords.org — the public address `hello@foundwords.org`
is an alias that delivers into it) and enabled in the chat. If it isn't connected,
the run should stop and say so.

---

## What Claude does on a run

1. **Read new messages.** Using the Microsoft 365 connector (`outlook_email_search`
   + `read_resource`), find genuine feedback & support messages in the Inbox from
   roughly the last 7 days (adjust on request). These are messages sent to
   hello@foundwords.org, including messages sent through the website contact form
   (it opens the visitor's own email app, so they arrive as ordinary emails from the
   sender's real address). **Ignore system/admin mail** (Microsoft 365,
   GoDaddy, security notices, newsletters) and spam — no drafts for those.
2. **Skip already-handled ones.** Skip any message that already has a reply draft in
   the Drafts folder (its conversation already has an unsent AI draft) so re-running
   doesn't duplicate.
3. **Categorize** each real message using `docs/support-playbook.md`:
   Thank-you/story · Support/how-to · Bug report · Feature idea · General feedback ·
   Clinical/partnership/press · Spam (skip spam).
4. **Create a reply draft** for each with `outlook_create_reply_draft` (bodyType
   `html`). Write the reply in Found Words' voice — warm, plain, grateful, concrete;
   signed "— Josh, Found Words" — following the per-category guidance in the playbook.
   For clinical/partnership/press: draft only a warm opener offering a real
   conversation (no commitments), and flag it for Josh to handle personally.
5. **Report** a summary in chat: one line per message (sender, category, gist,
   "draft ready"), with urgent items and any partnership/press/clinical messages
   called out. Do not send anything.

## Priority order

1. People currently unable to use the app (support/bug blocking use).
2. Bug reports with possible **data loss** — lead the reply with the backup workaround.
3. Everything else by date received.

## Notes
- Drafts live in your Outlook **Drafts** folder — review, tweak, and send each one.
  They send from the right address automatically; no copy-paste.
- Reply tone, category rules, and copy-paste-ready templates live in
  `docs/support-playbook.md` — the source of truth for voice.
- The connector can also apply Outlook categories/labels if you ever want handled
  mail tagged (e.g. a "FoundWords/Triaged" category); ask and it can be added.
