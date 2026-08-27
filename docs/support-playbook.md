# Found Words — Support & Feedback Playbook

This is the reference for handling messages that arrive at **hello@foundwords.org**
(directly, or via the contact form on foundwords.org). It powers the daily
on-demand "support triage" (see `support-triage-runbook.md`), which reads new
messages, sorts them, and prepares **draft** replies in Outlook for review.
**Nothing is ever auto-sent** — Josh approves and sends every reply.

## Voice & tone

Found Words is built for families in a hard season — someone they love is losing
their words. Replies should be:

- **Warm and human**, never corporate. Short sentences. Plain language.
- **Grateful.** Most people who write took real effort to do so.
- **Concrete.** If there's a fix or a workaround, give the exact steps.
- **Honest about privacy.** Reassure people we can't see their photos or data.
- **Signed simply**, e.g. "— Josh, Found Words".

Avoid: jargon, over-apologizing, promising dates we can't keep, asking people to
"open a GitHub issue" as a brush-off (fine to mention, but handle it for them).

## Categories & how to handle each

| Category | Signal | Draft should… |
|---|---|---|
| **Thank-you / story** | Gratitude, "this helped my mom" | Thank them warmly, invite them to share more if they'd like, no ask. |
| **Support / how-to** | "How do I…", stuck on setup, PIN, backup | Give exact steps. Link the app section. Offer to walk through it. |
| **Bug report** | "It broke", "won't load", data lost | Acknowledge, ask for browser/device + steps if missing, give a workaround (esp. **back up via Settings**), flag for the issue list. |
| **Feature idea** | "It would be great if…" | Thank them, reflect the idea back accurately, say it's noted. No promises. |
| **Feedback (general)** | Opinions, praise + suggestions | Thank them, respond to the substance briefly. |
| **Press / partnership / clinical** | SLP, care facility, media | Warmer/longer, offer a real conversation. Do **not** auto-draft a commitment — flag for Josh to handle personally. |
| **Spam / unrelated** | Marketing, SEO offers | No draft. Label and skip. |

## Priority

1. Anyone **stuck and unable to use the app** (support/bug affecting use) — first.
2. Bug reports involving **possible data loss** — first, and always lead with the backup workaround.
3. Everything else by date received.

## Key facts to draw on

- Found Words is **free, open-source, private**. All photos/data stay on the
  device (browser IndexedDB). No accounts, no cloud, no tracking.
- **Back up often:** Caregiver Mode → Settings → Backup (exports a JSON file).
  Clearing browser data deletes everything — the backup is the only copy.
- **Caregiver Mode:** tap the gear, default PIN **1234** (changeable in Settings).
- **Restore:** Settings → Restore, choose the JSON backup (overwrites current data).
- **Install:** it's a PWA — "Add to Home Screen" on iPhone/Android, or install from
  the browser on desktop. Works offline after first load.
- **Voice clips:** in Caregiver Mode, each card can hold a short recorded voice
  (up to 10 seconds) that plays when the card is tapped — a loved one's voice, or
  the person's own. Stored on-device like photos, and included in backups.
- The app lives at **foundwords.org/app**; the homepage is **foundwords.org**.
- Repo / to contribute: github.com/Ord3rProductions/FoundWords (MIT).

## Reply templates (starting points — always personalize)

### Thank-you / story
> Hi {name},
>
> Thank you so much for writing — this is exactly why Found Words exists. It means
> a great deal to hear it's helping {who}. If you ever feel like sharing more of
> your story, I'd love to hear it, but there's no need. Wishing you and your family
> the best.
>
> — Josh, Found Words

### Support / how-to (example: backup)
> Hi {name},
>
> Happy to help. To back up everything: open the app, tap the gear in the corner,
> enter your PIN (the default is 1234 unless you changed it), go to **Settings**,
> and tap **Backup** — it saves a single file with all your categories, photos, and voice recordings.
> Keep that file somewhere safe; it's the only copy outside the device.
>
> If you tell me what device and browser you're using, I can give you the exact
> steps for it. Glad to walk through it together.
>
> — Josh, Found Words

### Bug report
> Hi {name},
>
> Thank you for flagging this — and I'm sorry for the trouble. So I can pin it
> down, could you tell me: what device and browser you're on, and what you were
> doing right before it happened?
>
> In the meantime, if you haven't already, please make a backup (gear → Settings →
> Backup) so your data is safe while I look into it. I'll follow up as soon as I
> know more.
>
> — Josh, Found Words

### Feature idea
> Hi {name},
>
> Thank you — I really like this idea. Just so I've got it right: {restate the
> idea}. I've noted it down. I can't promise a timeline, but suggestions like
> yours are how Found Words gets better. I appreciate you taking the time.
>
> — Josh, Found Words

### Clinical / partnership (flag for Josh — draft an opener only)
> Hi {name},
>
> Thank you for reaching out. I'd genuinely welcome a conversation about how Found
> Words could help {their setting}. Would a short call work? I'm flexible — just
> let me know a couple of times that suit you.
>
> — Josh, Found Words
