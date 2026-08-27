# Found Words — Funding & Donation Notes

_Last researched: 2026-08-26. Not legal/tax advice — confirm with a nonprofit
accountant before formalizing anything._

## Current approach (decided 2026-08-26)
- Accept donations as **individual support** (GitHub Sponsors or Ko-fi) to start.
  Money is personal income, **not tax-deductible** for donors. Homepage copy uses
  neutral "**Support the project**" framing — no "donate to a charity",
  no "tax-deductible", no implication of nonprofit status.
- The donate button is just a URL (`DONATE_URL` in `site/index.html`), so we can
  swap providers later with a one-line change.

## The three standard paths (by stage)
1. **Individual sponsorship** — GitHub Sponsors / Ko-fi / Buy Me a Coffee. Instant,
   personal income, not deductible, ~no overhead. Where we are now.
2. **Fiscal sponsorship** — operate under an existing 501(c)(3)'s umbrella; donations
   become **tax-deductible**, they handle compliance; fee ~5–15% of revenue; live in
   days; no incorporation. The sweet spot once there's momentum (budgets < ~$100K).
3. **Own 501(c)(3)** — full control + own exempt status + grant eligibility, but
   board, bylaws, state charity registration, annual Form 990. IRS fee: **1023-EZ
   $275** (if projected gross receipts ≤ $50K/yr) or **full 1023 $600**; ~$275–$5K
   up front, ~$500–$2K/yr ongoing; months to approval. Worth it at sustained scale.

## Fiscal-sponsor search results (for when we're ready for path 2)

**Finding:** there is no well-known *assistive-technology / disability-specific*
fiscal sponsor to slot into. Found Words is open-source software with a charitable
mission, so the practical candidates are (a) FOSS-focused sponsors and (b)
mission-agnostic general sponsors that accept health/disability/tech projects.

### Best fits — FOSS-focused (natural home; Found Words is MIT-licensed)
- **Open Source Collective** (via Open Collective) — 501(c)(3) fiscal host built for
  open-source projects; integrates with GitHub Sponsors; public transparent budgets;
  host fee ~10%. Low barrier, fast — likely the easiest first move. opencollective.com/opensource
- **Software Freedom Conservancy** — FOSS-only fiscal sponsor; **10% of revenue**;
  but requires an *established, diverse developer community* (typically >1 yr, OSI-approved
  license). More selective/prestigious — Found Words is probably too early (still a
  solo project). They point smaller projects to SPI. sfconservancy.org/projects/apply
- **Software in the Public Interest (SPI)** — FOSS fiscal sponsor for smaller projects;
  lower fee (~5%). Good lightweight option if Open Source Collective isn't preferred.

### Best fits — general / mission-agnostic (will take an assistive-tech project)
- **Social Good Fund** — broad, accessible sponsor. Model A ~8%→6%, Model C ~6.5%→5%
  (+ $29/mo admin, waived once you have $10K funding, refundable after $5K/yr raised);
  **no minimum balance** to start. Good for very early projects. socialgoodfund.org
- **NOPI (Nonprofit Incubator)** — mission-agnostic sponsor with a solid transparency
  toolkit. thenopi.org/fiscal-sponsorship
- Others to compare: Players Philanthropy Fund, Center for Transformative Action.
- **Fiscal Sponsor Directory** (fiscalsponsordirectory.org) — searchable directory to
  find more sponsors by mission/region; use it to shortlist when the time comes.

### Adjacent (NOT fiscal sponsors, but relevant for AT funding/partnerships/distribution)
- **ACL Assistive Technology program** & state **AT Act programs / ATAP** — public AT
  programs; potential distribution/partnership and grant channels, not a donation route.
- **ATIA** (Assistive Technology Industry Association) — industry body; networking, not
  a sponsor.

## Recommendation when scaling up
Start individual (Ko-fi/GitHub Sponsors). When donations gain momentum and donors want
deductibility, move to **Open Source Collective** (easiest, FOSS-native) or **Social
Good Fund** (general, very early-stage friendly). Only form an own 501(c)(3) if it
becomes a sustained organization needing grants/staff.
