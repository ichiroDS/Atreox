
/* ══════════════════════════════════════════════════════════════════
   catalog.jsx — the single source of truth the three pages share.

   Functions sells a module, Guides teaches it, Pricing closes it, and
   Home's pipeline points at all three. Each of those pages used to hold
   its own copy of the module list; keeping them in one table is what
   makes the cross-links between the pages impossible to drift.

   Loaded after shared.jsx (it reads the icon components off window).
══════════════════════════════════════════════════════════════════ */

const {
  MessageSquare, Brain, Zap, Sparkles, Globe, Users, Layers, Palette,
} = window;

/* ── Modules ──────────────────────────────────────────────────────
   ORDER IS NOT EDITORIAL. This array is in the dashboard's own nav
   order (atreox-dashboard/lib/nav.ts NAV_ITEMS), so someone reading
   Functions or Pricing meets the modules in the order they'll meet
   them in the panel. Don't re-sort it by price or by pipeline stage.

   `price` is the monthly list price in EUR and must match
   MODULE_CATALOGUE in atreox-dashboard/lib/stripe/modules.ts, which is
   what Stripe actually charges.

   `billing` is that same module's id IN THE PANEL, and it is the ONLY
   place the two spellings are ever reconciled. Ours are hyphenated
   because `key` doubles as the guide slug (/guides/mass-reactions);
   the panel's are underscored because that is the wire form shared
   with Stripe lookup keys and entitlement metadata. The Pricing page's
   CTA reads this field to build ?modules=…, and the panel accepts that
   spelling and no other — verified from the panel's side by
   atreox-dashboard/scripts/check-billing-deeplink.ts, which asserts
   our hyphenated form is REJECTED there. It lives on the module row
   rather than in a lookup table beside it so that adding a module
   cannot leave a gap: there is no second list to remember. Only priced
   modules carry it; the two included ones are never sold, so a billing
   id for them would name something you cannot buy.

   `included: true` marks the two modules
   that ship with any purchase and are never sold alone (the engine's
   INCLUDED_WITH_ANY_PURCHASE) — they're how you get accounts into the
   system in the first place, so they're in this table for Functions
   and Guides but filtered out of the Pricing picker.

   EVERY claim in `steps` / `config` / `guard` is checked against
   atreox-engine, not against what the site used to say. Nothing that
   lives in that repo's RESERVED_CONFIG_FIELDS belongs here: those are
   settings the API refuses to write, so describing them sells
   something that silently does nothing.

   `guard` is optional — the one non-obvious limit a buyer worried
   about losing accounts should read before paying, rendered as its own
   block on Functions.

   `anchor` / `guide` are the cross-page link targets:
     Functions section  → #fn-<key>
     Guides card        → #guide-<guide>
─────────────────────────────────────────────────────────────────── */
const MODULES = [
  {
    key: 'account-manager',
    name: 'Account Manager',
    price: 0,
    included: true,
    icon: Layers,
    guide: 'account-manager',
    desc: 'Import, check, proxy and monitor every account the modules run on.',
    tagline: 'Included with everything',
    problem:
      "Every module here runs on Telegram accounts, and accounts are the part that breaks. They get flood-waited, restricted, frozen, or quietly lose the ability to resolve anything at all while every flag Telegram reports stays clean. Without one place to see that, you find out when a campaign stops producing.",
    does:
      "The Account Manager is where accounts enter the system and where their health is tracked afterwards. It is not sold separately — you cannot use any other module without it, so it comes with any purchase, down to a single module.",
    steps: [
      ['Import', 'Add accounts one at a time, in bulk up to 100 per request, or by converting tdata folders.'],
      ['Proxy', 'Paste a proxy list in whatever format you have it in. The engine reparses and validates it server-side, then assigns one per account.'],
      ['Check', 'Two different checks: Telegram\'s own restricted/scam/fake flags, and a capability probe that resolves a real public username and reads its history — which is what catches an account that is frozen while every flag stays clean.'],
      ['Watch', 'Status per account — active, cooldown, banned, disabled, paused — with the cause attached: floodwait, peerflood, profile update, discovery, or a limit it reached.'],
      ['Assign', 'Accounts go into module pools from here. One account has one driver: a module refuses an account another module already holds, and says which one.'],
    ],
    config: [
      ['Bulk import', 'CSV, paste or tdata conversion, with a per-row success or failure reason.'],
      ['Proxy assignment', 'Bulk paste, per-account reassignment, and a live proxy check with latency.'],
      ['Health checks', 'Status check and capability check, run per account or across a selection.'],
      ['Comment limits', 'Set or clear a per-account cap in bulk, and reset counters.'],
      ['Profile editing', 'First name, last name, bio, username and avatar per account — with the 48h username cooldown and 1h profile-change cooldown surfaced rather than hit blindly.'],
      ['Pause and resume', 'Manual pause and automatic pause on limit, kept visibly distinct.'],
      ['Per-account history', 'Comments per day for the week, cooldown reasons, last used, and flag state as of the last check.'],
    ],
  },
  {
    key: 'active-warmup',
    billing: 'active_warmup',
    name: 'Active Warmup',
    price: 30,
    icon: Zap,
    guide: 'active-warmup',
    desc: 'Runs scheduled activity on your accounts so a new one behaves like a used one.',
    tagline: 'History, before you need it',
    problem:
      "A fresh Telegram account with no history that starts posting comments on day one is the single most common way to lose a batch of accounts. The account has nothing behind it: no reading, no joins, no reactions, no reason to exist. Telegram notices.",
    does:
      "Active Warmup has the account do human-shaped things — reading channels, opening dialogs, reacting, joining — on a schedule, in your timezone, before and alongside the modules that actually earn. Its schedule, intensity and action-specific age checks govern that activity. Supervise is configured separately in Accounts and gates only the three outreach modules.",
    steps: [
      ['Enrol', 'Turn it on per account. The starting intensity is picked from the account\'s real age — under a week Careful, under a month Normal, older than that Aggressive.'],
      ['Schedule', 'Activity only happens inside the windows you set, in the timezone you set, with optional random breaks so the pattern is not a metronome.'],
      ['Act', 'The account works through its enabled action list at the pace its intensity preset allows.'],
      ['Adapt', 'With progressive increase on, a newly enrolled account starts at 30% of its caps and reaches 100% over its first week — measured from when you enrolled it, not from how old the account is.'],
      ['Settle', 'After 60 days enrolled the account moves to the maintenance tier and its limits are lowered to a small holding level. It stays warm without accumulating activity it no longer needs.'],
    ],
    config: [
      ['Intensity preset', 'Careful, Normal or Aggressive — each a full set of hourly and daily action, join and message caps rather than a single dial.'],
      ['Action checklist', 'Every action type toggled individually, each carrying its own minimum account age and a flag for whether it is traffic-heavy.'],
      ['Schedule', 'Any number of start/end windows, a timezone, and random breaks.'],
      ['Caps', 'Actions per hour, actions per day, joins per day, messages per day — overridable on top of the preset.'],
      ['Auto-adapt & progressive increase', 'Let the engine move the caps as the account matures, or hold them fixed.'],
      ['Economy mode', 'On by default. Drops every action marked traffic-heavy outright rather than reordering them — the setting to turn off when accounts sit behind metered proxies and you want the full action list anyway.'],
      ['Target channels', 'Where the warmup activity happens, and whether your own channels count.'],
      ['Reapply template', "An optional warmup action that re-applies each account's own template on a schedule; nothing to pick here."],
      ['Live status', 'Per account: resting, in-window, next window, current caps, and a 30-day action history with the outcome of each one.'],
    ],
    guard: 'Keep the action-specific age checks, schedule and intensity caps in mind. Supervise in Accounts does not pause this module or impose a passive resting floor; it gates Neurocommenting, Neurodialogs and Mass Reactions only.',
  },
  {
    key: 'profile-templates',
    name: 'Profile Templates',
    price: 0,
    included: true,
    icon: Palette,
    guide: 'profile-templates',
    desc: 'One face, applied across a batch of accounts.',
    tagline: 'Included with everything',
    problem:
      "Fifty accounts with no avatar, no bio and a default name are fifty accounts that read as one bot farm. Fixing that by hand is an afternoon per batch, and doing it too fast trips Telegram's own profile-change limits.",
    does:
      "A Profile Template is a name, a bio and an avatar you define once and apply to a selection of accounts as a background job. Like the Account Manager, it ships with any purchase — it's how accounts stop looking identical, not a feature you should have to buy separately.",
    steps: [
      ['Define', 'Name, first name, last name, bio and an avatar image.'],
      ['Interpolate', 'The bio can reference the account\'s own first name, so a shared template does not produce a shared sentence.'],
      ['Apply', 'Select accounts and run it. The apply is a tracked background task, not a fire-and-forget loop.'],
      ['Pace', 'Accounts are done one at a time with a 30–90 second gap between them. Three floodwaits in a row and the run pauses itself for half an hour instead of pushing on.'],
      ['Keep', "Active Warmup's Reapply account's template action refreshes the face on a schedule - each account keeps the template Apply gave it."],
    ],
    config: [
      ['Template fields', 'Name, first name, last name, bio and avatar.'],
      ['Bio interpolation', 'A {first_name} token. The panel holds you to 200 characters of raw template and 70 characters once the token is filled in, counted live as you type.'],
      ['Avatar upload', 'One image per template, reused across every account it is applied to.'],
      ['Bulk apply', 'Any selection of accounts, tracked as a task with per-account results.'],
      ['Cooldown awareness', 'One profile change per account per hour and one username change per 48 hours, reported as reasons rather than silent failures. The cooldowns are per account, so a bulk rollout scales with the size of your pool instead of queueing behind itself.'],
    ],
  },
  {
    key: 'neurocommenting',
    billing: 'neurocommenting',
    name: 'Neurocommenting',
    price: 50,
    icon: MessageSquare,
    guide: 'neurocommenting',
    desc: 'Watches the channels you choose and writes a comment under every new post.',
    tagline: 'The engine that posts',
    problem:
      "Manual commenting is the only Telegram growth channel that actually converts, and it's the one that doesn't scale. One person can watch maybe five channels and still write something worth reading. At fifty channels you're either late to every post or posting filler that gets deleted.",
    does:
      "Neurocommenting watches your target channels for new posts and writes a comment under each one from an account in your commenting pool. Every comment is generated against that specific post — the model reads the post text and answers it, in the channel's own language and register. It can also decline: a post the persona has nothing to say about comes back as a skip instead of filler.",
    steps: [
      ['Watch', 'The engine polls every channel in your list and picks up new posts as they appear.'],
      ['Match', 'Auto-assignment picks which account comments where, spreading channels across the pool so no single account is the one that always shows up.'],
      ['Generate', 'The post text goes to the model along with your persona prompt. What comes back is a reply to that post, not a template with the channel name pasted in.'],
      ['Filter', 'Before anything is sent, the safety rule runs on top of your persona: posts about death, violent crime, war, disasters, mourning or partisan politics come back declined and are logged under their own reason.'],
      ['Post', 'The comment goes out after a randomised delay, through that account\'s own proxy, inside its own rate-limit budget.'],
      ['Log', 'Every generation, skip, rate-limit and failure lands in the live log with the post it belongs to — so a bad comment is traceable to the post that produced it.'],
    ],
    config: [
      ['Persona presets — two modes', 'Structured mode builds the prompt from named fields: identity, tone, relevance, length, language strategy, hard rules, skip conditions and worked examples. Raw mode takes one freeform prompt and sends it as written. Six presets ship built in; swap between them without touching the channel list.'],
      ['Sensitive-content filter', 'An owner-level safety rule, on by default, that applies on top of whichever preset is active and in either mode — including a raw prompt that never mentions safety. Sensitive declines are counted separately from ordinary skips.'],
      ['Channel list', 'Add channels one at a time, bulk-paste them, or promote them straight from a parser run. Save any list as a reusable preset.'],
      ['Commenting pool', 'Which accounts are allowed to comment. An account driven by another module is refused with the reason, never silently double-booked.'],
      ['Delay range', 'Min/max seconds between comments, with Min / Recommended / Max presets (60–180s, 480–1500s, 1800–3600s).'],
      ['Per-account comment cap', 'A successful-comment ceiling after which an account pauses itself. Set in bulk, cleared in bulk.'],
      ['Hourly and daily rate limits', 'A live window showing what each account has spent this hour and today against its cap.'],
      ['Blacklist', 'Channels that refused a comment are grouped by cause — sending forbidden, no access, username not found, kicked from the discussion group — and prunable in one action.'],
    ],
    guard: 'Structured mode enforces its skip conditions for you. A raw prompt only skips if you write a skip instruction into it — the six built-in raw presets all include one, a prompt you write yourself is yours to get right. The sensitive-content filter applies either way.',
  },
  {
    key: 'neurodialogs',
    billing: 'neurodialogs',
    name: 'NeuroDialogs',
    price: 45,
    icon: Brain,
    guide: 'neurodialogs',
    desc: 'Answers direct messages and chat replies in context, from your own accounts.',
    tagline: 'The half nobody staffs',
    problem:
      "Commenting works, and then the replies arrive in your DMs at 3am. Most of them are the same four questions. Answer them twelve hours later and the lead is gone; answer them instantly, twenty times in a row, and you look exactly like a bot.",
    does:
      "NeuroDialogs answers private messages from your own accounts, using the conversation so far rather than the last line alone. It runs in sessions — the account comes online, reads its inbox, answers what's there, and goes away again — because an account that replies within four seconds at every hour of the day is the easiest thing in Telegram to spot.",
    steps: [
      ['Wake', 'Sessions are pulled by demand, not a timer: an inbox with people waiting brings the next one forward, an empty one lets it drift. Sessions only happen inside that account\'s own waking day, never at four in the morning.'],
      ['Read', 'It opens a capped number of dialogs and picks up what came in since last time.'],
      ['Answer', 'Each reply is generated from the last N messages of that thread plus your prompt and, if you attached one, your knowledge file.'],
      ['Pace', 'A cold first reply to a stranger waits longer than a follow-up inside a live conversation. Typing simulation runs while it waits, and a session extends itself while the other person is still writing back.'],
      ['Stop', 'The thread stops on its own terms: link sent, reply cap reached, blacklisted, blocked, or escalated to you.'],
    ],
    config: [
      ['Prompt presets', 'Named scenarios with their own system prompt and max reply length — a sales one and a support one can run side by side on different accounts.'],
      ['Knowledge file', 'Attach a document to a prompt; the engine tells you if it was longer than the budget and got truncated.'],
      ['Context depth', 'How many previous messages of the thread the model sees.'],
      ['Language', 'Auto-match the person writing to you, or pin one language.'],
      ['Session rhythm', 'Idle and hot gap ranges between sessions, session length range, and a max extension when the inbox is still busy.'],
      ['Reply delays', 'Separate min/max ranges for the first reply to a stranger and for replies inside a live thread, plus typing simulation and a skip probability.'],
      ['Limits', 'Replies per thread, per session and per day; new threads per day; dialogs read per session. Zero means no limit anywhere.'],
      ['Link gate', 'How many exchanges must happen before a link may be sent, and whether the thread stops once it has been.'],
      ['Safety valves', 'A block-rate threshold that pauses an account, a daily spend cap, a blacklist, and a switch for whether conversations older than the module get answered at all.'],
    ],
    guard: 'New threads per day is the limit that matters most: how many strangers one account opens a conversation with is the closest thing to what actually trips Telegram\'s spam detection. An account that has spent its daily replies still runs its session — it comes online, reads, marks things read, and writes nothing.',
  },
  {
    key: 'mass-reactions',
    billing: 'mass_reactions',
    name: 'Mass Reactions',
    price: 30,
    icon: Sparkles,
    guide: 'mass-reactions',
    demo: 'arrival-curve',
    desc: 'Reacts from a pool of your accounts — to posts, or to the comments under them.',
    tagline: 'The first hour decides',
    problem:
      "A post with no reactions reads as a post nobody saw, and Telegram's own surfacing leans the same way. The window that matters is the first hour after publication — exactly the window you cannot cover by hand across a network of channels.",
    does:
      "Mass Reactions watches your target channels and reacts to what appears there from a pool of your accounts, arriving the way a real audience arrives: not all at once, not evenly spaced, and not from every account you own. One switch decides what it reacts to — the channel's posts, or the first few comments people left under each post. It is one or the other, not both at once.",
    steps: [
      ['Target', 'Pick the channels. The engine probes each one for which reactions it actually allows — and separately probes its linked discussion group, which has its own membership and its own allowed set.'],
      ['Choose the surface', 'Post mode reacts to new posts as they appear. Comment mode ignores the posts and reacts to the first few real comments under each one instead, skipping the channel\'s own auto-forwarded copy. In comment mode the accounts join the discussion group first, because Telegram will not let them react there otherwise.'],
      ['Spread', 'A coverage range decides what share of the pool reacts at all, and the arrival curve decides when — human-shaped by default, uniform if you want it flat.'],
      ['React', 'Each account waits out its own delay and reacts once. One account gets one reaction per message, structurally — no retry can produce a second.'],
      ['Back off', 'Floodwait pauses the account for a set period; a streak of them stops it rather than grinding through.'],
    ],
    config: [
      ['Reaction surface', 'React to the posts themselves, or to the first N comments under each post. One or the other.'],
      ['Emoji set', 'Which reactions, random or sequential, weighted if you want an uneven spread — all checked against what that specific chat permits before anything is sent.'],
      ['Coverage', 'Min/max share of the pool that reacts to any given post, overridable per channel.'],
      ['Arrival curve', 'Human or uniform, with a first-reaction delay range and a spread window.'],
      ['Volume caps', 'Reactions per hour, per day, per channel per day, and per account per run.'],
      ['React probability', 'A chance to simply not react, so coverage never looks mechanical.'],
      ['Skip threshold', 'Leave posts alone that already have more reactions than a number you set.'],
      ['Max post age', 'How old a post can be and still be worth reacting to.'],
      ['Floodwait policy', 'Pause length and the streak limit that stops an account.'],
      ['Dry run', 'Do the whole pass for real — eligibility, ordering, cap evaluation — and report exactly what it would have done, withholding only the reaction itself. A rehearsal, not a separate code path.'],
    ],
    guard: 'On a channel you do not administer, coverage is capped at 35% of your pool no matter what you set. Telegram lets that channel\'s admins list exactly who reacted to a post, so a full-pool reaction on someone else\'s channel hands them your entire network in one call. Accounts younger than three days never react at all.',
  },
  {
    key: 'channel-parser',
    billing: 'channel_parser',
    name: 'Channel Parser',
    price: 20,
    icon: Globe,
    guide: 'channel-parser',
    demo: 'parser-funnel',
    desc: 'Finds channels by keyword and exports them as a target list.',
    tagline: 'Where your audience already is',
    problem:
      "Everything downstream depends on the target list, and most target lists are guesses — a dozen channels somebody found by searching Telegram manually, half of them dead, a quarter of them with comments switched off. Commenting into a dead channel costs exactly as much as commenting into a live one.",
    does:
      "The Channel Parser searches Telegram for channels matching your keywords, checks each candidate against thresholds you set, and gives you a scored, filtered list you can promote straight into the commenting engine. It also runs the other way: give it channels you already like and it finds ones like them.",
    steps: [
      ['Search', 'Keywords go out across your accounts in parallel, round-robin, so no single account carries the whole search. Telegram caps any one query at about ten results, so each keyword is also queried as several rephrasings to get past that ceiling.'],
      ['Evaluate', 'Each candidate is measured — members, posts in the last 7 days, comments on the last post, language — and accepted, rejected or skipped with the reason recorded.'],
      ['Score', 'Survivors get a score and land in a results table you can sort, filter and page through.'],
      ['Decide', 'Promote a channel into the commenting pool or reject it. Rejected ones stay rejected on later runs.'],
      ['Reuse', 'Export the list, or save it as a preset the commenting engine can load whole.'],
    ],
    config: [
      ['Keywords', 'A keyword list, with optional AI-suggested endings to widen a niche in the language you are targeting.'],
      ['Comments-closed filter', 'On by default: a channel with no linked discussion group is dropped, because there is nowhere to comment. It is the harshest filter in the pipeline — on live runs it accounts for roughly three quarters of everything rejected — so it has a switch, and the run tallies exactly how many candidates each filter cost you.'],
      ['Member range', 'Minimum and maximum subscribers — the upper bound matters as much as the lower one.'],
      ['Language filter', 'Ten languages, multi-select.'],
      ['Minimum comments on the last post', 'The single filter that separates a channel with an audience from a channel with a number.'],
      ['Result cap', 'Default 500, or uncapped up to the engine\'s 5000 safety ceiling.'],
      ['Accounts', 'Restrict the search to specific accounts, or let it use every validated one.'],
      ['Similar-channel search', 'Seed it with channels you already have and search one or two levels out from them.'],
      ['Live search log', 'Every candidate as it is evaluated, with the metric that decided it — cancellable mid-run.'],
    ],
  },
  {
    key: 'group-parser',
    billing: 'group_parser',
    name: 'Group Parser',
    price: 20,
    icon: Users,
    guide: 'group-parser',
    desc: 'Finds active public groups by keyword and exports them.',
    tagline: 'Rooms, not broadcasts',
    problem:
      "A group and a channel look alike in search results and behave nothing alike. A group can have forty thousand members and three people talking, or need admin approval to join, or be read-only for anyone who just walked in. You find all of that out after you have joined with fifty accounts.",
    does:
      "The Group Parser searches for public groups the same way the Channel Parser searches for channels, but measures the thing that actually matters in a group: how much was said recently, and by how many different people. It checks the access rules before you commit accounts to a room you cannot post in.",
    steps: [
      ['Search', 'Two different searches are combined: one matches a group\'s name, the other matches what people are actually saying inside it. They overlap far less than you would expect, so both are used.'],
      ['Measure', 'Messages in the last 7 days and distinct senders behind them — the pair that separates a conversation from one person talking to themselves.'],
      ['Gate', 'Groups needing admin approval to join, or that a new member cannot post in, are dropped before they reach you.'],
      ['Report', 'Results carry slow-mode duration, join-request status and where the group was found.'],
      ['Promote', 'Promote or reject, same as channels, into the same downstream lists.'],
    ],
    config: [
      ['Keywords', 'Same keyword and chunking model as the Channel Parser.'],
      ['Member range', 'Minimum and maximum members.'],
      ['Minimum messages in the last 7 days', 'Raw recent volume.'],
      ['Minimum unique senders', 'The real activity filter — volume alone is trivially faked.'],
      ['Language filter', 'Same ten languages.'],
      ['Open join required', 'Drop groups where joining needs an admin to approve it.'],
      ['Can-post required', 'Drop read-only groups where a new member could not send anything.'],
      ['Result cap and accounts', 'Same controls as the Channel Parser.'],
    ],
  },
];

const MODULE_BY_KEY = Object.fromEntries(MODULES.map(m => [m.key, m]));

/* Modules that carry their own price — the Pricing picker's universe. */
const PRICED_MODULES = MODULES.filter(m => !m.included);
const INCLUDED_MODULES = MODULES.filter(m => m.included);

const FULL_MONTHLY  = 120;
const FULL_YEARLY   = 1000;
const YEARLY_SAVING = FULL_MONTHLY * 12 - FULL_YEARLY;
const CHEAPEST_MODULE = Math.min(...PRICED_MODULES.map(m => m.price));

const eur = n => '€' + n.toLocaleString('en-US');

/* ── How it runs: the five stages, in the order they happen ────────
   Home renders this as a sequence with a live mock per stage. Each
   stage names the modules that do the work so the pipeline doubles as
   a map into the Functions page.
─────────────────────────────────────────────────────────────────── */
const PIPELINE = [
  {
    key: 'find',
    verb: 'Find channels',
    label: 'Discovery',
    modules: ['channel-parser', 'group-parser'],
    line: 'Search Telegram for the rooms your audience is already in, and throw away the dead ones.',
    detail:
      'Keywords go out across your accounts. Every candidate is measured — members, recent posts, comments on the last post, language, unique senders — and scored. What survives is a target list, not a guess.',
  },
  {
    key: 'warm',
    verb: 'Warm accounts',
    label: 'Preparation',
    modules: ['active-warmup', 'account-manager', 'profile-templates'],
    line: 'Give the accounts a face and a history before they ever post anything.',
    detail:
      'Profiles get names, bios and avatars from a template. Then the accounts spend days doing ordinary things — reading, joining, reacting — on a schedule in your timezone, at a pace matched to how old they are.',
  },
  {
    key: 'comment',
    verb: 'Comment',
    label: 'Reach',
    modules: ['neurocommenting'],
    line: 'Answer new posts in your target channels, in the channel\'s own register.',
    detail:
      'The engine picks up each new post, assigns it to an account, and generates a comment against that specific post. Randomised delays, per-account proxies, per-account rate budgets, and a live log of every one.',
  },
  {
    key: 'dm',
    verb: 'Answer DMs',
    label: 'Conversion',
    modules: ['neurodialogs'],
    line: 'Handle the replies the comments produce, without answering in four seconds at 3am.',
    detail:
      'Accounts come online in sessions, read their inbox and answer in context. A first reply to a stranger is slow, a follow-up is fast, and a thread stops itself once the link is out or the cap is reached.',
  },
  {
    key: 'react',
    verb: 'React',
    label: 'Amplification',
    modules: ['mass-reactions'],
    line: 'Make the first hour after a post look like the first hour of a post people saw.',
    detail:
      'A share of the pool reacts on a human arrival curve, inside what the channel actually allows, backing off on the first floodwait rather than grinding through it. Point it at the posts themselves, or at the comments people leave under them.',
  },
];

/* ── Guides ───────────────────────────────────────────────────────
   Each guide is a page of its own on the Guides reader: the index
   lists them, clicking one opens it with the chapter list beside it.

   `slug`    the internal id. It is what the old `#guide-<slug>` deep
             links used, so it must not be renamed — scripts/prerender.mjs
             keeps redirecting those anchors by it.
   `url`     the last segment of the guide's own page, /guides/<url>.
             THIS IS A PUBLIC, INDEXED ADDRESS: changing one costs the
             page its ranking and breaks every link pointing at it. The
             two prep guides are the ones strangers arrive on from
             search, so their wording is deliberate.
   `short`   one line for the index card — keep it to a few words.
   `intro`   the reader's opening paragraph. Module guides fall back to
             their module's own write-up in catalog, so only a prep
             guide with no `body` of its own carries one here.
   `covers`  the chapters, in order — the placeholder a guide lists
             until it has a `body`, which supersedes it.
   `body`    THE GUIDE ITSELF, once it is written: sections, each with
             an `id` (its anchor, and a public one — the chapter list
             links to it), a `title` and a list of blocks. A block is
             [kind, value]; the kinds are p, callout, steps, bullets,
             card, cards, options, kv, stat, figure, plates, table,
             checklist, note, linkout and faq, and both
             renderers — ReaderBlocks in guides.jsx and renderBlocks in
             scripts/prerender.mjs — must know every one of them. The
             prerenderer throws on a kind it does not, which is how a
             half-added block kind fails the deploy instead of quietly
             vanishing from the crawled page.
   `seoTitle`, `seoDescription`
             what a search result says, when the one-line `summary`
             under the heading is no longer the whole story. Optional;
             without them the head is built from title and summary as
             it always was. The page's own <h1> is `title` regardless.
   `module`  links the guide to its Functions section and its price
             (null for the prep guides, about things you buy elsewhere).
   `video`   a URL once one is recorded; the reader adds a Watch button
             when it is there and says nothing at all when it is not.

   Every field below is read at build time by scripts/prerender.mjs,
   which writes one static HTML page per guide. This table stays the
   only place the text lives; nothing here is copied into those files
   by hand.
─────────────────────────────────────────────────────────────────── */
const GUIDES = [
  /* ── Before you start ── */
  {
    slug: 'buying-accounts',
    url: 'buying-telegram-accounts',
    group: 'setup',
    title: 'Buying Telegram accounts',
    short: 'What to buy, what to avoid',
    summary:
      'What to buy, where, and how to tell a usable account from one that will die in a week — before you spend anything.',
    seoTitle: 'How to buy Telegram accounts: TData, GEO, testing',
    seoDescription:
      'Test a seller before you scale: TData format, GEO matched to your proxies, rest time, no spamblock, and the checks that catch a dead account.',
    module: null,
    video: null,
    body: [
      {
        id: 'hidden-mechanics',
        title: 'The Hidden Mechanics of Telegram Accounts',
        blocks: [
          ['p', "The foundation of everything in ATREOX is your accounts. They are your workforce, but here is the hard truth that beginners often miss: the biggest problem causing bans or limits is usually the accounts themselves. When you open a marketplace, you see millions of accounts and thousands of sellers. It is incredibly easy to spend a significant amount of money on a batch, watch them all get blocked immediately after their first neuro-commenting session, and assume either the software is broken or you did something terribly wrong. In reality, you just need to understand how to buy, verify, and test accounts properly."],
          ['callout', [
            "A common trap is assuming that two accounts with the exact same description from different sellers will yield the same results. They won't. Behind the scenes, Telegram evaluates an account based on over 100 hidden parameters to determine its trust score and lifespan. This includes the device ID used during registration, the specific version of the Telegram client, the quality of the phone number pool, and countless other microscopic details. The autoregers who create these accounts bake these parameters in from day one. Our team has analyzed massive volumes of accounts, and we've concluded that learning how to vet these hidden parameters by testing sellers is the most critical skill for anyone starting in Telegram traffic.",
            "This directly ties into pricing. You cannot expect a $0.20 account to perform identically to a $0.90 account, even if both meet our recommended basic characteristics. Cheaper accounts often mean those hidden registration parameters are of lower quality, and they carry a higher risk of bans, more meticulous testing and a slower warmup.",
            "But neither price on its own tells you which to buy, and reading the cheaper one as worse is the same error as reading it as better. Divide: at 25% survival the $0.20 account costs $0.80 per account that lives, and at 90% the $0.90 one costs $1.00 - so the cheap stock wins, narrowly, and would stop winning the moment its survival slipped a few points. Run that division on your own test batch instead of inferring quality from the price tag. Section 09 does the same arithmetic for whole countries.",
          ]],
        ],
      },
      {
        id: 'why-blocked',
        title: 'Why Telegram Accounts Get Blocked So Quickly',
        blocks: [
          ['p', "The stability of a Telegram account does not depend on one single factor, but on a set of parameters. In practice, it is not just a phone number and GEO, but a complete profile of where and how the account was created."],
          ['p', "Account survival depends on:"],
          ['bullets', [
            "the account GEO;",
            "the phone number pool used for registration;",
            "the registration device ID;",
            "the Telegram app version used during registration;",
            "the account age;",
            "the history of similar accounts with the same parameters;",
            "current ban waves affecting specific combinations of parameters.",
          ]],
          ['p', "That is why Telegram accounts with the same description in a marketplace are not equal. Two lots may have the same country, similar aging period, and the same price, but the real risk of being blocked can be completely different."],
        ],
      },
      {
        id: 'testing-sellers',
        title: 'Testing Sellers and Avoiding Instant Bans',
        blocks: [
          ['p', "Instead of buying 100 accounts from a single unknown seller right away, you need to run a testing protocol."],
          ['steps', [
            "Buy about 20 accounts each from a few different sellers that offer roughly the same parameters.",
            "Let them rest for three days without doing anything heavy.",
            "Apply your profile templates.",
            "Then, put them into the Active Warmup module on very conservative settings up to day five.",
            "Finally, run them through just one single neuro-commenting session.",
          ]],
          ['p', "The difference in survival rates between the sellers will usually be massive, instantly showing you who provides the actual quality you can scale with."],
          ['card', {
            kicker: 'Five to reject, twenty to measure',
            blocks: [
              ['p', "Five accounts tell you whether stock is catastrophic, not whether it is good. Nought or one alive out of five rejects a seller with confidence. Five out of five does not accept one - it earns a second, larger test. So: five to reject, twenty from the same listing to measure, and only then fifty. Buy the twenty as one purchase rather than spread over weeks, because stock rotates."],
              ['p', "For the five-account screen: import them into ATREOX and immediately run the account checks."],
              ['figure', {
                src: '/public/screenshots/buying-telegram-accounts/02.png',
                w: 1400, h: 697,
                alt: 'ATREOX Account Manager running health and capability checks on imported Telegram accounts',
                caption: 'Health check and capability check in the Account Manager',
              }],
              ['p', "Running a health check and capability check will update their status in the dashboard, ensuring you haven't bought accounts that are already heavily limited from the start."],
            ],
          }],
          ['p', "You might wonder how an account can be banned immediately upon import if marketplaces have built-in checkers that verify validity right before purchase. The reality is that the marketplace checker only confirms the account is alive at that exact moment on their native IP. But the moment that account hits the new IP of your proxy inside the ATREOX dashboard, Telegram runs a minimal stress test. If the account's hidden trust score is too low, it will be banned instantly upon that IP change. When you see this happen, take it as a clear signal that the account couldn't even survive the most basic environmental shift, and you should abandon that seller entirely."],
        ],
      },
      {
        id: 'recheck-frequency',
        title: 'How Often You Should Recheck an Account',
        blocks: [
          ['p', "Checking too often usually does not help. Account behavior does not change every minute."],
          ['p', "The logic is simple:"],
          ['bullets', [
            "after the initial check, you make a decision about purchase or warm-up;",
            "it makes sense to run a second check after a few days or after the warm-up stage;",
            "for accounts that are already working, it is worth considering the date of the latest rating update.",
          ]],
        ],
      },
      {
        id: 'evaluating-sellers',
        title: 'Evaluating Marketplace Sellers',
        blocks: [
          ['p', "When evaluating sellers on LZT Market, you will notice that almost everyone has a perfect 100% rating."],
          ['figure', {
            src: '/public/screenshots/buying-telegram-accounts/03.png',
            w: 816, h: 197,
            alt: 'LZT Market seller ratings all showing 100 percent',
            caption: 'Every seller shows 100% — the rating alone tells you nothing',
          }],
          ['p', "You must remember that these positive reviews are generated automatically if the buyer does not explicitly write a bad one. Therefore, a 100% rating is largely an illusion."],
          ['p', "You must manually open each seller's profile and look exclusively for the presence of negative reviews."],
          ['plates', [
            { tone: 'bad', label: 'Avoid', text: "If a seller has 7 or more negative reviews, that is a massive red flag and you should avoid them." },
            { tone: 'ok', label: 'Acceptable', text: "A count of 0 to 1 negative reviews is generally acceptable." },
          ]],
        ],
      },
      {
        id: 'main-filters',
        title: 'Main Filters When Buying Telegram Accounts',
        blocks: [
          ['p', "When purchasing Telegram accounts, you should primarily pay attention to the following factors:"],
          ['bullets', [
            "account origin (phishing, stealer, auto-registered, self-registered)",
            "account country (GEO)",
            "SpamBlock status (temporary, GEO-based, permanent)",
          ]],
          ['figure', {
            src: '/public/screenshots/buying-telegram-accounts/accsexamples.jpg',
            w: 1280, h: 583,
            alt: 'Telegram account marketplace listings showing autoreg tags, no-spamblock badges and country of origin',
            caption: 'Two listings with matching filters — autoreg, no spamblock, same country',
          }],
          ['p', "Different Telegram account marketplaces provide different filtering options and account characteristics. Understanding these criteria is important because otherwise you may not only purchase an account that is unsuitable for your intended use but could also violate local laws and regulations."],
          ['callout', [
            "Many Telegram account stores sell phishing or stealer accounts, meaning compromised accounts obtained without the owner's permission. Such accounts are popular among users involved in gray-area Telegram automation because they are inexpensive, available in large quantities, and have already been warmed up through real user activity. However, purchasing and using compromised accounts may violate applicable laws and platform policies.",
          ]],
          ['p', "For more legitimate use cases, buyers typically choose auto-registered accounts created specifically for resale. The account GEO and SpamBlock status are then selected based on the intended purpose. In most cases, users choose Telegram accounts from the same region where they plan to operate, advertise, communicate, or automate activities."],
          ['callout', [
            "These are two different questions and they have two different answers. The country of the channels you comment in is set by your audience. The country of the accounts you buy is set by what survives. They do not have to match, and for us they do not: we run Argentine accounts against channels that have nothing to do with Argentina. What must match is the account's country and its proxy's country.",
          ]],
        ],
      },
      {
        id: 'marketplaces-and-geos',
        title: 'Marketplaces, Formats, and GEOs',
        blocks: [
          ['p', "When buying accounts, ATREOX requires the TData format. TData is the local session data Telegram Desktop stores on a computer—a folder containing everything needed to log in without a phone number or SMS code. It ensures zero friction, no re-verification, and higher trust from Telegram."],
          ['p', "When it comes to selecting a GEO for your accounts, the golden rule is that the account GEO must strictly match the GEO of the proxies you bought or plan to buy. USA accounts are not always the best option."],
          ['p', "The ATREOX team currently buys Argentine accounts first and Uzbek accounts second, each paired with a proxy in the matching country."],
          ['p', "That is a change from what this guide used to say. We previously recommended Indonesian stock on the grounds that it is cheap, and we no longer do. We are not going to dress that up as a measurement: we do not have a per-country survival table we can stand behind, and section 09 explains why we took the old one down. What changed our minds was our own buying - Indonesian batches cost us less per account and left us with fewer working accounts than the Argentine and Uzbek ones we buy now. That is one operator's experience over a few months, not a study, and we are telling you which it is."],
          ['p', "The principle underneath it does survive without the table: stock bought because it is cheap is the mistake. The price you care about is the price of an account still working next month."],
          ['p', "Treat this as our current best answer rather than a settled one. It rests on our own purchasing, not on a measured survival table - and section 09 says when the first real numbers land."],
          ['p', "There are many stores, forums, and sellers in Telegram chats offering Telegram accounts for sale, but the following marketplaces are among the most popular:"],
          ['p', "If your primary marketplace is ever down, you need untested backups. Established English-facing marketplaces include:"],
          ['table', {
            head: ['Marketplace', 'Role', 'What it is known for'],
            rows: [
              ['lzt.market', 'Primary', 'A large selection of accounts with account validity checks before purchase.'],
              ['dark.shopping', 'Primary', 'A wide range of accounts, although prices may be above market average; replacement is available if an account is invalid.'],
              ['AccsMarket', 'Backup', 'The most recognized bulk-TData market. A well-established marketplace that has been operating for years and has earned user trust.'],
              ['BuyAccs', 'Backup', 'Cited for lower burn rates.'],
              ['Accs Trading', 'Backup', 'TData + Session, crypto payments.'],
            ],
          }],
        ],
      },
      {
        id: 'proxies-role',
        title: 'The Role of Proxies: Why Account Evaluation Is Incomplete Without Them',
        blocks: [
          ['p', "The final survival of an account depends not only on the account itself, but also on proxy quality. If you use a proxy with the same GEO as the account country, it looks more natural. But even then, the provider quality and connection stability matter. This means Telegram accounts cannot be evaluated separately from their environment. A good account with a bad proxy can perform poorly in real work."],
          ['linkout', { href: '/guides/proxies-for-telegram-accounts', label: 'Full guide: Choosing and connecting proxies' }],
        ],
      },
      {
        id: 'best-geos',
        title: 'Which Telegram Account GEOs Are Best to Use?',
        blocks: [
          ['p', "It is important to understand that GEO really matters."],
          ['callout', [
            "We do not have geo survival data yet, and we are not going to publish a chart we cannot reproduce.",
            "An earlier version of this page carried a benchmark ranking countries by survival rate. We have removed it. We could not establish where its numbers came from, and our own system does not hold enough per-country history to have produced them. A ranking you cannot check is worth less than no ranking at all, and we would rather lose the chart than have you spend money on it.",
          ]],
          ['p', "What we do have is what we are buying ourselves right now, and why."],
          ['p', "Argentina first, Uzbekistan second, with the proxy in the matching country. That is our judgement, based on price and on how our own purchases have gone so far. It is not a measured survival table, and you should treat it as our opinion until we can show you numbers."],
          ['callout', [
            "Day 7: what our own batches did",
            "We said we would publish this on 11 September, with the sellers named, whatever it said. Here it is, a day late.",
          ]],
          ['p', "We tested two Argentine batches bought on the same day from different sellers - AbonTg and theblja - plus an Uzbek batch. Same country for the two Argentine ones, same import day, same proxy setup, same warmup, and no commenting load on any of them."],
          ['p', "The result that matters: the seller's layover claim predicted nothing. theblja advertised thirty days of rest, and most of that batch was frozen inside the week. AbonTg made no claim we recorded, and almost all of it can still post. The Uzbek batch came through intact. Everything else about the two Argentine batches was the same, so if rest were the variable that mattered, this is the wrong way round."],
          ['p', "What this does not tell you is whether AbonTg is a good seller. None of these accounts has posted a comment, so what we measured is survival at rest - and a pre-flagged account surfaces when it is used, not while it sits. Surviving a week untouched means not yet disproven, not proven good. The theblja half is the stronger one: those accounts froze having done nothing at all, so they were not worn out by use. They arrived that way."],
          ['p', "The counts and the method are in the article below, with the sellers named. Day 30 is 3 October for the Uzbek batch and 4 October for both Argentine ones, and both this section and the article are updated on those dates."],
          ['linkout', { href: '/blog/telegram-account-aging-claims-tested', label: 'The full day-7 numbers, method and caveats' }],
          ['note', "One correction to this page: we wrote earlier that the Uzbek batch was imported on 4 September. It was imported on 3 September, so its day 30 falls on 3 October rather than the 4th."],
          ['p', "Until then, the only survival figures worth acting on are the ones you produce yourself: buy five, wait a week, count what is left."],
          ['callout', [
            "Survival rate on its own is the wrong number to buy on.",
            "What you are actually buying is a surviving account, and its price is what the seller charges divided by the share that lives. A geo that survives at 78% and costs four times more per account is the more expensive choice, not the better one.",
            "That is why Ukraine and Poland are not our recommendation. They do survive well - that part we are not disputing. They also cost around $2 to $2.50 per account, which is several times what Argentine and Uzbek stock costs, for a survival rate that is barely different. The same budget buys you far more working accounts in AR or UZ.",
          ]],
          ['p', "The general point outlives the chart we took down. A survival rate is one input and never a buying order on its own, and there are two things it cannot tell you:"],
          ['bullets', [
            "What the stock costs. Divide the price by the survival share before you compare anything.",
            "How long anyone has been watching. Our own Argentine batch was imported on 4 September, so it has no history at all yet - a batch that young cannot have died, whatever its numbers look like today. Ask that question of any survival figure you are shown, ours included.",
          ]],
        ],
      },
      {
        id: 'the-checklist',
        title: 'The Expanded Account Checklist',
        blocks: [
          ['p', "Before scaling your operations, run every new batch and seller against this expanded checklist to ensure your marketplace filters are set correctly."],
          ['figure', {
            src: '/public/screenshots/buying-telegram-accounts/01.png',
            w: 814, h: 889,
            alt: 'Telegram account marketplace filters for TData, GEO and rest time',
            caption: 'Marketplace filters set to the parameters from the checklist',
          }],
          ['checklist', [
            {
              tone: 'ok',
              title: 'The "Must-Have" Parameters',
              items: [
                ['Format & Ownership:', 'TData format exclusively, with "Not sold before" checked, and no account password set.'],
                ['GEO Match:', 'The account origin country must perfectly match your proxy location.'],
                ['Rest Time:', '14 to 30 days of rest time after registration is highly recommended for beginners. 7 days is the absolute minimum, reserved only for experienced users who know how to manage aggressive warmups.'],
                ['Clean Record:', 'Absolutely no spamblock. A spam-blocked account cannot comment and is dead weight.'],
              ],
            },
            {
              tone: 'bad',
              title: 'The "Red Flags" to Avoid',
              items: [
                ['Instant IP Death:', "If a seller's accounts are frozen or banned the moment they first connect through your proxy, abandon that seller. Read the error first, though: \"the authorization key was used under two different IP addresses\" is not a ban. It means the proxy's exit moved under the session and Telegram revoked that login - fix the proxy's hold time and log the account in again before blaming the seller."],
                ['0-Day / Fresh Accounts:', 'No rest time equals an instant ban.'],
                ['"Sold Before" or Password-Protected:', 'Someone else holds the keys to the session or can recover it.'],
              ],
            },
          ]],
          ['linkout', { href: '/guides/telegram-session-killed-by-ip-change', label: 'A dead session is not a banned account: how to tell them apart' }],
        ],
      },
      {
        id: 'future-tools',
        title: 'Future Tools and Final Expectations',
        blocks: [
          ['p', "In the future, the ability to register accounts directly inside ATREOX will be introduced as a separate Telegram Autoregistrar module. Until then, our team insists that you conduct your own research and develop a solid understanding of which accounts are worth buying and which are not. Without this foundational knowledge, an autoregistrar will not help you anyway. If you decide to purchase a third-party autoregistrar for mass registration in the meantime, we cannot provide any recommendations for those tools. You do so entirely at your own risk."],
          ['note', "Finally, please keep in mind that these are general recommendations from the ATREOX team. There are no people in this world who drive Telegram traffic without constantly losing accounts. The goal of this guide is not to promise a magical zero-ban workflow, but to help you minimize those losses. By following these steps, you can reduce your ban rate so effectively that losing a few accounts out of a batch of 100 becomes completely unnoticeable to your overall operation."],
        ],
      },
    ],
  },
  {
    slug: 'proxies',
    url: 'proxies-for-telegram-accounts',
    group: 'setup',
    title: 'Proxies for Telegram accounts',
    short: 'One per account, done right',
    summary:
      'Fifty accounts on one IP look like a farm to Telegram. The right proxy type, a GEO that matches, and a sticky exit that doesn\'t log you out.',
    seoTitle: 'Proxies for Telegram accounts: which type to buy',
    seoDescription:
      'Fifty accounts on one IP look like a farm. Datacenter, residential or mobile; sticky, never rotating; GEO matching, and a config that works.',
    module: null,
    video: null,
    body: [
      {
        id: 'why-proxies-matter',
        title: 'Why Proxies Matter & The Three Core Types',
        blocks: [
          ['p', "Accounts without proxies are dead accounts before they even begin. If you attempt to connect fifty or a hundred Telegram accounts from a single server or home IP address, Telegram immediately identifies the entire cluster as an automated farm."],
          ['figure', {
            src: '/public/screenshots/proxies-for-telegram-accounts/connection.png',
            w: 1280, h: 472,
            alt: 'Diagram showing a Telegram account connecting through a SOCKS5 proxy to the internet and then to the Telegram server',
            caption: 'One proxy, one account, one path to the Telegram server',
          }],
          ['p', "One flag on a single account will instantly trigger a chain reaction, wiping out every session connected to that same IP address. This guide covers how to choose, buy, and connect the right proxies to ensure maximum account lifespan."],
          ['p', "Search queries like \"best proxies for Telegram,\" \"Telegram SOCKS5,\" or \"cheap IPv4 for Telegram\" dominate the automation space for a reason. Proper proxy management directly dictates your account lifespan, ban frequency, operation speed, and capacity to scale."],
          ['figure', {
            src: '/public/screenshots/proxies-for-telegram-accounts/proxy.jpg',
            w: 1280, h: 720,
            alt: 'Three shields representing datacenter, residential and mobile proxies, over an IPv4 SOCKS5 network illustration',
            caption: 'Datacenter, residential, mobile — three networks, three trust levels',
          }],
          ['p', "There are three distinct categories of proxies. Understanding the difference is critical because choosing the wrong network type for your specific task guarantees instant failure."],
          ['table', {
            head: ['Type', 'What it is', 'Behavior in Telegram Automation', 'Pros', 'Cons'],
            rows: [
              [
                'Datacenter (IPv4)',
                'IPs from data centers or hosting servers. Fast, cheap, bought in bulk.',
                'Good for low-risk tasks and mass scaling. However, aggressive actions (spam patterns, mass logins) trigger limits much faster here.',
                ['Cheapest option.', 'Stable speed/ping.', 'Easy to scale.'],
                ['IPs are often "burned" by previous users.', 'Lowest trust level.', 'High risk during heavy automation.'],
              ],
              [
                'Residential',
                'Real home internet IPs. Looks like a standard user connecting from an apartment.',
                'Excellent for account warmup, careful activity, and mimicking real human behavior. Long lifespan if limits are respected.',
                ['High trust score.', 'Great for safe logins.', 'Fewer blocks.'],
                ['More expensive than Datacenter.', 'Speed can fluctuate.', 'Quality depends on the provider\'s pool.'],
              ],
              [
                'Mobile (4G/5G/LTE)',
                'Mobile carrier IPs. Shared dynamically among thousands of real cellular users.',
                'The most "alive" and natural IP possible. Excellent for mimicking mobile app usage, but requires careful GEO management.',
                ['Maximum natural trust.', 'Highest survival rate.'],
                ['Most expensive.', 'Unstable ping.', 'Bad IP/Country jumps cause suspicion.'],
              ],
            ],
          }],
          ['p', "The Practical Logic (Simply Put). Read the Pros and Cons columns as one sum rather than two lists: a proxy that costs twice as much and loses a third as many accounts is the cheaper proxy, and the table cannot show that on its own because it does not know what your accounts cost."],
          ['options', [
            { text: 'Need maximum savings and massive scale? Use Datacenter SOCKS5 (but keep your action tempo very conservative).' },
            { text: 'Need a "normal user" history and smooth warmup? Use Residential.' },
            { text: 'Need maximum natural behavior? Use Mobile proxies. They cost the most per line and they keep the most accounts alive, and those two facts have to be divided into each other rather than weighed against each other - what you are buying is a month of one account working, so compare the proxy line plus the account it carries, not the proxy line alone. On our own numbers mobile wins that division for a beginner, which is why we recommend it; if you are running datacenter proxies and losing accounts steadily, run the same division before concluding you are saving anything.', badge: 'Recommended for beginners' },
          ]],
        ],
      },
      {
        id: 'rotation-trap',
        title: 'The Rotation Trap: Your Exit IP Must Not Change',
        blocks: [
          ['p', "Telegram automation fundamentally requires the SOCKS5 protocol for stable, persistent connections. However, how that IP behaves over time introduces significant risks."],
          ['callout', [
            "What matters is that the exit IP does not change underneath a logged-in session. Two things give you that: a sticky session, where a rotating pool holds one IP for the length of your session, and a dedicated static IP. Either is fine. What is not fine is timed rotation - an exit that changes every N seconds or minutes regardless of what your account is doing. Providers call the safe option \"sticky\", so that is the word to look for.",
          ]],
          ['p', "Timed rotation causes instant account logouts. When the exit IP moves mid-session, Telegram reads it as a hijacked session and forcefully deauthorizes the account. A premium mobile proxy on timed rotation performs worse than a cheap sticky one, because what kills the account is the change itself, not the quality of the address it changes to."],
        ],
      },
      {
        id: 'golden-rule-geo',
        title: 'The Golden Rule: Exact GEO Matching',
        blocks: [
          ['p', "A critical mistake beginners make is purchasing premium accounts from one region and running them through proxies from another."],
          ['callout', [
            "If you purchase Argentine accounts, you must run them exclusively through Argentine mobile proxies. When a Telegram session originally registered on a cellular network in Buenos Aires suddenly authenticates from a server in Frankfurt, the platform detects an anomalous location jump and flags the account instantly. Always align your account GEO and proxy GEO with strict precision.",
          ]],
        ],
      },
      {
        id: 'dataimpulse-setup',
        title: 'Buying Mobile Proxies',
        blocks: [
          ['p', "For reliable mobile proxies, the ATREOX team mostly uses DataImpulse. They offer a pay-as-you-go model billed by bandwidth (GB) with clean SOCKS5 outputs. The settings below are named the way DataImpulse names them, but every provider asks the same questions under labels of its own."],
          ['plink', [
            "A note on providers. DataImpulse is what we use for most geos, but it does not carry every country - Argentina, currently our first recommendation, is not available there at all. For Argentine proxies we use ",
            { text: 'FloppyData', href: '/go/floppydata', rel: 'sponsored' },
            ". That is an affiliate link: we receive a share of what you spend there, and that is not why we name them - it is the provider our own Argentine accounts run through. Check that your provider actually offers the country before you buy the accounts.",
          ]],
          ['p', "The exact settings to use when generating your list:"],
          ['linkout', { href: '/guides/telegram-session-killed-by-ip-change', label: 'Why a missing hold time kills sessions: one case, traced' }],
          ['callout', [
            "Type: Sticky. Not rotating.",
            "This is the most important setting on this page, and an earlier version of this guide got it wrong. A rotating proxy changes its exit IP on a timer, underneath a session that is already logged in. To Telegram that looks like the account moving to a different address mid-session, which is one of the clearest signals it acts on.",
            "Every proxy the ATREOX team runs is sticky, and every proxy we recommend is sticky. If you are currently running accounts on rotating proxies because of the earlier version of this page, move them to sticky. Any survival results you collected on rotating proxies measured the proxy, not the stock.",
          ]],
          /* ADDED 2026-09-14, and it corrects this page rather than extending
             it. "Sticky" on its own was the whole instruction, and on
             DataImpulse a sticky PORT without a hold time is exactly the
             setup whose exit was measured changing carrier inside 23 minutes
             and whose session Telegram then killed. Following this guide to
             the letter produced that setup. */
          ['callout', [
            "Sticky is not enough on its own: set the hold time.",
            "On DataImpulse, Sticky gives the account a port that selects a session. How long that session keeps one exit address is set in the login, with sessttl: append ;sessttl.1440 to the login, with a dot, not a dash. Without it the session is held for the provider's default, which is short - we measured one such login move between three addresses on two carriers in 23 minutes, and the account's session died.",
          ]],
          ['kv', [
            ['Type', 'Sticky. Not rotating.'],
            ['Hold time', 'Append ;sessttl.1440 to the login, e.g. yourlogin__cr.us;sessttl.1440. A dot between sessttl and the number.'],
            ['Targeting', 'Target Filters, and select the country there. Default targeting means no country selection at all, so it cannot satisfy the matching rule above.'],
            ['Country', "Must exactly match the account's own country."],
            ['Protocol', 'SOCKS5. Do not use HTTP or HTTPS.'],
            ['Format', 'login:password@hostname:port or socks5://user:pass@ip:port'],
            ['Quantity', 'One proxy line per account. Two accounts behind one exit is a shared-IP signal, and ATREOX now warns you about it in Account Manager.'],
          ]],
        ],
      },
      {
        id: 'loading-proxies',
        title: 'Loading Proxies into ATREOX',
        blocks: [
          ['p', "We frequently hear from users who say, \"I bought proxies, they work in my browser, but my Telegram accounts won't connect in ATREOX!\" This is almost always due to incorrect formatting (using HTTP instead of SOCKS5) or dead SOCKS ports."],
          ['p', "ATREOX simplifies network distribution, ensuring you never accidentally overlap connections."],
          ['figure', {
            src: '/public/screenshots/proxies-for-telegram-accounts/reassign.png',
            w: 678, h: 696,
            alt: 'ATREOX Reassign Proxies dialog pasting a distinct proxy per account with format detection',
            caption: 'Reassign Proxies: one distinct proxy per account, or the whole request is rejected',
          }],
          ['cards', [
            {
              kicker: '1. Manual Assignment (For Single Accounts)',
              blocks: [
                ['steps', [
                  'Open the Account Manager and click the account\'s row.',
                  'In the Overview tab, under Proxy, press Edit proxy.',
                  'Paste your connection string (e.g., ip:port:login:password).',
                  'Click Save proxy.',
                ]],
              ],
            },
            {
              kicker: '2. Bulk Reassignment (Proxy Pool)',
              blocks: [
                ['p', "The Proxy Pool feature allows you to automatically distribute a large batch of proxies across hundreds of accounts in just two clicks."],
                ['steps', [
                  'Select your target accounts in the dashboard.',
                  'Press Reassign proxies, top right.',
                  'Paste your entire list of proxies in bulk.',
                ]],
                ['p', "The engine strictly enforces one distinct proxy per account. It never reuses a proxy across two accounts in the same call. Note: If you do not provide enough distinct proxies for your selected target accounts, the engine will reject the whole request to protect your cluster."],
              ],
            },
          ]],
        ],
      },
      {
        id: 'bandwidth-budgeting',
        title: 'Bandwidth Consumption and Campaign Budgeting',
        blocks: [
          ['p', "Unlike a dedicated static IP that is rented per monthly slot, mobile proxies are usually billed by traffic consumption. If your available data balance hits zero in the middle of an active campaign, your network connection drops and every running account goes dark simultaneously."],
          ['p', "Rule of thumb: Budget approximately 1 GB of data per 100 accounts per full neuro-commenting session."],
          ['stat', { value: '1 GB', label: 'per 100 accounts, per session' }],
          ['p', "Running out of data will not get your accounts banned, but it will instantly freeze your campaign flow until the balance is refilled. Always maintain an adequate traffic buffer."],
        ],
      },
      {
        id: 'faq',
        title: 'Frequently Asked Questions (FAQ)',
        blocks: [
          ['faq', [
            { q: 'Which proxies are best for Telegram automation?', a: 'For automation, sticky proxies with anchored IPs are best. They provide predictable account behavior and drastically reduce the risk of the session being deauthorized. Whether they also affect bans is something we have tested and could not show either way.' },
            { q: 'Why is it important to use a separate proxy for every account?', a: 'Sharing a single proxy across multiple accounts links their network footprint. If one account gets flagged for spam, Telegram will instantly ban all other accounts sharing that identical IP address. The rule is absolute: 1 Account = 1 Proxy.' },
            { q: 'Can I use rotating proxies for Telegram?', a: "No. What matters is that the exit IP does not change underneath a logged-in session, and timed rotation — an exit that changes every N seconds or minutes regardless of what your account is doing — breaks exactly that: Telegram reads the change as a hijacked session and deauthorizes the account. A sticky session drawn from a rotating pool is fine, because it holds one IP for the length of your session. \"Sticky\" is the word providers use for it, and the one to look for." },
            { q: 'How do proxies impact account security?', a: 'Proxies are the baseline of your operational security. Unstable, "dirty," or rapidly jumping IP addresses will force Telegram to initiate security checks, apply heavy limits, or permanently ban the session.' },
            { q: 'How can I minimize ban risks when using proxies?', a: 'Always match the proxy GEO to the account GEO, strictly use SOCKS5 formats, respect action limits, utilize the Active Warmup module to gradually increase account activity, and never skimp on network quality.' },
          ]],
          ['linkout', { href: '/guides/account-manager', label: 'Next: import the accounts and check they are alive' }],
        ],
      },
    ],
  },
  {
    slug: 'billing',
    url: 'billing',
    group: 'setup',
    title: 'Billing, plans and cancelling',
    short: 'What you pay and how to stop',
    summary:
      'What you are on, what it costs, when the next charge lands, where the receipts are, and how to cancel without losing the time you have paid for.',
    seoTitle: 'ATREOX billing: plans, invoices and cancelling',
    seoDescription:
      'Modules or a full licence, what a grandfathered price means, where to find receipts, and how cancelling at the end of a paid period actually works.',
    module: null,
    video: null,
    body: [
      {
        id: 'what-it-is',
        title: 'What this page is',
        blocks: [
          ['p', 'Everything about money lives on one page: what you are subscribed to, what card pays for it, every invoice we have raised, and the way out. Nothing here needs support to action - cancelling included.'],
          ['p', 'There are two ways to buy, and they are alternatives rather than tiers. Either you pick individual modules and pay for those, or you take the full licence and get every module including anything released while it is active. Two things - the Account Manager and Profile Templates - come with any purchase at all.'],
          ['callout', [
            'A subscription is not a licence to a fixed set of features. When a module is added to the product, a full licence covers it the day it ships, with no migration and no repurchase. That is the difference you are paying for above a couple of modules.',
          ]],
        ],
      },
      {
        id: 'summary',
        title: 'The line at the top',
        blocks: [
          ['p', 'Three facts, in one row: what you are on, what it costs per period, and the date of the next charge. If a cancellation is pending, the same row says the date access ends instead, in amber.'],
          ['controls', [
            {
              id: 'bl-plan', name: 'Plan name', where: 'Billing, top', kind: 'field', value: 'Legacy Starter plan',
              rows: [
                ['What it shows', 'Full licence, a legacy plan, or a count of the modules you hold.'],
                ['Where it comes from', 'What your subscription actually grants in Stripe, expanded the same way the access check expands it - not a label stored separately that could disagree with your access.'],
              ],
            },
            {
              id: 'bl-amount', name: 'The amount', where: 'Billing, top right', kind: 'field', value: '29 EUR / month',
              rows: [
                ['What it shows', 'What your subscription actually bills per period, read from Stripe.'],
                ['Not the list price', 'Deliberately. If you are on an older price, the figure here is yours, not the one on the pricing page. Showing you the current catalogue price would be showing you somebody else\'s bill.'],
                ['If it is missing', 'A subscription set up before we started recording the amount shows no figure until its next renewal, rather than a guess. The plan and the date are still shown.'],
                ['More than one line', 'Stripe allows a single billing interval per subscription, so an annual licence cannot sit on the same subscription as monthly modules. When you hold both, each is listed with its own amount and its own date - adding a yearly figure to a monthly one would be arithmetic on different units.'],
              ],
            },
            {
              id: 'bl-locked', name: 'Your price is locked in', where: 'Billing, under the amount', kind: 'button', value: 'Shown on older plans',
              rows: [
                ['Who sees it', 'Anyone on a plan from before modules were sold separately.'],
                ['What it promises', 'The price you signed up at does not change when the public pricing does, and you are not moved onto a new plan unless you choose to move.'],
                ['What it does not do', 'It does not freeze the product. A grandfathered plan keeps everything it always covered and keeps getting fixes; it just does not automatically gain modules that were carved out after it.'],
              ],
            },
          ]],
        ],
      },
      {
        id: 'payment-method',
        title: 'The card',
        blocks: [
          ['p', 'The card that will be charged at the next renewal, shown by brand and last four digits. It is read straight from Stripe every time the page loads rather than cached, because a card can change through Stripe\'s own surfaces without telling us - and a stale card here would be somebody believing they had fixed a payment problem when they had not.'],
          ['p', 'It is deliberately read-only. Card details never pass through this application; payment always goes through Stripe\'s own form. A button here that could not actually work would be worse than no button.'],
          ['callout', [
            'If the card has expired, the page says so before the renewal fails rather than after. An expired card fails silently at renewal time, and the first thing you would otherwise notice is your access stopping - which is the worst possible moment to find out and the hardest to explain.',
          ]],
        ],
      },
      {
        id: 'history',
        title: 'Payment history',
        blocks: [
          ['p', 'Every invoice we have raised, newest first, with the amount and a link to the Stripe-hosted receipt. The receipt is the point of the section: what was taken and when is answerable from the row above, but something an accountant will accept is not.'],
          ['p', 'The history outlives the subscription. If your plan lapses, the receipts stay reachable - somebody whose plan ended still has a bookkeeper, and dropping their invoices the day access stopped would turn every past payment into a support request.'],
        ],
      },
      {
        id: 'cancelling',
        title: 'Cancelling',
        blocks: [
          ['p', 'Cancelling stops the next charge. It does not stop your access: you keep everything until the end of the period you have already paid for, and the confirmation names that date before you commit to anything.'],
          ['controls', [
            {
              id: 'bl-cancel', name: 'Cancel subscription', where: 'Billing, last section', kind: 'button', value: 'Cancel subscription',
              rows: [
                ['What it does', 'Marks every active subscription to end when its paid period does. Nothing is charged after that.'],
                ['What you keep until then', 'Everything. The modules keep running, the engine keeps posting, and the date is stated in the dialog and again on the page afterwards.'],
                ['No refund for the remainder', 'And no charge for the next period either. It is the same policy module removal follows.'],
                ['Your data', 'Untouched. Accounts, channels, personas and history stay exactly as they are.'],
                ['What we do not do', 'Offer you a discount, ask why, or put a survey in the way. The dialog states the date and the consequence and gets out of the way.'],
              ],
            },
            {
              id: 'bl-resume', name: 'Keep my subscription', where: 'Billing, after cancelling', kind: 'button', value: 'Keep my subscription',
              rows: [
                ['What it does', 'Undoes a pending cancellation while the period is still running. The subscription renews as normal and nothing is scheduled to end.'],
                ['Why it is not in the cancel dialog', 'Because offering it while you are deciding would be pressure wearing a different hat. It is here for the day after, so changing your mind does not require emailing us.'],
                ['After the period ends', 'There is nothing left to resume - the subscription is closed and buying again is a fresh purchase.'],
              ],
            },
          ]],
          ['note', 'Cancelling is the last section on the page rather than the first, and it is a heading like any other - not hidden behind an extra click, not competing with the rest. A cancel button somebody has to hunt for becomes a support ticket; one at the top is a page that keeps suggesting it.'],
        ],
      },
      {
        id: 'changing',
        title: 'Adding and removing modules',
        blocks: [
          ['p', 'A module added mid-period is charged the prorated difference on the card already on file, and unlocks as soon as the payment lands - usually without leaving the page.'],
          ['p', 'A module removed mid-period is scheduled to drop at the end of the paid period, not immediately. You keep it until then, you are not charged for it again, and there is no refund for the days remaining. A pending removal can be cancelled from the same card while it is still pending.'],
          ['callout', [
            'A module that came as part of a licence or an older bundle cannot be removed on its own - there is no separate line item to remove. The card says so rather than offering a button that would fail.',
          ]],
        ],
      },
      {
        id: 'trouble',
        title: 'When something looks wrong',
        blocks: [
          ['p', 'Right after a payment the page waits on Stripe confirming it to us, which normally takes a moment. If it takes more than a minute you get a way out rather than a spinner: a button to check again, a way back to the rest of the page, and an address to write to. Your payment went through in that situation - what has not finished is our side of the setup.'],
          ['p', 'If the page says you have no subscription while you believe you do, that is worth reporting rather than working around. Our own access check is deliberately built to fail in your favour: when we cannot reach the record, your access keeps working rather than being revoked.'],
          ['linkout', { href: '/contact', label: 'Contact us about a billing question' }],
        ],
      },
    ],
  },
  {
    slug: 'account-manager',
    url: 'account-manager',
    group: 'module',
    short: 'Import, check, keep alive',
    title: 'Managing Telegram accounts',
    summary: 'Every control on the Accounts page, what it actually does in the engine, and the order to touch them in on day one.',
    seoTitle: 'Manage Telegram accounts in bulk: import, proxies',
    seoDescription:
      'Import accounts in bulk, give each one its own proxy, and run the three checks that catch a dead or spam-blocked account before it costs you.',
    module: 'account-manager',
    video: null,
    body: [
      {
        id: 'what-it-is',
        title: 'What this page is',
        blocks: [
          ['p', "Account Manager is the second item in the sidebar and the page every other module depends on. Accounts enter the system here, get a proxy here, and are checked here; the modules that earn — Neurocommenting, NeuroDialogs, Mass Reactions — draw from the pool this page maintains. It is included with any purchase because none of the others can run without it."],
          ['p', "It is a single page, not a set of tabs. Everything below is a region of that screen, including the Accounts, Checks and Protection groups in its bulk actions menu."],
          ['callout', [
            "Everything in the Checks folder is explicit: each check runs because you pressed it. Health, proxy and capability are read-only on the Telegram side — no messages, no profile writes. Check spamblock is the one exception: it sends a single message to @SpamBot, Telegram's own bot.",
          ]],
        ],
      },
      {
        id: 'map',
        title: 'Map of the page',
        blocks: [
          ['map', [
            { name: 'Toolbar', holds: 'Reassign proxies · Import accounts. Top right, always present.' },
            { name: 'Capability summary', holds: 'A banner counting how much of the pool has passed, failed or never had a capability check.' },
            { name: 'Shared-proxy warning', holds: 'Appears only when two or more active accounts sit behind the same proxy. Carries its own Reassign now button.' },
            { name: 'Status tiles', holds: 'Seven counts — Active, In work, Unchecked, Spamblock, Invalid, Frozen, Needs reauth. Each one is also a filter for the list below.' },
            { name: 'Bulk actions bar', holds: 'Three folders: Accounts, Checks and Protection. Delete accounts is at the bottom of Accounts.' },
            { name: 'Account list', holds: 'One row per account: name, Protected, Comments, Last used, Added, Proxy, Supervise, Check, Status. Clicking a row opens its detail dialog.' },
            { name: 'Banned cleanup bar', holds: 'A floating bar at the bottom, only when the selection contains banned accounts.' },
            { name: 'Dialogs', holds: 'Import accounts (Bulk import / Single import) · Reassign proxies · Recover from tdata · Account detail (Overview / Profile / Protection).' },
          ]],
        ],
      },
      {
        id: 'getting-accounts-in',
        title: 'Getting accounts in',
        blocks: [
          ['p', "One button in the toolbar, Import accounts, with two modes. Bulk import, which opens first, takes the zip a purchase came in and converts its tdata folders for you; Single import is the one-account form."],
          ['controls', [
            {
              id: 'ctl-add-account', name: 'Single import', where: 'Import accounts dialog', kind: 'button', value: 'Single import',
              rows: [
                ['What it does', 'A form for one account: ID, display name, phone, session string, api_id, api_hash, and an optional proxy.'],
                ['Required', 'ID (no spaces or slashes), session string, api_id, api_hash. Display name and phone are optional.'],
                ['Validation', 'Session string must be at least 100 characters — a Telethon StringSession is usually 350+. api_id must be a positive integer. api_hash must be exactly 32 hex characters.'],
                ['When to use it', 'One account at a time, when you already have a Telethon session string. If you have tdata folders instead, use Bulk import — it converts them.'],
              ],
            },
            {
              id: 'ctl-proxy-toggle', name: 'Proxy', where: 'Single import', kind: 'toggle', on: false,
              rows: [
                ['What it does', 'Reveals the proxy fields for this account: Type, Host, Port, User, Pass.'],
                ['Default', 'Off — an account is created with no proxy unless you turn this on.'],
                ['Type', 'socks5 or http. socks5 is the default selection.'],
                ['If left off', 'The account is saved without a proxy. Check proxy then returns a 400 for it, and the proxy column in the list stays empty.'],
              ],
            },
            {
              id: 'ctl-bulk-import', name: 'Bulk import', where: 'Import accounts dialog', kind: 'button', value: 'Bulk import',
              rows: [
                ['What it does', 'Takes the zip a purchase came in — one folder per account holding its tdata, with per-account zips mixed in if need be — and converts every folder in one pass. A folder that cannot be read is listed with the reason instead of stopping the rest.'],
                ['Names', 'Each account\'s ID and display name default to its folder\'s name.'],
                ['Limit', '100 accounts per import. Upload more and the dialog says so, then imports only the first 100.'],
                ['Proxies', 'A separate field takes one proxy per line, in any of the four accepted formats. Mixed formats in the same paste are fine.'],
                ['When to use it', 'Any time you are adding more than one account — this is the normal path after a marketplace purchase.'],
              ],
            },
          ]],
          ['p', "The proxy field in Bulk import, the one in Reassign proxies and the single-line editor in an account's detail dialog all run through the same parser, so all three accept exactly the same four shapes and reject the same way:"],
          ['table', {
            head: ['Format', 'Notes'],
            rows: [
              ['type:host:port:user:pass', 'Fully explicit. type is socks5 or http.'],
              ['host:port:user:pass', 'Type assumed socks5.'],
              ['user:pass@host:port', 'Type assumed socks5.'],
              ['type://user:pass@host:port', 'URL style.'],
            ],
          }],
          ['p', "User and password are optional throughout. host:port is split on the last colon and user:pass on the first, so a password containing a colon survives intact; the auth half is split on the last @, so a password containing @ does too."],
        ],
      },
      {
        id: 'proxies',
        title: 'One proxy per account',
        blocks: [
          ['p', "Two accounts behind one IP is the failure this page works hardest to prevent. If it happens, a red banner appears above the tiles counting the affected accounts, with a button that selects them and opens the reassign dialog directly."],
          ['controls', [
            {
              id: 'ctl-reassign', name: 'Reassign proxies', where: 'Toolbar', kind: 'button', value: 'Reassign proxies',
              rows: [
                ['What it does', 'Assigns one distinct proxy per target account, in order.'],
                ['Target accounts', 'A dropdown with two choices: all active accounts, or the current selection. Selection is disabled when nothing is selected.'],
                ['All or nothing', 'Every line is parsed and deduplicated first. If there are fewer distinct valid proxies than target accounts, the whole request is rejected before a single row is written — never a partial apply, never a proxy reused across two accounts in the same call.'],
                ['Accounts in use', 'An account with a live connection in any of the engine\'s pools right now — posting, discovery, health checker, profile manager, channel joiner, active warmup — is skipped rather than swapped, and reported back with the reason. Telegram has no way to change the proxy under an open connection. Re-run it after the session ends; there is no queue to drain.'],
                ['When to use it', 'After a bulk import, when the shared-proxy banner appears, or whenever you replace a batch of proxies.'],
              ],
            },
            {
              id: 'ctl-target-mode', name: 'Target accounts', where: 'Reassign proxies dialog', kind: 'select', value: 'All active accounts',
              rows: [
                ['What it does', 'Chooses who gets a new proxy: every active account, or only the rows you ticked.'],
                ['Default', 'All active accounts.'],
                ['When to change it', 'Switch to the selection when you are fixing a specific group — the shared-proxy banner\'s own button does this for you.'],
              ],
            },
          ]],
        ],
      },
      {
        id: 'the-three-checks',
        title: 'The checks',
        blocks: [
          ['p', "The Checks folder holds four: health, proxy, capability and spamblock. The first three are below, each with its own five-minute cooldown; Check spamblock has its own guide. They do not substitute for each other: an account can pass health and still be unusable, which is the whole reason the capability check exists."],
          ['linkout', { href: '/guides/spamblock-frozen-shadowban#in-the-dashboard', label: 'Check spamblock, and the Spamblock and Frozen tiles' }],
          ['controls', [
            {
              id: 'ctl-check-health', name: 'Check health', where: 'Bulk actions bar · Account detail → Actions', kind: 'button', tone: 'ok', value: 'Check health',
              rows: [
                ['What it does', 'Connects the account\'s own Telegram client for the length of the call, confirms the session is authorised, and makes one lightweight self-lookup. Reports back active, banned, disabled or unknown, plus whatever restricted / scam / fake flags Telegram already attaches to the account.'],
                ['What it cannot see', 'A spam block or a freeze. A self-lookup cannot detect either — that is what Check spamblock and Check capability are for.'],
                ['Rate limit', 'One per account per five minutes. Sooner returns 429, and the button in the detail dialog shows the seconds remaining instead.'],
                ['Side effects', 'None on the Telegram side — no messages, no profile writes. Read-only.'],
                ['When to use it', 'Right after import, and whenever an account starts behaving oddly.'],
              ],
            },
            {
              id: 'ctl-check-proxy', name: 'Check proxy', where: 'Bulk actions bar · Account detail → Actions', kind: 'button', value: 'Check proxy',
              rows: [
                ['What it does', 'Runs the same check as the free Proxy Checker through the account\'s proxy: connects, reaches Telegram, and reports a verdict with the latency, the exit IP\'s country and the country Telegram sees. A mismatch between the two is flagged.'],
                ['How long', 'Up to about thirty seconds. Accounts sharing one proxy reuse a check made in the last few minutes.'],
                ['No proxy configured', 'Returns a 400. In the detail dialog the button is disabled with a tooltip saying so.'],
                ['Rate limit', 'One per account per five minutes, counted separately from the other checks.'],
                ['Side effects', 'Never touches the account\'s Telegram session. The handshake with Telegram is unauthenticated.'],
                ['When to use it', 'When accounts stop working all at once, or after changing proxies. It separates "the proxy is dead" from "the account is dead".'],
              ],
            },
            {
              id: 'ctl-check-capability', name: 'Check capability', where: 'Bulk actions bar · Account detail → Actions', kind: 'button', value: 'Check capability',
              rows: [
                ['What it does', 'Asks the account to resolve a known-good public username and read that channel\'s message history — the exact pair of operations the engine performs for every monitored channel. Result is saved and shown in the list\'s Check column.'],
                ['Why it exists', 'An account can be frozen, or simply unable to resolve anything, while the health check\'s restricted / scam / fake flags stay at zero the whole time. Freezing is enforced at the request level, not written onto the account, so a self-lookup cannot see it.'],
                ['Results', 'ok · not checked · check failed · frozen · can\'t resolve · can\'t post. frozen is a real Telegram restriction, lifted only through their own verification flow. can\'t post means Telegram refuses the account\'s messages while it still reads and resolves. check failed means the check ran and could not decide (a timeout, a dead proxy) — run it again.'],
                ['Rate limit', 'One per account per five minutes, on its own timer.'],
                ['In bulk', 'Runs as a background task with a 1–3 second gap between accounts.'],
                ['When to use it', 'On every fresh batch before you scale, and whenever a pool goes quiet without any account reporting a problem.'],
              ],
            },
          ]],
          ['p', "The capability check targets Telegram's own official channel rather than anything of yours, so running it never disturbs your monitored channels or counts against their limits."],
        ],
      },
      {
        id: 'reading-the-list',
        title: 'Reading the pool',
        blocks: [
          ['p', "Seven tiles across the top, each a live count and a filter — click one to show only those accounts, click it again to clear. Every account sits in exactly one of Active, Unchecked, Spamblock, Invalid, Frozen and Needs reauth, so those six add up to the pool. In work is the exception: a part of Active, not added to the total."],
          ['controls', [
            { id: 'ctl-tile-active', name: 'Active', where: 'Status tiles', kind: 'tile', tone: 'ok', value: '12',
              rows: [['Counts', 'Healthy accounts: checked, reachable, and in none of the tiles below. An account in cooldown, at its comment limit or paused by hand is still healthy and counts here; its row says what it is doing.']] },
            { id: 'ctl-tile-busy', name: 'In work', where: 'Status tiles', kind: 'tile', value: '3',
              rows: [
                ['Counts', 'Active accounts set aside for a module — in the commenting pool, or held by a running Parser search. Set aside, not necessarily posting this minute.'],
                ['Breakdown', 'Hovering the tile lists which module holds how many.'],
              ] },
            { id: 'ctl-tile-unchecked', name: 'Unchecked', where: 'Status tiles', kind: 'tile', value: '2',
              rows: [['Counts', 'Accounts with no capability check yet — the engine will not use them until one has run — plus accounts whose proxy is down right now. Proxy down is fixed at the proxy, not with a new session.']] },
            { id: 'ctl-tile-spamblock', name: 'Spamblock', where: 'Status tiles', kind: 'tile', tone: 'warn', value: '0',
              rows: [['Counts', 'Accounts @SpamBot reports as limited, plus accounts whose capability check came back can\'t post. Either way, Telegram is blocking them from posting.']] },
            { id: 'ctl-tile-banned', name: 'Invalid', where: 'Status tiles', kind: 'tile', tone: 'bad', value: '0',
              rows: [
                ['Counts', 'Banned accounts, and sessions Telegram has rejected outright. Uploading the same tdata again cannot revive them.'],
                ['Cleanup', 'Selecting banned accounts brings up the cleanup bar at the bottom of the page.'],
              ] },
            { id: 'ctl-tile-dead', name: 'Frozen', where: 'Status tiles', kind: 'tile', value: '0',
              rows: [
                ['Counts', 'Accounts whose last capability check came back frozen or can\'t resolve — Telegram itself saying this account cannot do the one thing the engine needs.'],
                ['What to do', 'Do not delete it. Leave it alone for about three weeks, then run Check capability on it again — a meaningful share of frozen accounts come back on their own. Deleting on the day of the verdict throws away accounts that would have recovered.'],
              ] },
            { id: 'ctl-tile-reauth', name: 'Needs reauth', where: 'Status tiles', kind: 'tile', value: '1',
              rows: [
                ['Counts', 'Accounts the engine flagged after three failed hourly reconnects in a row, plus accounts that are not responding. Both need a person to look; only the flagged ones need a fresh tdata, through Recover from tdata.'],
                ['Parked accounts', 'An account you set to disabled yourself is counted here too.'],
              ] },
          ]],
          ['p', "Below the tiles, one row per account. Narrow screens drop the middle columns first and keep Check and Status to the end."],
          ['table', {
            head: ['Column', 'Shows'],
            rows: [
              ['Protected', 'The protection shield: grey until the five protection steps have succeeded in order, blue at 5/5.'],
              ['Comments', 'How many comments this account has posted. Clicking the number opens a histogram.'],
              ['Last used', 'When the engine last used this account.'],
              ['Added', 'When the account was imported (added_at). Supervise counts its seven-day window from this timestamp.'],
              ['Proxy', 'The proxy currently assigned, with a warning marker when another active account shares it.'],
              ['Supervise', 'Supervise age as x/7, measured from import and capped at 7/7. A dash means Supervise is not on for this account.'],
              ['Check', 'The verdict from the last capability check. Hover for the raw result and when it ran.'],
              ['Status', 'The account\'s state in the pool. A dead capability verdict overrides it here, since such an account cannot be used whatever its status says.'],
            ],
          }],
        ],
      },
      {
        id: 'bulk-actions',
        title: 'Acting on a selection',
        blocks: [
          ['p', 'Actions sit in three folders. Accounts holds Apply template, Reset counts, Supervise, Recover from tdata and Delete accounts. Checks holds Check health, Check proxy, Check capability and Check spamblock. Protection holds Terminate other sessions, Reauthenticate, Download new tdata and Set 2FA, in that order.'],
          ['linkout', { href: '/guides/account-protection#running-it', label: 'The four Protection actions and the five-step shield sequence' }],
          ['p', "Tick rows and the bar under the tiles comes alive. One bulk operation runs at a time — while one is in flight the rest disable, rather than letting several overlapping batches run at once."],
          ['controls', [
            {
              id: 'ctl-apply-template', name: 'Apply template', where: 'Bulk actions bar', kind: 'button', value: 'Apply template',
              rows: [
                ['What it does', 'Applies a saved profile template across the selected accounts. The template itself is built on the Profile Templates page.'],
                ['When to use it', 'After import, once accounts have rested — giving a batch a face is part of warming it up.'],
              ],
            },
            {
              id: 'ctl-reset-counts', name: 'Reset counts', where: 'Bulk actions bar', kind: 'button', value: 'Reset counts',
              rows: [
                ['What it does', 'Sets the selected accounts\' comment counters back to zero and resumes any of them that were paused for hitting their limit.'],
                ['What the limit is', 'A safety fuse. The count is cumulative, not daily — it never falls on its own, so an account that reaches its limit stops commenting and stays stopped until someone clears the counter. This button is that clearing.'],
                ['Where the limit is set', 'Not here. On the Neurocommenting page, in the commenting pool: one value applied across every pooled account, or a separate value on a single account. There is no default — an account has no limit at all until one is set.'],
                ['What it does not do', 'It does not delete comment history — the rows stay, so cost tracking and statistics are unaffected. It does not change the limit itself either.'],
                ['Why it matters', 'Resume on its own would buy a capped account exactly one more post before it hit the same ceiling again, because the count never went down. Clearing the counter is what makes a recurring limit workable.'],
                ['When to use it', 'When accounts are sitting at LIMIT REACHED and you want them working again without raising the cap.'],
              ],
            },
            {
              id: 'ctl-warmup-on', name: 'Supervise', where: 'Bulk actions · Accounts', kind: 'button', value: 'Supervise',
              rows: [
                ['What it does', 'Enables a seven-day supervision window that gates Neurocommenting, Neurodialogs and Mass Reactions until the account has rested.'],
                ['Anchored to', 'The import timestamp, added_at. Enabling it later does not start a new seven-day timer; an account imported seven days ago already shows 7/7.'],
                ['Days', 'The account list shows x/7, capped at 7/7. At seven days the supervision rest gate ends.'],
                ['Once enabled', 'The seven-day rest lock runs until import plus seven days. There is no off toggle to bypass it.'],
                ['Separate module', 'Active Warmup runs configured reading and activity. Supervise itself is a passive rest gate, not that module.'],
              ],
            },
            {
              id: 'ctl-delete-accounts', name: 'Delete accounts', where: 'Bulk actions · Accounts · bottom', kind: 'button', tone: 'bad', value: 'Delete accounts',
              rows: [
                ['What it does', 'Deletes the selected accounts after confirmation. Check the selection before confirming.'],
                ['Where to find it', 'At the bottom of Accounts, below the other account actions.'],
              ],
            },
            {
              id: 'ctl-delete-banned', name: 'Delete banned', where: 'Floating bar, bottom of page', kind: 'button', tone: 'bad', value: 'Delete banned',
              rows: [
                ['What it does', 'Permanently removes the banned accounts in your selection, and their session data, from the pool.'],
                ['Scope', 'Only the banned accounts in the selection. Selecting a mixed set never puts a healthy account at risk.'],
                ['What survives', 'Comment history already logged stays. The deletion itself cannot be undone.'],
                ['When to use it', 'Housekeeping, once you have accepted the losses in a batch.'],
              ],
            },
          ]],
        ],
      },
      {
        id: 'one-account',
        title: 'One account up close',
        blocks: [
          ['p', "Clicking a row opens its dialog with Overview, Profile and Protection tabs. Overview holds four blocks in order — Info, Proxy, Actions, Danger zone."],
          ['controls', [
            {
              id: 'ctl-display-name', name: 'Display name', where: 'Detail → Overview → Info', kind: 'field', value: 'Acc 101',
              rows: [
                ['What it does', 'Renames the account inside ATREOX only. This is a label for you, not the Telegram profile name — that lives on the Profile tab.'],
              ],
            },
            {
              id: 'ctl-edit-proxy', name: 'Edit proxy', where: 'Detail → Overview → Proxy', kind: 'button', value: 'Edit proxy',
              rows: [
                ['What it does', 'A single-line proxy editor for this one account, accepting the same four formats as everywhere else.'],
                ['Clear proxy', 'A second button removes the proxy entirely, leaving the account with none.'],
                ['When to use it', 'One-off fixes. For a batch, use Reassign proxies instead — it guarantees no two accounts end up sharing.'],
              ],
            },
            {
              id: 'ctl-danger-status', name: 'Manual status override', where: 'Detail → Overview → Danger zone', kind: 'select', value: 'active',
              rows: [
                ['What it does', 'Forces the account\'s status to active, banned or disabled. Cooldown is set and cleared by the engine; it shows in the list only when the account is already in it, and cannot be picked.'],
                ['Default', 'Whatever the account\'s current status is. The Save button stays disabled until you pick something different.'],
                ['What it is really for', 'Parking an account you need kept out of circulation without deleting it. The usual case: no comment limit was set, the account has posted far more than it should have, and the next comment is the one that gets it banned. Moving it off active buys you time to decide.'],
                ['Why parking works', 'The engine only ever builds its pool from accounts whose status is active. A parked account is never selected for commenting, even if its id is still sitting in the commenting pool. In the panel the pool\'s available column offers active accounts only, so it cannot be added back by accident — and disabled or banned accounts already in the pool are pulled out of it automatically.'],
                ['Use disabled', 'disabled stays put until you change it back. A parked account is counted under the Needs reauth tile.'],
              ],
            },
            {
              id: 'ctl-profile-tab', name: 'Profile tab', where: 'Detail → Profile', kind: 'button', tone: 'plain', value: 'Profile',
              rows: [
                ['What it does', 'Edits the real Telegram profile for this account: first name, last name, username, bio and avatar, with a live preview of how it will look.'],
                ['Rate limits', 'One profile change per account per hour. Username is slower still at one change per account per 48 hours, since it is the most visible and searchable of the fields.'],
                ['Avatar', 'Up to 5 MB.'],
                ['When to use it', 'Single-account touch-ups. For a whole batch, build a template on the Profile Templates page and use Apply template.'],
              ],
            },
          ]],
        ],
      },
      {
        id: 'first-run',
        title: 'First run',
        blocks: [
          ['p', "The shortest path from an empty pool to accounts a module can draw on."],
          ['steps', [
            "Bring the accounts in with Import accounts — Bulk import for a batch, Single import for one. Paste your proxies into the same dialog if you have them ready.",
            "If you imported without proxies, run Reassign proxies now, before anything connects. One distinct proxy per account, or the request is refused outright.",
            "Select everything and press Check health. Anything that comes back banned on its first contact with a new IP was never going to survive; note the seller.",
            "Select everything again and press Check capability. This is the check that catches a frozen account while every other signal still reads clean.",
            "Select the survivors and press Supervise in the Accounts folder. The seven-day window is measured from import, and the Supervise column shows x/7.",
            "Use the Protection folder to complete the five ordered security steps, and apply your profile template. Wait until Supervise reaches 7/7 before running Neurocommenting, Neurodialogs or Mass Reactions.",
          ]],
          ['p', "After that the pool is ready for a module to claim from. The tiles are the thing to watch day to day: a rising Spamblock count is pacing, a rising Frozen or Invalid count is the accounts themselves."],
          ['note', "Account changes reach the engine on their own: it re-reads the pool from the database every poll round, so an account you add, park or re-proxy is picked up within one poll interval without you doing anything else.",
          ],
          ['linkout', { href: '/guides/profile-templates', label: 'Next: give the whole batch a face' }],
        ],
      },
    ],
  },
  {
    slug: 'account-protection',
    url: 'account-protection',
    group: 'module',
    short: 'Make a bought session yours',
    title: 'How to protect a Telegram account after purchase: the full Atreox scheme',
    summary: "A bought account arrives logged in on the seller's key. Five operations in one order — terminate, reauthenticate, terminate again, back up, set 2FA — make it yours, and the Protected shield turns blue when they are done.",
    seoTitle: 'Protect a bought Telegram account: the full scheme',
    seoDescription:
      "A purchased Telegram session shares the seller's auth key. The five-step Atreox protection scheme — terminate, reauthenticate, terminate again, export a new backup, set 2FA — and how to run it from the Account Manager.",
    module: null,
    video: null,
    body: [
      {
        id: 'short-guide',
        title: 'Short guide to account protection',
        blocks: [
          ['p', "Every account in the Account Manager has a shield in the Protected column. It stays grey — hover it for how many of five steps are done — until five protection operations have succeeded in one exact order. Only then does it turn blue."],
          ['steps', [
            "Terminate other sessions. Logs out every session except the one you imported.",
            "Reauthenticate. Creates a brand-new session and switches the engine to it. The key you bought is no longer used.",
            "Terminate other sessions again, now from the new session. This is the step that logs the seller out: it revokes the imported key, including every copy of it.",
            "Download new tdata. Creates a separate backup session that the engine does not switch to, and downloads it as a zip — tdata plus a session file. The download is available for one hour.",
            "Set 2FA. Adds a cloud password, so a code sent to the phone number is no longer enough to log in.",
          ]],
          ['p', "The order is the point. Until step 3 the seller holds the same key you do, and a reset run from that key cannot revoke the key itself. Only a session of your own can end theirs — so your session comes first, the reset from it second, and the backup after that, because the reset would revoke any backup made before it."],
          ['p', "Telegram may refuse the second Terminate until the new session is 24 hours old. The dialog shows \"Retry after …\" with the time; run the same step again then. Nothing is lost while you wait."],
          ['p', "Only a confirmed success moves the shield. A failed step can be retried as it is; any Protection action run out of order restarts the pass from the beginning."],
          ['note', "Keep the downloaded tdata offline and unused. It is your way back in if Telegram ever ends the working session."],
        ],
      },
      {
        id: 'why-it-matters',
        title: 'Why a bought account is not yet yours',
        blocks: [
          ['p', "A bought account is not a fresh login. Whether it ships as tdata or as a session file, it carries one authorization key — the one created when the seller logged in. Importing it gives you that key. It does not take it from anyone else."],
          ['p', "That shared key is the whole risk. The usual theft is simple: the seller keeps a copy, uses it to open a second session of their own, and from there terminates every other session — yours included. You are logged out, they keep the account, and it goes back on sale. It tends to happen days after the purchase, when a refund is harder to argue."],
          ['callout', [
            "Terminating sessions alone does not stop it. A reset run from the shared key leaves the shared key alive. The seller is out only once you hold a session of your own and have terminated theirs from it.",
          ]],
          ['p', "There is a second, quieter threat: Telegram ending a session itself — after a proxy's exit IP jumps, or on a login pattern it distrusts. The scheme closes the first threat. The backup it produces is the answer to the second."],
        ],
      },
      {
        id: 'before-you-start',
        title: 'Before the first operation',
        blocks: [
          ['kv', [
            ['One stable proxy', "Assign each account its own proxy before anything else — in the account's country, sticky, with a hold time. Every operation runs through it, and a session whose IP moves mid-scheme is the one Telegram revokes. Check proxy confirms Telegram is reachable through it."],
            ['Worth protecting', "Run Check health, Check capability and Check spamblock. Protection does not revive a banned, frozen or write-banned account; drop it and note the seller."],
            ['Supervise on', "Supervise keeps the account out of Neurocommenting, Neurodialogs and Mass Reactions for seven days from import — ample room for the scheme and its 24-hour wait."],
            ['Out of the pools', "Each operation needs the account's connection to itself. An account a module is using is refused with \"Account is in use\"; stop the module or take the account out of its pool, then retry."],
            ['One place only', "Never open the working session on your own machine, or in another tool, while Atreox runs it. One key seen from two IPs at once is exactly what Telegram revokes."],
          ]],
          ['note', "Optional, and manual: some operators leave a fresh import on its new proxy for a few hours before the first operation. Atreox has no timer for this — it is simply waiting."],
        ],
      },
      {
        id: 'the-five-steps',
        title: 'The scheme, step by step',
        blocks: [
          ['kv', [
            ['1 · Terminate other sessions', "Run from the imported key. Every other device is logged out, including any extra sessions the seller opened. The imported key itself survives — a session cannot end itself this way."],
            ['2 · Reauthenticate', "The imported session approves a brand-new login and the engine switches to it. The engine also tries to confirm the new login from the old session, closing the window in which the seller's copy could reject it as not theirs."],
            ['3 · Terminate other sessions, again', "Now run from your own session. It revokes the imported key everywhere, every copy the seller kept included. This is the step that makes the account yours."],
            ['4 · Download new tdata', "A second new session, created from yours and never switched to, downloaded as a zip. It comes after step 3 because step 3 would have revoked it."],
            ['5 · Set 2FA', "A cloud password. Without one, whoever controls the phone number can log in with an SMS code — and on a bought account that is rarely you. Set last: a password added while the seller still shares the session protects nothing."],
          ]],
          ['note', "Shield 5/5 means all five succeeded in this order. A click, a failed attempt or a wait never counts as a step."],
        ],
      },
      {
        id: 'why-second-reset-24h',
        title: 'The 24-hour wait',
        blocks: [
          ['p', "Telegram does not let a session younger than 24 hours terminate the others; it answers FRESH_RESET_AUTHORISATION_FORBIDDEN. After step 2 your session is minutes old, so step 3 is usually refused at first."],
          ['p', "The dialog says so and gives the time: \"Retry after …\". The shield stays at 2/5, the account keeps working on its new session, and you run Terminate other sessions again once the time has passed."],
          ['p', "The clock is the age of the Telegram session, not the import date. Now and then the imported session is itself new, and step 1 waits too."],
        ],
      },
      {
        id: 'running-it',
        title: 'Running it in the panel',
        blocks: [
          ['p', "Select accounts and open the Protection folder in the bulk actions bar. Its four actions appear in this order; Terminate other sessions is used twice. Each opens a dialog that works through the selection one account at a time, with a result per row. The same four buttons sit on the Protection tab of an account's detail dialog."],
          ['controls', [
            {
              id: 'ctl-terminate-sessions', name: 'Terminate other sessions', where: 'Bulk actions · Protection', kind: 'button', value: 'Terminate other sessions',
              rows: [
                ['What it does', 'Ends every Telegram session on the account except the one Atreox is using.'],
                ['Use it twice', 'Step 1 from the imported session; step 3 from the new one, after Reauthenticate.'],
                ['Fresh session', 'Refused while the current session is under 24 hours old. The row shows when to retry, and the refusal is not counted.'],
                ['Later on', 'Running it again after step 4 revokes your backup as well.'],
              ],
            },
            {
              id: 'ctl-protect-reauth', name: 'Reauthenticate', where: 'Bulk actions · Protection', kind: 'button', value: 'Reauthenticate',
              rows: [
                ['What it does', 'Creates a brand-new session, verifies it belongs to the same Telegram account, and switches the engine to it. The imported key is no longer used.'],
                ['Existing password', 'If the account already has a cloud password, enter it in the row; Telegram asks for it on the new login.'],
                ['On failure', 'Nothing is switched and nothing is counted. A session that is already dead cannot approve a new login — recover the account with Recover from tdata in the Accounts folder first.'],
              ],
            },
            {
              id: 'ctl-download-session', name: 'Download new tdata', where: 'Bulk actions · Protection', kind: 'button', value: 'Download new tdata',
              rows: [
                ['What it does', 'Creates a separate backup session and downloads it as a zip: tdata plus a session file. The engine does not switch to it.'],
                ['One hour', 'The download stays available for an hour. The row\'s Download tdata button fetches the same backup again without creating another session; with several accounts selected, each row gets its own.'],
                ['When', 'After the second Terminate succeeds, so that reset cannot revoke it.'],
              ],
            },
            {
              id: 'ctl-set-2fa', name: 'Set 2FA', where: 'Bulk actions · Protection', kind: 'button', value: 'Set 2FA',
              rows: [
                ['What it does', 'Sets or changes the cloud password: the new password twice and an optional hint, plus the current password where one exists.'],
                ['One password per run', 'The new password applies to every account in the run. Store it before you press the button.'],
                ['Completion', 'Success after the first four steps turns the shield blue at 5/5.'],
              ],
            },
          ]],
          ['p', "Stop ends a running batch at once. The account in progress was already sent to Telegram and finishes on the engine's side; nothing new starts, and untouched rows read Skipped. A row that failed has Retry this account. Passwords live only in the open dialog and are cleared when the request is done."],
          ['note', "Run it on a handful of accounts first. What a small group does is what a large one will do."],
        ],
      },
      {
        id: 'the-protected-shield',
        title: 'Reading the shield',
        blocks: [
          ['p', "The Protected column sits beside the account name. Click a shield for the five steps, which are done, and what to do next. The account's Protection tab shows the same, plus a history of every attempt with its result."],
          ['controls', [
            {
              id: 'ctl-shield-partial', name: 'Protected shield — partial', where: 'Account list · after the name', kind: 'badge', value: 'Shield 2/5',
              rows: [
                ['What it shows', 'A grey shield. Its tooltip gives the count; at 2/5 the first reset and Reauthenticate have succeeded, and the second reset, the backup and 2FA remain.'],
                ['Reading it', 'Only confirmed successes count. A proxy, Supervise or a password the account already had does not.'],
              ],
            },
            {
              id: 'ctl-shield-protected', name: 'Protected shield — full', where: 'Account list · after the name', kind: 'badge', tone: 'ok', value: 'Shield 5/5',
              rows: [
                ['What it shows', 'All five operations succeeded in order: Terminate, Reauthenticate, Terminate again, Download new tdata, Set 2FA.'],
                ['When it turns', 'Only after the final successful step.'],
              ],
            },
          ]],
          ['kv', [
            ['Out of order', 'Any Protection action out of order restarts the pass from the beginning. A failed expected step does not — retry it.'],
            ['Session replaced', 'Recover from tdata swaps the working session outside the scheme, so the shield returns to 0/5. An operation cut off by an engine restart does the same, because its outcome is unconfirmed.'],
            ['Untouched by', 'The checks, Apply template, Reset counts, Supervise and proxy changes.'],
          ]],
        ],
      },
      {
        id: 'backup-and-recovery',
        title: 'The backup, and when Telegram ends a session',
        blocks: [
          ['p', "Store the zip offline and do not log in with it. It is a live login: whoever holds the file holds the account."],
          ['p', "Two different things end a session. The seller — which the scheme stops. And Telegram, most often when a proxy's exit IP moves under a live connection and one key appears from two addresses. Telegram revokes that key with AUTH_KEY_DUPLICATED. The account is fine; the login is gone. At a glance it looks like a ban."],
          ['p', "If Telegram revoked only the working session, the backup still logs in. Load it with Recover from tdata in the Accounts folder. The shield returns to 0/5, since the session it measured has been replaced."],
          ['callout', [
            "The backup is partial insurance. If Telegram ends every session on the account at once, the backup goes with them. Fix the proxy before reconnecting either way.",
          ]],
          ['plink', [
            "The exact error, the two ways it happens, and one case traced from the proxy setting to the killed session are in ",
            { href: '/guides/telegram-session-killed-by-ip-change#the-error', text: 'why Telegram sessions die on a moving IP' },
            ". Read it before you blame a seller for an account a proxy setting killed.",
          ]],
          ['note', "One working session, one stable proxy, one idle backup."],
        ],
      },
      {
        id: 'ai-protection',
        title: 'AI Protection: behaving like a person while it works',
        blocks: [
          ['p', "The scheme above protects the login. AI Protection protects the behaviour. An account that only ever comments, or only ever reacts, is a pattern Telegram can see; an account that also reads, scrolls and looks around is a user. With AI Protection on, an account working in a module now and then does what a person does between messages."],
          /* СКРИН 1: блок AI Protection на странице Neurocommenting (сразу под Control), выбран Medium, видна строка "N actions in the last 24 h". */
          ['kv', [
            ['Where', "A block of its own, right under Control, on the Neurocommenting, Neurodialogs and Mass Reactions pages. Each module has its own level."],
            ['Levels', "Off, Low, Medium, High. Medium is the default. The level is how often it happens while the account works, not what it does."],
            ['What accounts do', "Open a channel or a group and read it, scroll back through it, view posts and stories, look through their own settings and profile, like a post, archive or unarchive a chat. The mix is random and different every time."],
            ['Counter', "The block shows how many of these actions the module's accounts made in the last 24 hours, so you can see it is running."],
          ]],
          ['controls', [
            {
              id: 'ctl-ai-protection', name: 'AI Protection', where: 'Neurocommenting, Neurodialogs, Mass Reactions · under Control', kind: 'select', value: 'Medium',
              rows: [
                ['Neurocommenting', 'Every working account does something human about every 25 minutes on Low, 10 on Medium and 4 on High. The gaps are random around those figures, never a fixed timer.'],
                ['Neurodialogs', 'Sessions are short and the account is online the whole time, so the gaps are shorter: between replies, about every 3–7 minutes on Low, 1–3 on Medium, and a minute or two on High.'],
                ['Mass Reactions', 'The level is the chance that a reaction is preceded by a little browsing on the same connection: 1 in 4 on Low, every other one on Medium, almost every one on High.'],
                ['Takes effect', 'At once, on the next action. No restart.'],
              ],
            },
          ]],
          ['p', "It is built to add nothing Telegram could hold against the account:"],
          ['bullets', [
            "It uses only what the account already has — its own channels and groups. It never looks up a new username and never joins anything, so it does not spend the lookup budget the module needs to reach its targets.",
            "Private chats are never opened, read or archived. Neurodialogs finds the conversations it must answer by their unread state, and a DM moved to the archive would drop out of its inbox.",
            "It runs on the connection the module already holds. No second login, no second IP.",
            "A like is a visible action, so it counts against the account's hourly pace like any other; when the hour is full the like is skipped. Everything else is a read.",
            "If Telegram asks an account to slow down, AI Protection backs off for that account on its own. It never pulls the account out of the module.",
          ]],
          ['note', "Leave it on Medium unless you have a reason. High suits accounts that are still young; Off is for a pool you are testing and want to see doing nothing but the module's own work."],
        ],
      },
      {
        id: 'mistakes',
        title: 'What undoes it',
        blocks: [
          ['bullets', [
            "Stopping after the first Terminate. The seller's key is still valid; nothing has changed for them.",
            "Setting 2FA first. A password does not remove a seller who already shares the session.",
            "Rotating or shared proxies. A key whose IP changes mid-session is the key Telegram revokes.",
            "Opening the working session anywhere else while Atreox runs it. Same result.",
            "Leaving the backup in a downloads folder. It is a full login.",
            "Running a module with AI Protection off for weeks. An account that does exactly one thing, all day, every day, is the easiest pattern there is to spot.",
            "Blaming every loss on the seller. Not every seller steals. Accounts from one seller vanishing a few days in is a pattern; sessions dying on one proxy is the proxy.",
          ]],
          ['linkout', { href: '/guides/spamblock-frozen-shadowban', label: 'When it goes wrong: spamblock, freeze and shadow-ban' }],
        ],
      },
    ],
  },
  {
    slug: 'spamblock-frozen-shadowban',
    url: 'spamblock-frozen-shadowban',
    group: 'module',
    short: 'Three blocks, three fixes',
    title: 'Spamblock, freeze and shadow-ban: what to do in Atreox',
    summary: 'Three different restrictions get called "blocked," and each has its own fix. What spamblock, a freeze and a shadow-ban actually are, how each one shows up in the dashboard, and the practical remedy for each.',
    seoTitle: 'Telegram spamblock, freeze and shadow-ban: the fixes',
    seoDescription:
      'Tell a spamblock from a freeze from a shadow-ban: what each restriction is, how it surfaces in the Atreox dashboard, and the practical remedy — rest, appeal via @SpamBot, and proxy hygiene.',
    module: null,
    video: null,
    body: [
      {
        id: 'three-states',
        title: 'Three states people call "blocked"',
        blocks: [
          ['p', "Three different things get lumped together as 'the account is blocked,' and the fix is different for each. Telling them apart is most of the work."],
          ['cards', [
            {
              kicker: 'Spamblock (limited)',
              blocks: [
                ['p', "A restriction Telegram places on an account that has sent too much, too fast, or drawn reports. The account still works, but its messages to people who have not added it are held back or refused. Telegram's own @SpamBot is the source of truth: it says whether an account is limited and, when it is, until when."],
              ],
            },
            {
              kicker: 'Frozen',
              blocks: [
                ['p', "A harder, request-level restriction. A frozen account often cannot even resolve a public username or read a channel — the operations the engine needs before it can do anything. Freezing is enforced when a request is made, not written onto the account as a flag, so a plain health check cannot see it. It lifts only through Telegram's own verification flow."],
              ],
            },
            {
              kicker: 'Shadow-ban / write-ban',
              blocks: [
                ['p', "The quiet one. The account reports success, but its writes never actually land: comments and messages are silently refused with no error to catch. There is no status Telegram hands you for this — it shows up reactively, when a send that looked fine turns out to have gone nowhere."],
              ],
            },
          ]],
        ],
      },
      {
        id: 'in-the-dashboard',
        title: 'How each one surfaces',
        blocks: [
          ['p', "All three surface in the status tiles at the top of the Account Manager — spamblock and a reported write-ban under Spamblock, a freeze under Frozen — once the matching check has run."],
          ['controls', [
            {
              id: 'ctl-tile-spamblock', name: 'Spamblock', where: 'Status tiles', kind: 'tile', tone: 'warn', value: '2',
              rows: [
                ['Counts', 'Accounts whose last spamblock check came back limited, plus accounts whose capability check came back can\'t post. Both mean Telegram is blocking the account from posting; the row\'s status says which. Amber, because such an account is restricted, not gone.'],
                ['Filter', 'Click it to show only limited accounts, click again to clear, like every other tile.'],
              ],
            },
            {
              id: 'ctl-tile-frozen', name: 'Frozen', where: 'Status tiles', kind: 'tile', value: '1',
              rows: [
                ['Counts', 'Accounts whose last capability check came back frozen or can\'t resolve. Shown with a snowflake in a blue tile, a status of its own rather than a general failure.'],
                ['Filter', 'Click to show only frozen accounts.'],
              ],
            },
            {
              id: 'ctl-check-spamblock', name: 'Check spamblock', where: 'Bulk actions bar · Checks group', kind: 'button', tone: 'ok', value: 'Check spamblock',
              rows: [
                ['What it does', "Asks @SpamBot, through the account's own pinned proxy on its own claimed connection, whether the account is limited. Writes the verdict — none, limited, unknown or not checked — to the account and to the Spamblock tile."],
                ['Where it lives', 'In the Checks folder of the bulk actions bar, alongside Check health, Check proxy and Check capability.'],
                ['Not read-only', 'Unlike the other three, it sends one message per account — to @SpamBot, Telegram\'s own bot.'],
                ['In bulk', 'Up to ten accounts per press, checked one after another. An account a running module is using is skipped and keeps its previous verdict.'],
                ['When to use it', 'On a fresh batch before you scale, and whenever posts stop landing without any account reporting an error.'],
              ],
            },
          ]],
          ['p', "A write-ban that Telegram reports shows as can't post in the Check column after Check capability. The quiet kind reports nothing: a comment returns success and never appears, an account stops producing results. A real send is how you confirm that one."],
        ],
      },
      {
        id: 'fixing-each',
        title: 'The remedy for each',
        blocks: [
          ['p', "The remedy follows the diagnosis. None of the three is fixed by working the account harder; all three start with taking work off it."],
          ['kv', [
            ['Spamblock / limited', 'Stop sending from it and let it rest — take it out of its module\'s pool. Many limits are temporary and clear on their own, and @SpamBot will tell you the date. If it is a hard limit, open @SpamBot, press Start, and follow its prompts to request a review. Confirm the proxy is clean and pinned before you put the account back to work.'],
            ['Frozen', "Do not delete it on the day of the verdict. Give it a long rest — around three weeks — then run Check capability again; a frozen account can come back on its own. A freeze lifts only through Telegram's own verification, so there is nothing in the panel that removes it directly."],
            ['Shadow-ban / write-ban', 'Treat it as a proxy-hygiene problem first. Put the account on one stable, pinned proxy, rest it, and confirm the one-live-session rule holds — a write-ban often follows an account being run from two places at once, or over an exit that moved. Then verify with Check capability and a single real send before trusting it again.'],
          ]],
          ['callout', [
            "The common thread is pacing and proxies, not the individual account. A batch that keeps producing spamblocks and write-bans is usually being sent too hard, or is sharing IPs — fix the pace and the proxy assignment and the states stop appearing.",
          ]],
          ['plink', [
            "Write-bans in particular travel with the proxy. The traced case, the exact error a moving exit produces, and the setting that prevents it are in ",
            { href: '/guides/telegram-session-killed-by-ip-change', text: 'why Telegram sessions die on a moving IP' },
            ".",
          ]],
          ['linkout', { href: '/guides/account-protection', label: 'The protection scheme that prevents most of this' }],
        ],
      },
    ],
  },
  {
    slug: 'profile-templates',
    url: 'profile-templates',
    group: 'module',
    short: 'One face across a batch',
    title: 'Setting up Telegram profiles in bulk',
    summary: 'What a template holds, what applying one actually does to an account, and the cooldowns that pace a rollout across a pool.',
    seoTitle: 'Set up Telegram profiles in bulk: names, avatars',
    seoDescription:
      'Build a name, bio and avatar once and roll it across a batch. Character limits, the rename cooldown, and how fast you can apply one safely.',
    module: 'profile-templates',
    video: null,
    body: [
      {
        id: 'what-it-is',
        title: 'What this module is',
        blocks: [
          ['p', "The profile is what someone sees after clicking the name on a comment. An account with no picture, no bio and a default name reads as exactly what it is. A template is that profile built once and applied across a batch: name, surname, bio and avatar, stored as one reusable object."],
          ['p', "It is included with any purchase, and it is the smallest of the modules — one page holding a grid of templates, plus the Apply template action over on the Accounts page. Everything expensive about it happens on the engine side, in the pacing."],
          ['callout', [
            "A template applies identically to every account it touches. The same first name, the same surname, the same bio, the same picture. There is no per-account variation built into this — if you want a batch that does not look like one batch, that is several templates applied to several groups, not one template with randomness in it.",
          ]],
        ],
      },
      {
        id: 'map',
        title: 'Map of the page',
        blocks: [
          ['p', "Two places, not one. The templates themselves live on their own page; applying them happens where the accounts are."],
          ['map', [
            { name: 'Templates page — toolbar', holds: 'A single New template button, top right.' },
            { name: 'Templates page — grid', holds: 'One card per template, three across on a wide screen. Clicking a card opens it for editing; each card also carries its own delete button. With no templates yet, an empty state stands in with the same create button.' },
            { name: 'Create / Edit dialog', holds: 'Template name, Name, Surname, Description, Avatar. The same dialog for both, with the title and wording changing.' },
            { name: 'Accounts page — Apply template', holds: 'In the Accounts folder of the bulk actions bar. Pick a template, apply it to the current selection, watch a progress step report per-account results.' },
          ]],
        ],
      },
      {
        id: 'building-one',
        title: 'Building a template',
        blocks: [
          ['controls', [
            {
              id: 'ctl-template-name', name: 'Template name', where: 'Create / Edit dialog', kind: 'field', value: 'Western tech enthusiasts',
              rows: [
                ['What it does', 'Names the template inside ATREOX. It is a label for you — never applied to any account.'],
                ['Required', 'Yes. It is the only required field; the Save button stays disabled while it is empty.'],
              ],
            },
            {
              id: 'ctl-first-name', name: 'Name', where: 'Create / Edit dialog', kind: 'field', value: 'Alex',
              rows: [
                ['What it does', 'The Telegram first name written onto every account this template is applied to.'],
                ['Applied how', 'Identically. Every account in the batch ends up with this exact first name.'],
                ['Also used by', 'The {first_name} token in the Description below, which substitutes this value.'],
              ],
            },
            {
              id: 'ctl-last-name', name: 'Surname', where: 'Create / Edit dialog', kind: 'field', value: 'Morgan',
              rows: [
                ['What it does', 'The Telegram last name, applied identically to every account in the batch.'],
                ['Optional', 'Yes — leave it blank and accounts get a first name only, which is ordinary on Telegram.'],
              ],
            },
            {
              id: 'ctl-description', name: 'Description', where: 'Create / Edit dialog', kind: 'field', value: "hi, I'm {first_name} — into crypto and AI",
              rows: [
                ['What it does', 'The account bio. This is the one field with room for a call to action, since it is what a reader sees after clicking through from a comment.'],
                ['The token', '{first_name} is replaced with the template’s own Name field. It does not vary per account — it is a convenience for writing the bio once, not a source of variation.'],
                ['Two limits', 'The dialog counts twice: the raw text against 200 characters, and the text after substitution against 70. Both must pass or Save stays disabled.'],
                ['Why 70', 'That is the length that actually reaches Telegram after the token is filled in. A long token and a short-looking template can still overflow it, which is why the second counter exists.'],
              ],
            },
            {
              id: 'ctl-avatar', name: 'Avatar', where: 'Create / Edit dialog', kind: 'button', tone: 'plain', value: 'Choose file',
              rows: [
                ['What it does', 'One image, shared by every account the template is applied to.'],
                ['Formats', 'PNG or JPEG.'],
                ['Size', 'Up to 5 MB.'],
                ['Optional', 'Yes. Leave it out and the template applies names and bio only, touching no picture.'],
                ['On edit', 'Choosing a new file replaces the current avatar for the template; accounts pick it up the next time it is applied.'],
              ],
            },
          ]],
        ],
      },
      {
        id: 'applying',
        title: 'Applying one to a batch',
        blocks: [
          ['p', "Applying happens on the Accounts page, not here. Select the accounts, open the Accounts folder in the bulk actions bar and press Apply template, choose which template, and the rollout starts as a background task with a progress readout."],
          ['controls', [
            {
              id: 'ctl-apply', name: 'Apply template', where: 'Accounts page → bulk actions → Accounts', kind: 'button', value: 'Apply template',
              rows: [
                ['What it does', 'Writes the template’s name, surname, bio and avatar onto every selected account, one at a time.'],
                ['Progress', 'The dialog switches to a progress step with a per-account result. Closing it does not stop the run — a corner widget keeps the task and takes you back to it.'],
                ['No templates yet', 'The picker is replaced by a note pointing at the Profile Templates page.'],
                ['What it does not touch', 'Usernames. A template has no username field; that is a per-account edit on the Accounts page, and it has its own much slower cooldown.'],
              ],
            },
          ]],
          ['p', "These conditions can leave an account unchanged; each is reported per account rather than failing the batch:"],
          ['table', {
            head: ['Reason', 'What it means', 'What to do'],
            rows: [
              ['Rate limited', 'This account had a profile change less than an hour ago. The message says roughly how many minutes remain.', 'Retry after the hour. This is per account, not pool-wide.'],
              ['Floodwait', 'Telegram asked the engine to slow down. Three of these in a row pauses the run for 30 minutes.', 'Nothing — it resumes on its own.'],
            ],
          }],
          ['p', "Supervise gates outreach in Neurocommenting, Neurodialogs and Mass Reactions. Template application follows its own profile-change rate limits."],
        ],
      },
      {
        id: 'pacing',
        title: 'How a rollout is paced',
        blocks: [
          ['p', "Nothing here is configurable — the pacing is fixed in the engine, and it is the reason a template applied across a hundred accounts is not a hundred simultaneous profile writes."],
          ['table', {
            head: ['Rule', 'Value', 'Scope'],
            rows: [
              ['Profile change cooldown', 'One change per hour', 'Per account'],
              ['Username change cooldown', 'One change per 48 hours', 'Per account'],
              ['Gap between accounts in a rollout', '30 to 90 seconds, randomised', 'Per run'],
              ['Floodwait tolerance', '3 in a row pauses the run for 30 minutes', 'Per run'],
              ['Connections', 'One account connected at a time, then disconnected', 'Whole module'],
            ],
          }],
          ['p', "The username cooldown is deliberately slower than the others. A username is the most visible and searchable thing on a profile, so it is worth changing far less often than a bio — and it is counted per account, so rolling a change across a pool scales with the pool rather than queueing behind one shared timer."],
        ],
      },
      {
        id: 'first-run',
        title: 'First run',
        blocks: [
          ['steps', [
            "Create one template. Name it for the audience it is meant to read as, not for the batch it will go on — you will reuse it.",
            "Fill in Name and, if you want one, Surname. Both go on every account identically.",
            "Write the bio and watch the second counter, the interpolated one, not the first. That is the number Telegram sees.",
            "Add an avatar if you have one. It is optional, and a template with no picture still applies names and bio.",
            "Go to the Accounts page, select the batch, and use Apply template.",
          ]],
          ['p', "If you are running more than one niche, build more than one template. One template across the whole pool gives every account the same face, which is fine for a small batch and obvious on a large one."],
          ['note', "Templates are also used by Active Warmup. Its Reapply account's template action re-applies each account’s own assigned template on a schedule, through this same pipeline and these same cooldowns. On an account no template was ever applied to, it does nothing.",
          ],
          ['linkout', { href: '/guides/active-warmup', label: 'Next: warm the accounts before they post anything' }],
        ],
      },
    ],
  },
  {
    slug: 'active-warmup',
    url: 'active-warmup',
    group: 'module',
    short: 'History before it earns',
    title: 'Warming up Telegram accounts',
    summary: 'Every control on the Active Warmup page, the caps the engine actually enforces, and the two floors you cannot configure your way past.',
    seoTitle: 'How to warm up Telegram accounts safely',
    seoDescription:
      'A fresh account that starts posting gets banned. What warming does, the 20 actions it runs, safe hourly and daily caps, and how long to wait.',
    module: 'active-warmup',
    video: null,
    body: [
      {
        id: 'what-it-is',
        title: 'What this module is',
        blocks: [
          ['p', "Active Warmup has an account do human-shaped things — read channels, scroll, mark things read, react, join — so that when it eventually starts commenting it has a history behind it instead of nothing. It is the opposite motion to the lockout on the Accounts page: that one says do not work yet, this one says do something human meanwhile."],
          ['p', "Enrolling an account supervises it indefinitely, not for one run. It works only inside its schedule window, gets lighter as it matures, and stops when you disable it."],
          ['callout', [
            "Active Warmup is this module: accounts perform the reading and activity you configure. Supervise in Accounts is separate: it gates Neurocommenting, Neurodialogs and Mass Reactions until seven days after import. The Warmup switch on the Neurocommenting page is a separate posting-rate ramp. Configure each where it lives; enabling one does not enable the others.",
          ]],
        ],
      },
      {
        id: 'map',
        title: 'Map of the page',
        blocks: [
          ['p', "Eight sections, with a jump-nav across the top in this order — the same shape as every module page: control and engine logs first, then the pool, then statistics."],
          ['map', [
            { name: 'Control', holds: 'Running/stopped state, the Enable button, Stop all, and the engine log underneath, collapsed.' },
            { name: 'Warmup Pool', holds: 'Two panes. Available accounts is the picker the configuration below applies to when you press Enable; Supervised accounts lists every enrolled account with its status, Edit and Disable.' },
            { name: 'Statistics', holds: 'Supervised, Active now, Resting and Outside window.' },
            { name: 'Presets', holds: 'The whole form below saved under a name, and loaded back in one click.' },
            { name: 'Schedule', holds: 'Auto-adapt by account stage, activity windows, client timezone, random breaks.' },
            { name: 'Safety limits', holds: 'The manual preset picker when Auto-adapt is off, actions per hour and per day, joins per day, messages per day, and progressive increase.' },
            { name: 'Warmup actions', holds: 'Economy mode, and the checklist of twenty individual warmup actions.' },
            { name: 'Target channels', holds: 'Specific channels to read, and whether accounts may touch your own channels.' },
          ]],
        ],
      },
      {
        id: 'control',
        title: 'Control',
        blocks: [
          ['controls', [
            {
              id: 'ctl-enable', name: 'Enable', where: 'Control', kind: 'button', value: 'Enable (12 accounts)',
              rows: [
                ['What it does', 'Enrols every account ticked in the Warmup Pool on the configuration currently shown on this page, and starts supervising them.'],
                ['Not a run', 'There is no start and stop. An enrolled account stays supervised until you disable it — working only inside its schedule window, and more lightly as it ages.'],
                ['In edit mode', 'The same button becomes Save changes and targets only the one account you are editing.'],
                ['Stop all', 'Beside it while anything is enrolled: disables warmup on every supervised account, after a confirmation.'],
              ],
            },
            {
              id: 'ctl-stat-tiles', name: 'Supervised / Active now / Resting / Outside window', where: 'Statistics', kind: 'tile', value: '12',
              rows: [
                ['What they count', 'Supervised is everything enrolled in Active Warmup. Active now is what is working this moment. Outside window is accounts idle because their schedule is closed. This enrollment count is separate from Supervise in Accounts.'],
                ['Module state', 'The module reads as running whenever at least one account is supervised, and stopped when none is.'],
              ],
            },
            {
              id: 'ctl-status-list', name: 'Supervised accounts', where: 'Warmup Pool', kind: 'badge', tone: 'plain', value: 'Resting (reading-only)',
              rows: [
                ['What it shows', 'One badge per enrolled account, in the engine’s own order of precedence: the account’s own status first, then Resting, then Outside window with the time the next one opens, then Maintenance, then Active with the intensity currently in force.'],
                ['Per-row actions', 'Disable removes the account from supervision. Edit loads that account’s own configuration into the form below so you can change one account without touching the rest.'],
              ],
            },
          ]],
          ['p', "How many accounts actually run at once is not a setting on this page. The engine leases a fixed number of workers per owner — three by default — so however many accounts are enrolled, only that many are ever connected and acting at the same time. Enrolling a hundred accounts does not put a hundred sessions online."],
        ],
      },
      {
        id: 'intensity',
        title: 'Intensity',
        blocks: [
          ['controls', [
            {
              id: 'ctl-auto-adapt', name: 'Auto-adapt by account stage', where: 'Schedule, first row', kind: 'toggle', on: true,
              rows: [
                ['What it does', 'Picks the intensity preset from how old the account actually is, and moves it up on its own as it ages: under 7 days Careful, 7 to 30 days Normal, past 30 days Aggressive.'],
                ['Default', 'On.'],
                ['Which clock', 'The account’s real age, counted from when it was added to the pool — not from when you enrolled it here. A 40-day-old account enrolled today starts on Aggressive immediately.'],
                ['While it is on', 'The four numbers in Safety limits are not read at all, and the panel greys them out. Caps come from the preset the account’s age selects. Turn this off if you want those numbers to mean anything.'],
                ['When to turn it off', 'When you want one fixed intensity regardless of age — usually because you are deliberately running below what the age band would pick.'],
              ],
            },
            {
              id: 'ctl-preset', name: 'Preset', where: 'Safety limits', kind: 'select', value: 'Careful',
              rows: [
                ['What it does', 'Sets one fixed intensity for the accounts being enrolled, and fills the four caps below it.'],
                ['Visible when', 'Only when Auto-adapt is off. With Auto-adapt on the picker is hidden, because it would have no effect.'],
                ['Options', 'Careful, Normal, Aggressive. Maintenance is not selectable — it is a state an account graduates into on its own.'],
                ['Default', 'Careful.'],
              ],
            },
          ]],
          ['p', "What each preset is worth, per account:"],
          ['table', {
            head: ['Preset', 'Actions / hour', 'Actions / day', 'Joins / day', 'Saved Messages / day'],
            rows: [
              ['Careful', '3', '10', '1', '2'],
              ['Normal', '5', '15', '2', '3'],
              ['Aggressive', '8', '25', '3', '5'],
              ['Maintenance', '2', '6', '1', '1'],
            ],
          }],
          ['p', "Maintenance is below Careful on purpose. It is not a starting point anyone picks — it is the ceiling an account settles into once it already has the history this module exists to build."],
        ],
      },
      {
        id: 'schedule',
        title: 'Schedule',
        blocks: [
          ['p', "When accounts are allowed to be active. Outside the windows they sit idle; the counts in Statistics show how many are waiting."],
          ['controls', [
            {
              id: 'ctl-windows', name: 'Activity windows', where: 'Schedule', kind: 'field', value: '09:00 — 11:00',
              rows: [
                ['What it does', 'One or more start/end pairs, in the timezone below. An account may only act inside one of them.'],
                ['Default', 'Two windows: 09:00 to 11:00, and 15:00 to 18:00.'],
                ['No windows at all', 'Removing every window makes the account always eligible — its hourly and daily caps still bound it, but nothing stops it by time of day.'],
                ['Crossing midnight', 'A window whose end is earlier than its start wraps through midnight and works as you would expect. A window whose start and end are identical is skipped entirely.'],
              ],
            },
            {
              id: 'ctl-timezone', name: 'Client timezone', where: 'Schedule', kind: 'select', value: 'UTC',
              rows: [
                ['What it does', 'The timezone the windows are read in.'],
                ['Default', 'Your browser’s own timezone, falling back to UTC.'],
                ['When to change it', 'Set it to where the accounts are supposed to be from, not where you are. A GEO whose accounts are all active at 04:00 local is a pattern.'],
              ],
            },
            {
              id: 'ctl-random-breaks', name: 'Random breaks', where: 'Schedule', kind: 'toggle', on: true,
              rows: [
                ['What it does', 'Occasionally stretches the gap between two actions so activity is not evenly spaced.'],
                ['How often', 'A one-in-seven chance per action, and when it fires the gap is multiplied by between two and four.'],
                ['Default', 'On.'],
                ['Baseline pacing', 'Even with this off, the gap is never fixed: it is the hour divided by your actions-per-hour cap, then jittered between 0.6 and 1.4 of that.'],
              ],
            },
          ]],
        ],
      },
      {
        id: 'limits',
        title: 'Safety limits',
        blocks: [
          ['callout', [
            "These four numbers do nothing while Auto-adapt is on, and Auto-adapt is on by default. The engine reads them only when Auto-adapt is off; otherwise the caps come from the preset the account’s age selects. The panel greys them out while it is on.",
          ]],
          ['controls', [
            {
              id: 'ctl-actions-hour', name: 'Actions / hour', where: 'Safety limits', kind: 'field', value: '5',
              rows: [
                ['What it does', 'Ceiling on every warmup action this account may take in an hour. Also sets the pace: the gap between actions is one hour divided by this number, jittered.'],
                ['Default', '5.'],
                ['Range', '1 to 100.'],
                ['At the minimum', 'One action an hour — about as slow as this module goes without being switched off.'],
                ['At the maximum', '100 an hour is far above every preset, Aggressive included at 8. Nothing in the engine tempers it for you beyond the daily cap and the shared worker limit.'],
              ],
            },
            {
              id: 'ctl-actions-day', name: 'Actions / day', where: 'Safety limits', kind: 'field', value: '15',
              rows: [
                ['What it does', 'Ceiling on total warmup actions per day for this account. Checked after the hourly cap; once it is spent the account does nothing more that day.'],
                ['Default', '15.'],
                ['Range', '1 to 500.'],
              ],
            },
            {
              id: 'ctl-joins-day', name: 'Joins / day', where: 'Safety limits', kind: 'field', value: '2',
              rows: [
                ['What it does', 'Caps one action specifically — Joining groups. Nothing else counts against it.'],
                ['Default', '2.'],
                ['Range', '0 to 50.'],
                ['At zero', 'The account never joins anything during warmup, even with the action toggled on.'],
              ],
            },
            {
              id: 'ctl-messages-day', name: 'Saved Messages / day', where: 'Safety limits', kind: 'field', value: '3',
              rows: [
                ['What it does', 'Caps exactly two actions: Saved-messages notes and Forward to Saved Messages. Both write only to the account’s own Saved Messages — nothing here sends a message to another person or chat.'],
                ['Default', '3.'],
                ['Range', '0 to 50.'],
                ['At zero', 'Those two actions never fire. Every other action is unaffected.'],
              ],
            },
            {
              id: 'ctl-progressive', name: 'Progressive increase', where: 'Safety limits', kind: 'toggle', on: true,
              rows: [
                ['What it does', 'Ramps whatever caps are in force from 30% on the first day of enrolment to 100% by day seven.'],
                ['Default', 'On.'],
                ['Which clock', 'Counted from when you enrolled the account here — not from the account’s age. An old account enrolled today gets Aggressive caps by age and still ramps into them from 30%.'],
                ['Interaction', 'Applies on top of whichever preset is in force, auto-adapted or fixed. It never raises a cap above 100% of it.'],
              ],
            },
          ]],
        ],
      },
      {
        id: 'actions',
        title: 'What accounts actually do',
        blocks: [
          ['controls', [
            {
              id: 'ctl-economy', name: 'Economy mode', where: 'Warmup actions', kind: 'toggle', on: true,
              rows: [
                ['What it does', 'Drops every action marked traffic-heavy, whatever the checklist says. Those are the ones that download real media: View videos, Listen to voice messages, GIF search / inline bots, Sticker packs, Story views.'],
                ['Default', 'On.'],
                ['Why', 'Those actions burn real gigabytes, and mobile proxies are billed by traffic.'],
                ['When to turn it off', 'Only when your proxies are not metered and you want the fuller behavioural picture.'],
              ],
            },
            {
              id: 'ctl-action-checklist', name: 'Action checklist', where: 'Warmup actions', kind: 'toggle', on: true,
              rows: [
                ['What it does', 'Twenty individual actions across nine categories, each switched on or off for the accounts being enrolled.'],
                ['Default', 'Reading only. A newly enrolled account has View dialogs, Scroll channel, Mark as read and Search messages on, and the other sixteen off.'],
                ['Two hard gates', 'Reactions, Story views and Joining groups need the account to be at least 3 days old. Economy mode removes the traffic-heavy ones.'],
                ['One more gate', 'An account with no target channels of its own depends on the shared pool from Channel Parser. While that pool has fewer than 20 channels, the account is collapsed to View dialogs — the one action needing no channel — rather than failing everything else for want of a target.'],
              ],
            },
          ]],
          ['p', "The full list, with what forces each one off:"],
          ['table', {
            head: ['Action', 'Category', 'On for a new account', 'Gated by'],
            rows: [
              ['View dialogs', 'Reading', 'Yes', '—'],
              ['Scroll channel', 'Reading', 'Yes', '—'],
              ['Mark as read', 'Reading', 'Yes', '—'],
              ['Search messages', 'Reading', 'Yes', '—'],
              ['Vote in polls', 'Activity', 'No', '—'],
              ['View videos', 'Activity', 'No', 'Economy mode'],
              ['Listen to voice messages', 'Activity', 'No', 'Economy mode'],
              ['GIF search / inline bots', 'Entertainment', 'No', 'Economy mode'],
              ['Sticker packs', 'Entertainment', 'No', 'Economy mode'],
              ['Forward to Saved Messages', 'Social', 'No', 'Saved Messages / day'],
              ['Saved-messages notes', 'Social', 'No', 'Saved Messages / day'],
              ['Archive chats', 'Groups', 'No', '—'],
              ['Mute chats / notification settings', 'Groups', 'No', '—'],
              ['View profiles', 'Profile', 'No', '—'],
              ['Check settings', 'Profile', 'No', '—'],
              ['Reapply account\'s template', 'Profile', 'No', 'Does nothing without a template'],
              ['Drafts', 'Profile', 'No', '—'],
              ['Reactions', 'Reactions', 'No', '3+ days old'],
              ['Story views', 'Stories', 'No', '3+ days old, Economy mode'],
              ['Joining groups', 'Joins', 'No', '3+ days old, Joins / day'],
            ],
          }],
          ['p', "Accounts never message each other. There is no action for it and it is excluded deliberately — a closed circle of accounts that only ever talk among themselves maps the whole network the moment one of them is examined."],
        ],
      },
      {
        id: 'targets-and-template',
        title: 'Template and targets',
        blocks: [
          ['p', "There is no template picker on this page. The Reapply account's template action uses each account's own assigned template — the one Apply template gave it — through the same pipeline and pacing; on an account that never had one, it does nothing."],
          ['controls', [
            {
              id: 'ctl-target-channels', name: 'Target channels', where: 'Target channels', kind: 'field', value: '@channel_one, @channel_two',
              rows: [
                ['What it does', 'A specific list of channels for these accounts to read and join, comma or newline separated.'],
                ['Default', 'Empty.'],
                ['If left empty', 'The account reads random channels from the pool Channel Parser has discovered. An account with its own list is unaffected by the state of that pool.'],
                ['When to set it', 'When you want accounts building history in a particular niche rather than whatever discovery happens to have found.'],
              ],
            },
            {
              id: 'ctl-own-channels', name: 'Allow reading/joining my own channels', where: 'Target channels', kind: 'toggle', on: false,
              rows: [
                ['What it does', 'Lets warmup accounts read and join channels you own.'],
                ['Default', 'Off.'],
                ['Why off', 'A fresh account whose entire reading history is your own channels is a giveaway. The panel warns about this when you switch it on.'],
                ['When to turn it on', 'Once accounts are past their early warmup stage — not before.'],
              ],
            },
          ]],
        ],
      },
      {
        id: 'floors',
        title: 'Limits that still apply',
        blocks: [
          ['p', "Your schedule and intensity settings work alongside action-specific age checks and the maintenance ceiling. These are enforced in the engine."],
          ['plates', [
            { tone: 'warn', label: 'Action-specific checks', text: "Each action keeps its own minimum age and safety requirements. Choosing an aggressive preset does not bypass those checks. The Supervise gate in Accounts applies to the three outreach modules, not to Active Warmup." },
            { tone: 'ok', label: 'Maintenance graduation', text: "Once an account has been enrolled here for 60 days, its caps are forced down to the Maintenance preset — 2 an hour, 6 a day, one join, one message — regardless of preset, auto-adapt or progressive increase. It is a ceiling for efficiency, not a safety floor, and it never disables the account." },
          ]],
          ['p', "A run of three consecutive floodwaits pauses that one account for 30 minutes. It does not stop the others — every account runs its own schedule."],
          ['p', "Every action an account takes is written to the warmup log with its outcome, kept for 30 days, so what an account was doing in the week before it froze is still answerable afterwards."],
        ],
      },
      {
        id: 'first-run',
        title: 'First run',
        blocks: [
          ['p', "The defaults are already the conservative configuration. For a fresh batch, most of this page is worth leaving alone."],
          ['steps', [
            "Tick the accounts in the Warmup Pool. Start with a handful rather than the whole pool — only three ever run at once anyway, so a small first group tells you what a large one will do.",
            "Leave Auto-adapt on. It will put fresh accounts on Careful and move them up as they age, which is what you want and means the four numbers under Limits need no attention.",
            "Set the timezone under Schedule to match where the accounts are supposed to be from, and adjust the two default windows if those hours do not suit that region.",
            "Leave the action checklist on its Reading-only default, Economy mode on, and own channels off.",
            "Press Enable. The accounts are supervised from that moment, inside their windows, ramping from 30% of their caps to full over the first week.",
          ]],
          ['p', "Watch the Supervised accounts pane day to day: Outside window means the schedule is closed, and Active with an intensity beside it means the account is working."],
          ['note', "Stop Active Warmup per account with Disable in the Warmup Pool, or for everyone with Stop all. Changing Supervise in Accounts changes only the outreach rest gate; it does not change enrollment in this module.",
          ],
          ['linkout', { href: '/guides/channel-parser', label: 'Next: find channels worth commenting in' }],
        ],
      },
    ],
  },
  {
    slug: 'channel-parser',
    url: 'channel-parser',
    group: 'module',
    short: 'Find channels to comment in',
    title: 'Channel Parser',
    summary: "Find public channels with open, active comments: search by keyword or by similar channels, filter, and send the good ones to Neurocommenting.",
    seoTitle: 'Find Telegram channels by keyword: search, filters',
    seoDescription:
      'Find Telegram channels worth commenting in: keyword and similar-channel search, filters for members, language and live comments, and how to send results to commenting.',
    module: 'channel-parser',
    video: null,
    body: [
      {
        id: 'what-it-does',
        title: 'What it does',
        blocks: [
          ['p', "Channel Parser searches Telegram for public channels, checks each one against your filters, gives the survivors a score and lists them. You then pick the channels you want and press Start commenting, which adds them to the Neurocommenting channel list."],
          ['p', "It shares a page with Group Parser. Switch between them with the Channels and Groups tabs in the top bar."],
          ['note', "The search runs on your own accounts. While an account is searching, other modules cannot use it, so run long searches when those accounts are free."],
        ],
      },
      {
        id: 'setup',
        title: 'Run a search',
        blocks: [
          /* SHOT: Channel Parser, Keyword search tab — keywords and endings fields, accounts, members range, languages, min comments on last post, max results, Start search button. */
          ['steps', [
            "Type a few keywords (Keyword search tab). Start with three or four to test your filters.",
            "Optionally add endings. Every keyword is combined with every ending: crypto + signals is searched as “crypto signals”. Generate can suggest up to 30 endings in a language you pick.",
            "Choose accounts: all healthy ones, or a selection.",
            "Set the filters (below). The defaults are a good start.",
            "Press Start search. The form shows how many combinations will run and roughly how long, and asks you to confirm a long run.",
            "Watch the live log under the control. It names every candidate and why it was rejected, so you quickly see which filter removes the most.",
          ]],
          ['p', "Cancel stops the chunks that have not started yet. Everything already found stays in the results."],
        ],
      },
      {
        id: 'similar',
        title: 'Similar channels',
        blocks: [
          ['p', "The second tab. Instead of keywords you give it channels you already like, and it asks Telegram which channels are similar. The same filters apply."],
          ['table', {
            head: ['Setting', 'What it does'],
            rows: [
              ['Source channels', 'Up to 50, one per line, as @username or a t.me link. Private invite links are not accepted.'],
              ['Depth 1', 'Channels similar to each source.'],
              ['Depth 2', 'Also searches channels similar to the best 30 results of depth 1. More results, slower.'],
            ],
          }],
          ['p', "A similar search that finds nothing on a list you have already worked through is normal: channels you already accepted or rejected are skipped, and the log says so."],
        ],
      },
      {
        id: 'filters',
        title: 'Filters',
        blocks: [
          ['table', {
            head: ['Filter', 'Default', 'What it rejects'],
            rows: [
              ['Members range', '500 – 1,000,000', 'Channels with fewer or more members. Allowed range: 500 to 10,000,000.'],
              ['Languages', 'English', 'Channels whose last three posts are in another language. Ten languages to choose from. A channel with no text (images only) cannot be detected and is rejected.'],
              ['Min comments on last post', '5', 'Channels whose newest post has fewer comments. This is the filter that tells you whether anyone reads the comments.'],
              ['Max results', '500', 'Not a filter: the search stops after this many accepted channels. Up to 5,000.'],
            ],
          }],
          ['p', "Three checks always run and cannot be changed: the channel must be public, it must have comments switched on (a linked discussion group), and it must have posted at least 5 times in the last 7 days. The comments check is the one that rejects the most candidates, so a search that looked at many channels often returns few."],
        ],
      },
      {
        id: 'results',
        title: 'Results',
        blocks: [
          /* SHOT: Channel Parser results table — tabs All / Pending / Accepted / Rejected, Copy Links and Clear, a few rows with score colours and the Start commenting / Reject buttons. */
          ['p', "Each row shows the channel, members, language, where the search found it, comments on the last post and a score from 0 to 100. Comments count most: a small channel with a busy comment section scores higher than a big silent one."],
          ['table', {
            head: ['Control', 'What it does'],
            rows: [
              ['Start commenting', 'Adds the channel to the Neurocommenting channel list. A running engine picks it up on its next round; no restart. The row then shows Commenting.'],
              ['Reject', 'Marks the channel so it does not come back in later searches.'],
              ['Stop commenting', 'Shown instead of Reject on a channel you are commenting in. Removes it from the channel list. A comment already queued for it may still post.'],
              ['Tabs', 'All, Pending (not decided yet), Accepted, Rejected.'],
              ['Copy Links', 'Copies the links on the current page, one per line.'],
              ['Clear', 'Deletes the pending results. Accepted and rejected channels stay.'],
            ],
          }],
          ['p', "Score bands: under 30 is weak, 30 to 60 is average, over 60 is good. The score adds up members (up to 40 points), comments on the last post (up to 40), posts in the last week (up to 10) and a language match (10)."],
        ],
      },
      {
        id: 'mistakes',
        title: 'Common mistakes',
        blocks: [
          ['bullets', [
            "Starting with a long keyword list. Test the filters on a few keywords first, then add endings for volume.",
            "Raising the members floor when too little comes back. Lower it instead: small channels are easier to be seen in.",
            "Setting Min comments on last post to 0. You get channels where nobody reads the comments.",
            "Expecting Clear to remember what you skipped. Only Reject stops a channel from coming back.",
          ]],
          ['linkout', { href: '/guides/group-parser', label: 'Next: find active groups' }],
        ],
      },
    ],
  },
  {
    slug: 'group-parser',
    url: 'group-parser',
    group: 'module',
    short: 'Find active groups',
    title: 'Group Parser',
    summary: "Find public groups where people actually talk and where your accounts can join and post, then allow the best ones to be mentioned in NeuroDialogs.",
    seoTitle: 'Find active Telegram groups: senders, join checks',
    seoDescription:
      'Find active Telegram groups by real conversation, not member count: unique senders, messages per week, open joining and posting, and what Allow in DMs does.',
    module: 'group-parser',
    video: null,
    body: [
      {
        id: 'what-it-does',
        title: 'What it does',
        blocks: [
          ['p', "Group Parser finds public groups, the chats where members talk to each other. It is on the same page as Channel Parser, behind the Groups tab in the top bar."],
          ['p', "For each keyword it runs two searches and merges them: one by group name, and one by message text, which finds groups where someone recently wrote about your topic."],
          ['p', "Groups you allow here are not commented in. They go to NeuroDialogs, where your accounts may mention them in private conversations."],
        ],
      },
      {
        id: 'setup',
        title: 'Run a search',
        blocks: [
          /* SHOT: Group Parser search form — keywords, members range, languages, Activity (min messages 7d, min unique senders), Access switches, max results. */
          ['steps', [
            "Open the Groups tab and type a few keywords. Endings, accounts and Max results work as in Channel Parser.",
            "Keep both Access switches on. Whatever they remove is a group your accounts could not use anyway.",
            "Leave the activity floors at their defaults for the first run.",
            "Press Start search and read the live log.",
            "Sort the results by senders, not by members, and decide on each row.",
          ]],
        ],
      },
      {
        id: 'filters',
        title: 'Filters',
        blocks: [
          ['table', {
            head: ['Filter', 'Default', 'What it rejects'],
            rows: [
              ['Members range', '500 – 1,000,000', 'Groups with fewer or more members.'],
              ['Languages', 'English', 'Groups in other languages.'],
              ['Min messages (7 days)', '50', 'Groups with fewer messages in the last week.'],
              ['Min unique senders', '10', 'Groups where fewer different people wrote. This is the best filter against dead groups and bot feeds: many messages from two accounts are not a community.'],
              ['Only groups anyone can join', 'On', 'Groups where an admin must approve new members.'],
              ['Only groups members can post in', 'On', 'Read-only groups.'],
            ],
          }],
          ['p', "Every group must also be public (have a username). Activity is measured from the group's last 50 messages."],
        ],
      },
      {
        id: 'results',
        title: 'Results',
        blocks: [
          /* SHOT: Group Parser results — columns Members, Messages 7d, Senders, Slow mode, Join, Language, Source, Score, and the Allow in DMs / Reject buttons. */
          ['p', "Each row shows members, messages in the last 7 days, unique senders, slow mode, how joining works, language, which search found it, and a score from 0 to 100."],
          ['table', {
            head: ['Control', 'What it does'],
            rows: [
              ['Allow in DMs', 'After a confirmation, adds the group to Promoted groups in NeuroDialogs. Your accounts may mention it in conversations from their next message.'],
              ['Reject', 'Marks the group so it does not come back in later searches.'],
              ['Stop mentioning', 'Shown instead of Reject on an allowed group. Removes it from the NeuroDialogs list.'],
              ['Export CSV', 'Downloads every row in the current tab and filter, not just the visible page.'],
              ['Copy Links', 'Copies the links on the current page.'],
              ['Clear', 'Deletes the pending results.'],
            ],
          }],
          ['p', "The score favours conversation over size: members give up to 25 points, messages in the week up to 35, unique senders up to 25, and a language match 15. Slow mode of one minute or more costs 10 points, because it limits how often an account can write."],
        ],
      },
      {
        id: 'mistakes',
        title: 'Common mistakes',
        blocks: [
          ['bullets', [
            "Choosing by member count. 800 members with 30 active people beat 40,000 members with 4.",
            "Ignoring slow mode. A minute or more between messages limits what an account can do there.",
            "Expecting Allow in DMs to start commenting in the group. It only lets NeuroDialogs mention the group.",
            "Leaving bad groups as Pending. Reject them, or they return in every search.",
          ]],
          ['linkout', { href: '/guides/neurocommenting', label: 'Next: start commenting' }],
        ],
      },
    ],
  },
  {
    slug: 'neurocommenting',
    url: 'neurocommenting',
    group: 'module',
    short: 'AI comments under new posts',
    title: 'Neurocommenting',
    summary: "Set up AI comments on Telegram channels: the pool and daily limits, channels and folders, persona, the Settings section, and the ramp for new accounts.",
    seoTitle: 'Automate Telegram comments with AI: full setup',
    seoDescription:
      'Set up AI comments on Telegram channels: account pool, daily comment limits, channels and folders, persona, AI Protection and AI Autoreply, and a safe ramp for new accounts.',
    module: 'neurocommenting',
    video: null,
    body: [
      {
        id: 'what-it-does',
        title: 'What it does',
        blocks: [
          ['p', "Neurocommenting watches the channels you list. When a new post appears, an account from your pool writes a comment with AI, waits a human-like delay and posts it."],
          ['p', "It needs three things: accounts in the pool, channels to watch, and an active persona (the prompt the comments are written with)."],
        ],
      },
      {
        id: 'setup',
        title: 'Set it up',
        blocks: [
          ['steps', [
            "Prepare the accounts first: one week of Active Warmup and the protection steps. Brand-new accounts that start commenting at once are the fastest way to lose them.",
            "Add accounts to the Commenting Pool: the arrow on a row moves one account; tick several to move them together.",
            "Set a daily limit. For new accounts start at 3 (see Daily limit).",
            "Add channels: Channels → Add channel(s), one @username or t.me link per line. Or press Start commenting on rows in Channel Parser.",
            "Press Auto-assign channels, so every channel has an account that handles it.",
            "Pick a persona. Copy the closest built-in and edit the copy.",
            "Leave the delay at Recommended (480–1500 s) and press Start. If accounts, channels or a persona are missing, a preflight dialog lists what is missing before anything runs.",
          ]],
          ['plink', [
            'Before step 1: ',
            { text: 'Active Warmup', href: '/guides/active-warmup' },
            ' and ',
            { text: 'Account Protection', href: '/guides/account-protection' },
            '.',
          ]],
        ],
      },
      {
        id: 'control',
        title: 'Start, sessions and Auto-continue',
        blocks: [
          ['figure', {
            src: '/public/screenshots/neurocommenting/control.png', w: 1600, h: 808,
            alt: 'Neurocommenting Module control: Running with uptime, Auto-continue on, Warmup off, Stop button, a progress bar with the line “This session ends … — the next one starts after a short break”, and Delay settings below with Min 480 and Max 1500 seconds.',
            caption: 'Module control while running. The bar fills up until the session ends itself.',
          }],
          ['p', "Start connects the accounts in the pool (this can take a couple of minutes; Cancel start stops it) and begins watching the channels. Changes to the pool, the channel list, the delay and limits are picked up on the next round, about once a minute. You do not need to restart."],
          ['table', {
            head: ['Control', 'What it does'],
            rows: [
              ['Session cap', 'A session runs for up to 10 hours, then the engine stops itself cleanly. The bar shows how far it is and when it ends.'],
              ['Auto-continue', 'On (default): after the session the engine takes a random break of 90 to 210 minutes and starts the next session by itself. The panel shows “Between sessions — the next one starts …”. Off: it stays stopped until you press Start.'],
              ['Stop', 'Ends the session. Comments still waiting out their delay are cancelled and their posts go back in the queue for later.'],
              ['Warmup', 'Off by default. When on, each account starts at 1 comment an hour and 3 a day and climbs to full speed over 14 days from when it was added. This is separate from the daily limit and from the Active Warmup module.'],
              ['Delay before commenting', 'The random wait between writing a comment and posting it. Recommended 480–1500 s (8–25 min). Presets fill the fields; Save applies them.'],
              ['Engine logs', 'Live log of what the engine decides. Open it when something looks wrong.'],
            ],
          }],
          ['p', "If the engine is Running but nobody can post, an amber line under the bar says why (accounts paused, in cooldown, at their pace limit and so on). “Done for today” is not a fault: every account has used its daily limit and they come back after 00:00 UTC."],
          ['p', "A server restart does not stop a running engine. It starts again by itself a minute or two after the service is back."],
        ],
      },
      {
        id: 'daily-limit',
        title: 'Pool and daily limit',
        blocks: [
          ['figure', {
            src: '/public/screenshots/neurocommenting/pool.png', w: 1600, h: 1461,
            alt: 'Commenting Pool with Available accounts on the left and pool accounts on the right, and Comment Limits below: Auto-assign channels, Shuffle channels, Clear assignments, Set limit, Clear limits, Reset counts, the Work by folders switch, and account rows with limit cells such as “4 of 20 today”.',
            caption: 'The pool and Comment Limits. Each account shows how many of today’s comments it has used.',
          }],
          ['p', "An account works in one module at a time. If another module (NeuroDialogs, Mass Reactions, Active Warmup) holds it, or it is still in its Supervise rest, it is refused with the reason. The rest of the batch is still added. Removing an account from the pool frees it at once."],
          ['p', "The comment limit is a daily limit. It counts successful comments since 00:00 UTC and each row reads “N of M today”. An account that reaches it stops for the day and resumes by itself shortly after 00:00 UTC. The engine keeps running meanwhile and carries on after midnight."],
          ['table', {
            head: ['Control', 'What it does'],
            rows: [
              ['Set limit', 'Type a number and press Enter or the tick. Applies to every account in the pool. There is no limit until you set one.'],
              ['Clear limits', 'Removes the limit from every pooled account.'],
              ['Reset counts', 'Sets today’s count back to zero for the ticked accounts, so they can post again before midnight. Comment history is kept.'],
              ['Pause / Resume', 'Takes one account out of posting until you resume it. Nothing automatic ever resumes a manual pause.'],
              ['Auto-assign channels', 'Deals the whole channel list evenly across the pool, replacing old assignments.'],
              ['Shuffle channels', 'Gives every account a different set of the channels already assigned, same number each.'],
              ['Clear assignments', 'Removes all assignments. Posting continues: any free pool account takes the post.'],
            ],
          }],
          ['p', "Assignment is a preference. If the assigned account cannot post right now (cooldown, paused, at its limit), another account from the pool takes the post. Accounts outside the pool are never used."],
          ['callout', [
            "Ramp for new accounts: after a week of warmup and protection, start Neurocommenting at 3 comments per account per day and raise the daily limit by 1 every day (3, 4, 5, …). Use Set limit once a day to raise it.",
          ]],
        ],
      },
      {
        id: 'channels',
        title: 'Channels',
        blocks: [
          ['p', "The channel list is what the engine watches. Every change saves immediately and is picked up on the next round."],
          ['table', {
            head: ['Control', 'What it does'],
            rows: [
              ['Add channel(s)', 'Paste channels, one per line: @username, t.me link or bare username. Duplicates and invalid lines are reported, not added.'],
              ['Clear all', 'Empties the list (asks first). Assignments, blacklist, history and presets stay.'],
              ['Save Preset', 'Saves the current list under a name. Load on a preset card replaces the list with it.'],
            ],
          }],
          ['p', "A post is only commented if it has text and comments switched on. When a discussion group needs the account to join first, the account joins before writing. A group that approves members by hand gets a join request, and another account takes the post meanwhile."],
        ],
      },
      {
        id: 'folders',
        title: 'Working by folders',
        blocks: [
          ['p', "A Telegram folder (a t.me/addlist link) holds up to 100 channels. Joining it is one request that puts an account into all of them. With Work by folders on, pool accounts get their channels this way instead of joining channels one by one."],
          ['steps', [
            "Save your channel list as a preset (Channels → Save Preset).",
            "Channels → Folders → Create folders. Pick the preset and a creator account. The creator must be outside the commenting pool and stays in the channels to keep the folders alive. A large preset may need a second or third creator; the dialog says so.",
            "Confirm. The creator joins the preset’s channels one by one, 20 to 60 seconds apart with a 2 to 5 minute pause every 20 joins. Channels it is already in are skipped, and several creators work in parallel. The dialog shows an estimate; you can close the page.",
            "Wait until the folder cards read Ready. A progress bar shows the build.",
            "In the Pool, switch Work by folders on and press Auto-assign channels. It shows how many accounts go to each folder and how many joins that means, and waits for Assign & join.",
            "Accounts join their folder in the background and start commenting in its channels as soon as they are in.",
          ]],
          ['figure', {
            src: '/public/screenshots/neurocommenting/create-folders.png', w: 896, h: 1172,
            alt: 'Create Telegram folders dialog: Channel preset “World & regional · 11 channels”, Creator account, a note to keep the creator out of the commenting pool, the plan “11 channels → 1 folder of 11”, a time estimate, Folder names, and the Create 1 folder button.',
            caption: 'Create folders: pick a preset and a creator. The dialog shows the plan and how long it takes.',
          }],
          ['figure', {
            src: '/public/screenshots/neurocommenting/folders.png', w: 1600, h: 461,
            alt: 'Folders block: Copy links and Create folders buttons, a “Building folders 5/8 channels” progress bar with Stop, and folder cards — one with “Creator joining channels 5/8”, three marked Ready.',
            caption: 'Folders being built. Use Work by folders once the cards read Ready.',
          }],
          ['bullets', [
            "Copy a folder link, but do not open it in your own Telegram: it offers to add your own account to every channel in it.",
            "While a creator builds, it counts as In work in Account Manager and cannot be put in any module.",
            "Delete on a card removes the folder and its link. Accounts leave the folder but stay in its channels.",
            "Shuffle with folders on asks whether to reshuffle channels within the same folders or move accounts to new folders.",
          ]],
        ],
      },
      {
        id: 'blacklist',
        title: 'Blacklist and deletion control',
        blocks: [
          ['figure', {
            src: '/public/screenshots/neurocommenting/blacklist.png', w: 1600, h: 625,
            alt: 'Blacklist section: Comment deletion control switch on and Remove channels button in the header, and two open categories — “Channels with no successful comments” with attempts and the main reason, and “Comments deleted” with entries such as “1 of 5 deleted · 5h ago”.',
            caption: 'The Blacklist lists channels that give you nothing back. Tick them and press Remove channels.',
          }],
          ['table', {
            head: ['Category', 'When a channel is listed'],
            rows: [
              ['Channels with no successful comments', 'At least 5 attempts from at least 2 accounts in the last 30 days, and not one comment published. The row shows the attempts, the accounts and the most common reason.'],
              ['Comments deleted', 'Only while Comment deletion control is on: your comments were found removed from the thread. The X on a row forgets those deletions.'],
            ],
          }],
          ['p', "Comment deletion control (off by default): about an hour after each comment, the account that posted it checks the thread. If the comment is gone, the channel is listed. It costs one read per comment. A deleted post or lost access does not count as a deletion."],
          ['p', "Remove channels stops watching every ticked channel, after a confirmation, and also removes them from your presets and folders. Comment history stays. Nothing is removed automatically; you decide."],
        ],
      },
      {
        id: 'model-persona',
        title: 'Model and persona',
        blocks: [
          ['p', "Model picks which AI writes the comments. The default is Grok 4.3. The choice applies from the next comment and is separate from the NeuroDialogs model."],
          ['table', {
            head: ['Model', 'In short'],
            rows: [
              ['Grok 4.3', 'Default. Declined every sensitive post in our test. Writes the shortest comments.'],
              ['Gemini 3.5 Flash-Lite', 'The cheapest model that also declined sensitive posts.'],
              ['Claude Haiku 4.5', 'Writes the longest comments. The most expensive per token.'],
              ['Kimi K2.6', 'Works, but costs about 70 times the cheapest model per comment and is slow.'],
              ['GPT-4o mini', 'Cheapest, but it commented on about one in four sensitive posts in our test. Only for channels where nothing sensitive is posted.'],
            ],
          }],
          ['figure', {
            src: '/public/screenshots/neurocommenting/persona.png', w: 1600, h: 714,
            alt: 'Persona section: the “Don’t comment on sensitive content” switch on, six built-in presets (Positive comment active, Intimate, Emotional response, Question to author, Brief review, Analytical approach) and a Create card under My Prompts.',
            caption: 'Click a card to make it the active persona. It applies from the next comment.',
          }],
          ['p', "A persona is a name and a prompt you write. The six built-ins can be read and copied but not edited; your own go under My Prompts. Clicking a card makes it active from the next comment."],
          ['bullets', [
            "Tokens you can use in the prompt: {post_text}, {channel_title}, {account_username}, {account_first_name}.",
            "Tell the model when to skip. The built-ins end with “reply with the literal token SKIP” when the post does not fit. Without such a line it comments on everything.",
            "Don’t comment on sensitive content (on by default) tells the model to skip posts about death, violence, war, disasters, mourning and politics. Turning it off asks for confirmation and lasts 7 days, then it switches back on. A separate check before writing always runs, whatever this switch says.",
          ]],
        ],
      },
      {
        id: 'settings',
        title: 'Settings',
        blocks: [
          ['p', "The // Settings section at the bottom of the page, after Persona, holds three blocks: AI Protection, AI Autoreply and Advanced settings. The (i) next to each name explains it."],
          ['figure', {
            src: '/public/screenshots/neurocommenting/settings.png', w: 1600, h: 1003,
            alt: 'Settings section: AI Protection with Off, Low, Medium (selected) and High; AI Autoreply switched on with Reply text and Reply delay 3 to 20 minutes; Advanced settings with Joins (Parallel joins on a shared gateway, Concurrent joins per proxy 2, Skip already-joined discussions) and Pace (Limit pace per account, Actions per hour per account 12).',
            caption: 'The Settings section with AI Autoreply and Advanced settings opened.',
          }],
          ['p', "AI Protection. While an account works, it also does what a person does in Telegram now and then: reads chats and channels, scrolls, looks at posts and stories, looks through its settings, likes a post, archives a chat. Off, Low, Medium (default) or High sets how often: about every 25, 10 or 4 minutes per working account. It only uses the account’s own chats on the connection the engine already has, never looks up usernames or joins anything, and never touches private chats. A like counts toward the pace limit. The (i) shows how many actions were made in the last 24 hours."],
          ['plink', [
            'The same switch is on NeuroDialogs and Mass Reactions: ',
            { text: 'AI Protection across the modules', href: '/guides/account-protection#ai-protection' },
            '.',
          ]],
          ['p', "AI Autoreply (off by default). When someone sends a private message to one of your commenting accounts, the account answers once with your text."],
          ['table', {
            head: ['Setting', 'What it does'],
            rows: [
              ['Switch', 'Turns it on. Write the reply text first; an empty text cannot be switched on.'],
              ['Reply text', 'Sent exactly as written (up to 1,000 characters). Saved when you leave the field.'],
              ['Reply delay, minutes', 'A random wait between the two numbers, counted from when the account first sees the unread message. Default 2–15.'],
              ['Who gets it', 'People with unread private messages, one reply per person per account, ever, even after a restart. Channels, groups and bots are ignored. Telegram’s own service messages are only marked read.'],
              ['When', 'Only while the Neurocommenting engine runs, with “typing…” shown first. Each reply counts toward the pace limit; when the hour is full it is sent later, never dropped.'],
            ],
          }],
          ['p', "Advanced settings apply to all your modules, not only this one. Each setting saves as you change it."],
          ['table', {
            head: ['Setting', 'Default', 'What it does'],
            rows: [
              ['Parallel joins on a shared gateway', 'Off', 'Off: accounts behind the same exit IP take turns to join. On: they join in parallel regardless of proxy. Applies to every join: discussion groups, folders, bulk joins, reactions and warmup.'],
              ['Concurrent joins per proxy', '2 (1–10)', 'How many accounts behind one exit IP may join at the same time. Only used while parallel joins are off. Lower is safer.'],
              ['Skip already-joined discussions', 'Off', 'On restart, trust our records of joined discussions and folders instead of checking each one. Faster, fewer requests; an account that left since is not re-joined up front.'],
              ['Limit pace per account', 'Off', 'Caps each account’s visible actions in any rolling hour. When an account is full, Neurocommenting gives the post to another account; reactions, warmup, dialogs and joins wait.'],
              ['Actions per hour per account', '10 (1–100)', 'The cap. Counts comments, reactions, warmup actions, dialog messages, autoreplies and joins; reading and checks do not count.'],
            ],
          }],
        ],
      },
      {
        id: 'stats',
        title: 'Statistics and comments',
        blocks: [
          ['p', "Statistics shows Total Attempts, Successful, Failed sends and Success Rate. The line above the tiles says whether they count since the last Start or all time."],
          ['p', "Comments lists every event, newest first, 50 per page. Open a row to see the post, the comment and the reason it did or did not post. Export CSV saves the current page. Clear deletes the whole history permanently, including the statistics; to let accounts post again today use Reset counts instead."],
        ],
      },
      {
        id: 'mistakes',
        title: 'Common mistakes',
        blocks: [
          ['bullets', [
            "Starting new accounts without warmup and protection, or at a high daily limit. Start at 3 per day and add 1 a day.",
            "Putting an account in two modules. It is refused; take it out of the other module first.",
            "Putting the folder creator into the commenting pool, or opening a folder link in your own Telegram.",
            "A persona without a skip instruction. It comments on posts it should leave alone.",
            "Reading “Done for today” as a fault. The accounts are at their daily limit and return after 00:00 UTC.",
            "Pressing Clear under Comments to “reset” accounts. That deletes the history; Reset counts is the right button.",
          ]],
          ['linkout', { href: '/guides/neurodialogs', label: 'Next: answer the DMs your comments bring in' }],
        ],
      },
    ],
  },
  {
    slug: 'neurodialogs',
    url: 'neurodialogs',
    group: 'module',
    short: 'AI replies to private messages',
    title: 'NeuroDialogs',
    summary: "Answer private messages with AI: how a run works, accounts taking turns, the limits that keep accounts safe, prompts and the inbox.",
    seoTitle: 'Auto-reply to Telegram DMs with AI: setup guide',
    seoDescription:
      'Answer Telegram DMs with AI without looking like a bot: runs with accounts taking turns, reply and new-people limits, the link gate, prompts, and the inbox.',
    module: 'neurodialogs',
    video: null,
    body: [
      {
        id: 'what-it-does',
        title: 'What it does',
        blocks: [
          ['p', "NeuroDialogs answers the people who write to your accounts, for example after reading one of their comments. Replies are written by AI with your prompt."],
          ['p', "Accounts are not online all the time. During a run they take turns: an account comes online, answers a few chats, and leaves; then the next one comes."],
        ],
      },
      {
        id: 'how-a-run-works',
        title: 'How a run works',
        blocks: [
          ['figure', {
            src: '/public/screenshots/neurodialogs/control.png', w: 1600, h: 248,
            alt: 'NeuroDialogs Module control: Running, Stop button, and a progress bar with the line “This run ends at 12:13 AM”.',
            caption: 'A run in progress. The module stops itself when the bar is full.',
          }],
          ['bullets', [
            "Start opens a run. It lasts Run length (default 8 hours); the progress bar shows how far it is and when it ends. Then the module stops by itself. Press Start again for the next run.",
            "Accounts come online one after another, 20 to 60 seconds apart, never more than Accounts online at once (default 2). When one leaves, the next in line starts.",
            "Accounts with people waiting for an answer go first. After that, the account whose last turn was longest ago.",
            "In its turn an account reads its inbox, answers up to Chats per turn (default 3) conversations, browses a little (AI Protection) and goes offline. A turn lasts at most Turn length (default 8 minutes) and ends sooner when the chats are done.",
            "Messages from the last 3 days are answered, newest first. Older conversations nobody answered are backlog and are only answered if you switch on Answer the backlog.",
            "Accounts that are paused, still in their Supervise rest, or have not passed the account check are skipped.",
          ]],
        ],
      },
      {
        id: 'setup',
        title: 'Set it up',
        blocks: [
          ['steps', [
            "Add accounts to the Dialogs Pool. An account works in one module at a time; one that is commenting must leave that pool first.",
            "Open Persona and make a prompt active: copy a built-in or create your own. Attach a knowledge file if replies must state prices, dates or links correctly.",
            "Check Sessions. The defaults are careful. On fresh accounts, keep New people per day low. Press Save settings.",
            "Choose an AI Protection level (Medium is the default).",
            "Press Start and watch Statistics: who is online, who is in line, how many people are waiting.",
          ]],
          ['p', "Start refuses an empty pool and a prompt that cannot be built (for example, one whose knowledge file was deleted). The error says what to fix."],
        ],
      },
      {
        id: 'settings',
        title: 'Sessions settings',
        blocks: [
          ['figure', {
            src: '/public/screenshots/neurodialogs/sessions.png', w: 1600, h: 1331,
            alt: 'Sessions settings: Rotation (Run length 8 h, Accounts online at once 2, Chats per turn 3, Turn length 8 min), Replying (Pause before a reply 40–180 s, Context messages 10, Skip chance 15%, Reply language Match the sender), Limits (Replies per person 5, Replies per session 8, Replies per day 25, New people per day 5, Chats read per session 15), Group Promotion, a folded Safety group and Save settings.',
            caption: 'The Sessions settings with their defaults. Changes apply after Save settings, from the next turn.',
          }],
          ['p', "Settings apply after Save settings, from the next turn. Nothing needs restarting. Presets (above Sessions) save these settings under a name; Load fills the form, then you save."],
          ['table', {
            head: ['Setting', 'Default', 'What it does'],
            rows: [
              ['Run length', '8 h (1–24)', 'How long a run lasts after Start.'],
              ['Accounts online at once', '2', 'How many accounts can be in a turn at the same time.'],
              ['Chats per turn', '3 (1–20)', 'How many conversations an account answers before it leaves.'],
              ['Turn length', '8 min (2–60)', 'The longest an account stays online in one turn.'],
              ['Pause before a reply', '40–180 s', 'Wait before each reply, with the typing indicator on top. Inside a turn it is capped at 60 s.'],
              ['Context messages', '10 (0–50)', 'How many earlier messages of the chat the AI sees.'],
              ['Skip chance', '15%', 'Chance of leaving a chat for a later turn, like a person who does not answer everything at once.'],
              ['Reply language', 'Match the sender', 'Or Fixed, with a language you pick.'],
            ],
          }],
          ['p', "Limits (0 means no limit):"],
          ['table', {
            head: ['Limit', 'Default', 'What it caps'],
            rows: [
              ['Replies per person', '5', 'Total replies one conversation can ever get. Then the chat stops with “reply limit reached”.'],
              ['Replies per session', '8', 'Replies one account sends in one turn.'],
              ['Replies per day', '25', 'Replies per account per day. After that the account still comes online and reads, but writes nothing.'],
              ['New people per day', '5', 'How many strangers one account starts talking to per day. The most important limit; keep it low on fresh accounts.'],
              ['Chats read per session', '15', 'How many chats an account opens and reads in one turn (minimum 1).'],
            ],
          }],
          ['p', "Group Promotion: list your groups (one per line) and set Promote every N replies (default 5; 0 = never). A reply mentions one of them at most once every N messages in a conversation. Groups allowed in Group Parser land in this list."],
          ['p', "Safety (folded):"],
          ['table', {
            head: ['Setting', 'Default', 'What it does'],
            rows: [
              ['No links before N exchanges', '3', 'Any link or @mention the AI writes is held back until the chat has had this many back-and-forths (one, if the person asked for a link). Enforced in code.'],
              ['Auto-pause at block rate', '25%', 'Pauses an account when this share of its recent messages ends in a block or refusal. It stays paused until you press Resume.'],
              ['Daily AI spend limit', '5 USD', 'For the whole pool. When reached, replying stops for the day.'],
              ['Automatic replies', 'On', 'Off: accounts still come online and read, but write nothing. Control then shows “reading only”.'],
              ['Typing simulation', 'On', 'Shows “typing…” for about as long as a person would take.'],
              ['Stop after sending a link', 'On', 'No more automatic replies in a chat once a link has gone out.'],
              ['Answer the backlog', 'Off', 'Also answer people who wrote more than 3 days ago and were never answered.'],
              ['Never reply to these people', 'Empty', '@username or numeric id, one per line or comma-separated.'],
            ],
          }],
          ['p', "Two guards run without a setting: a reply too similar to what your pool recently sent is held back, and conversations about payment demands, threats, apparent minors or a crisis are never answered automatically; they wait for you in the inbox as “needs a human”."],
        ],
      },
      {
        id: 'persona',
        title: 'Prompts and model',
        blocks: [
          ['p', "A prompt is a name, the text the AI answers with, a maximum reply length and an optional knowledge file. The active prompt is used by every account in the pool."],
          ['bullets', [
            "Tokens you can insert: {message}, {sender_name}, {message_language}, {context}, {account_id}, {account_username}, {account_phone}, {account_first_name}.",
            "Max reply length: 300 characters by default (40–1000). Shorter reads more like a real person texting.",
            "Knowledge file: .txt or .md, up to 512 KB. The first 12,000 characters go into every reply, so the AI states your real prices and links instead of inventing them.",
            "Model: the same five models as Neurocommenting, set separately here. Default Grok 4.3. The daily spend limit is counted in the chosen model’s real price.",
          ]],
        ],
      },
      {
        id: 'ai-protection',
        title: 'AI Protection',
        blocks: [
          ['p', "The AI Protection block under Control. While an account is online in its turn, it also reads channels and groups, scrolls, looks at posts and stories, likes and looks through its settings between replies. Low: about every 3–7 minutes. Medium (default): every 1–3 minutes. High: every minute or two. Off: the account only answers."],
          ['p', "It never reads, marks read or archives private chats, so it cannot hide a message NeuroDialogs has to answer."],
          ['plink', [
            'More: ',
            { text: 'AI Protection across the modules', href: '/guides/account-protection#ai-protection' },
            '.',
          ]],
        ],
      },
      {
        id: 'inbox',
        title: 'Inbox and statistics',
        blocks: [
          ['figure', {
            src: '/public/screenshots/neurodialogs/statistics.png', w: 1600, h: 958,
            alt: 'NeuroDialogs Statistics: tiles Accounts 7, Online now 2, Conversations 20, Unread 10, Replies today 63, a warning “2 conversations waiting on a human”, and account rows marked online or retrying, each with sent, new and blocked counters and a “waiting” badge.',
            caption: 'Statistics: who is online and how many people are waiting on each account.',
          }],
          ['table', {
            head: ['Account state', 'Meaning'],
            rows: [
              ['online', 'In its turn right now.'],
              ['in line', 'Waiting for its next turn.'],
              ['retrying', 'The last turn failed (for example, it could not connect); it tries again at the time shown.'],
              ['paused', 'Stopped by a safety check, with the reason. Press Resume on the row; it does not come back by itself.'],
            ],
          }],
          ['p', "Each row also shows replies sent today, new people today, people who blocked it today, and how many people are waiting. A warning strip counts auto-paused accounts and conversations waiting on a human."],
          ['figure', {
            src: '/public/screenshots/neurodialogs/inbox.png', w: 1600, h: 890,
            alt: 'Conversations inbox: a searchable list of chats on the left with unread badges and the answering account, and one conversation open on the right with a “Reply as tdata15…” box at the bottom.',
            caption: 'Conversations: read any chat and reply yourself.',
          }],
          ['p', "Conversations lists every chat. A stopped chat shows why: link sent, reply limit reached, blacklisted, they blocked us, needs a human, stopped manually, or Telegram service account."],
          ['p', "If you write in a chat yourself, the AI stops answering it (“You’re handling this conversation”). Press Hand back to AI to let it continue; it will not re-answer what you already handled."],
        ],
      },
      {
        id: 'mistakes',
        title: 'Common mistakes',
        blocks: [
          ['bullets', [
            "Expecting every account to be online. Only Accounts online at once are, taking turns; that is by design.",
            "Forgetting that a run ends. After Run length the module stops; press Start for the next run.",
            "Raising New people per day on fresh accounts. It is the limit that protects them most.",
            "Switching on Answer the backlog on accounts with many old chats. They all get answered in a burst.",
            "Writing in a chat and waiting for the AI to continue. Press Hand back to AI.",
            "Leaving paused accounts. Read the reason, fix it, press Resume.",
          ]],
          ['linkout', { href: '/guides/mass-reactions', label: 'Next: reactions from your accounts' }],
        ],
      },
    ],
  },
  {
    slug: 'mass-reactions',
    url: 'mass-reactions',
    group: 'module',
    short: 'Reactions that look natural',
    title: 'Mass Reactions',
    summary: "Put reactions on new posts or on the first comments under them, spread out over time like a real audience. Setup, the limits that matter, and dry run.",
    seoTitle: 'Add Telegram reactions from multiple accounts',
    seoDescription:
      'Add reactions to Telegram posts and comments from many accounts, spread like a real audience: targets, emoji, per-account limits, pacing, dry run and AI Protection.',
    module: 'mass-reactions',
    video: null,
    body: [
      {
        id: 'what-it-does',
        title: 'What it does',
        blocks: [
          ['p', "Mass Reactions watches your target channels. When a new post appears, accounts from the reactions pool put reactions on it, or on the first comments under it, spread over the next minutes and hours the way a real audience reacts."],
          ['p', "By default it reacts to comments, not to the post: a lively comment section makes a post look read."],
          ['figure', {
            src: '/public/screenshots/mass-reactions/control.png', w: 1600, h: 161,
            alt: 'Mass Reactions Module control: Running, the Dry run switch, and Stop.',
            caption: 'Module control with the Dry run switch.',
          }],
          ['callout', [
            "Dry run is on for a new setup. In dry run the module does everything except the send: it catches posts and plans which account reacts with what and when. Nothing reaches Telegram until you switch Dry run off.",
          ]],
        ],
      },
      {
        id: 'setup',
        title: 'Set it up',
        blocks: [
          ['steps', [
            "Add accounts to the Reactions Pool. An account works in one module at a time. Accounts younger than 3 days never react.",
            "Channels: paste @channel or t.me links, one per line, and press Add. Your own channels are the safest targets.",
            "Check each tile. Not checked yet, no comments (no discussion group) or reactions off means comment mode cannot work there. Check discussion groups runs the check again.",
            "What to react to: Comments (default, the first 3 comments under each post) or Channel posts.",
            "Emoji: keep the default four (👍 ❤ 🔥 👏) unless you know the targets allow others.",
            "Leave Limits and Pacing at their defaults.",
            "Keep Dry run on, press Start, and read the engine log for a while. If the plan looks natural, switch Dry run off.",
          ]],
          ['figure', {
            src: '/public/screenshots/mass-reactions/channels.png', w: 1600, h: 1134,
            alt: 'Mass Reactions Channels: 9 targets configured, buttons Check discussion groups, Clear all and Save preset, a paste box with Add, target tiles each showing “0/6 joined”, and saved Presets with Load buttons.',
            caption: 'Targets. Each tile shows how many pool accounts have joined its discussion group.',
          }],
          ['p', "Presets save the target list under a name; Load puts it back."],
        ],
      },
      {
        id: 'limits',
        title: 'Limits',
        blocks: [
          ['figure', {
            src: '/public/screenshots/mass-reactions/limits.png', w: 1600, h: 846,
            alt: 'Mass Reactions Limits: Per hour, Per day, Per channel per day, Per account per run fields, the “Chance a message gets reacted to at all” slider at 50%, the “Share of the pool per covered message” sliders at 35–65% with the number of accounts, and the “Skip messages that already have reactions” switch.',
            caption: 'Limits. The line next to the share shows how many accounts that means for your pool.',
          }],
          ['table', {
            head: ['Setting', 'Default', 'What it does'],
            rows: [
              ['Per hour', '4', 'Most reactions one account places in an hour, across all targets.'],
              ['Per day', '20', 'Most reactions one account places in a day.'],
              ['Per channel, per day', '8', 'Most reactions one account places on one channel in a day.'],
              ['Per account, per run', '200', 'Hard ceiling for one account in one run.'],
              ['Chance a message gets reacted to at all', '50%', 'Some messages get nothing, as with a real audience.'],
              ['Share of the pool per covered message', '35–65%', 'How much of the pool reacts to a message that is covered. A new value is drawn for each message.'],
              ['Skip messages that already have reactions', 'Off', 'Leaves alone messages that already have more reactions than the number you set.'],
            ],
          }],
          ['p', "On a channel you do not administer, at most 35% of the pool reacts to one message, whatever the share is set to: that channel’s admins can see exactly which accounts reacted."],
        ],
      },
      {
        id: 'pacing',
        title: 'Pacing',
        blocks: [
          ['figure', {
            src: '/public/screenshots/mass-reactions/pacing.png', w: 1600, h: 880,
            alt: 'Mass Reactions Pacing: First reaction after a post appears 60–600 seconds, Spread window 90 minutes, Arrival curve Human — front-loaded, Gap between one account’s reactions 30–120 seconds, Pause after a FloodWait 120 seconds, FloodWaits before quarantine 3, and Fast, Recommended and Slow presets.',
            caption: 'Pacing with the recommended values.',
          }],
          ['table', {
            head: ['Setting', 'Default', 'What it does'],
            rows: [
              ['First reaction after a post appears', '60–600 s', 'The earliest a reaction may land. Never instant.'],
              ['Spread window', '90 min', 'How long all reactions for one message are spread over.'],
              ['Arrival curve', 'Human — front-loaded', 'Most reactions early, fewer later, like real posts. Uniform spreads them evenly, which looks mechanical.'],
              ['Gap between one account’s reactions', '30–120 s', 'Minimum time between two reactions of the same account.'],
              ['Pause after a FloodWait', '120 s', 'How long an account waits when Telegram asks it to slow down.'],
              ['FloodWaits before quarantine', '3', 'After this many FloodWaits in a row the account stops until you clear it.'],
            ],
          }],
          ['p', "The Fast, Recommended and Slow buttons fill the timing fields; Save applies them. A reaction that would land on a post older than 4 hours (after a delay or restart) is cancelled instead of sent late."],
        ],
      },
      {
        id: 'joining',
        title: 'Joining',
        blocks: [
          ['p', "To react to comments, an account must be a member of the channel’s discussion group, so accounts join first. The engine joins one account at a time and then waits 3 to 10 minutes before the next. With many accounts, joining a new target takes hours, and reactions in comment mode ramp up as the joins finish. The tile shows the progress (for example, 4/6 joined)."],
          ['p', "React without joining cannot be switched on: Telegram does not allow reactions in a discussion group from a non-member. Reacting to channel posts needs no joining."],
        ],
      },
      {
        id: 'ai-protection',
        title: 'AI Protection',
        blocks: [
          ['p', "The AI Protection block under Control. Here the level is the chance that an account browses a little on the same connection before it reacts: Low about 1 in 4 reactions, Medium every other one (default), High almost every one. Off: accounts only react."],
          ['plink', [
            'More: ',
            { text: 'AI Protection across the modules', href: '/guides/account-protection#ai-protection' },
            '.',
          ]],
        ],
      },
      {
        id: 'stats',
        title: 'Statistics',
        blocks: [
          ['p', "Statistics shows accounts, targets, posts and reactions queued, then Total Attempts, Successful, Unsuccessful and Success Rate, and one row per account. A cancelled reaction (for example, for a deleted post) is not an attempt and does not lower the success rate."],
        ],
      },
      {
        id: 'mistakes',
        title: 'Common mistakes',
        blocks: [
          ['bullets', [
            "Switching Dry run off before reading the plan.",
            "Using emoji a target does not allow. Every such reaction fails; keep the default four or check the targets.",
            "Targets with no comments or reactions off in comment mode. Nothing can land there.",
            "Expecting all accounts to react right away on a new target. They join one by one, over hours.",
            "Raising Per hour to get more reactions. Add accounts instead; a fast account looks like a script.",
          ]],
          ['linkout', { href: '/guides/buying-telegram-accounts', label: 'Start of the chain: buying accounts' }],
        ],
      },
    ],
  },
];

/* ── The free tools, and the one place their addresses are spelled ──
   A `toolcta` block names a tool by ID, never by URL. That is the whole
   point of this table: the block sits in the middle and at the end of
   most articles, so an address typed into the blocks themselves would
   be spelled dozens of times and would have to be found in all of them
   the day a tool moves. Adding the account checker is one row here.

   `page`  the marketing page on this site, which explains the tool.
   `panel` where the tool actually runs, behind sign-in.

   An article's toolcta links to the PAGE, not the panel: a reader
   mid-article does not yet know what the tool is, and the panel opens
   on Clerk's sign-in screen, which asks for an account before anything
   has explained why. The page explains, and its own button leads to
   the panel. `panel` stays here because that page reads it. An
   unknown ID is a build error, not an empty block; see renderBlocks
   in prerender.mjs.
─────────────────────────────────────────────────────────────────── */
const TOOLS = [
  {
    id: 'proxy-checker',
    name: 'Telegram proxy checker',
    blurb:
      'Check a proxy against Telegram itself: whether it connects, the country and data centre Telegram reports through it, and the real exit IP with its network and type.',
    cta: 'Open the proxy checker',
    page: '/tools/proxy-checker',
    panel: 'https://app.atreoxai.com/tools/proxy-checker',
  },
  {
    id: 'account-checker',
    name: 'Telegram account checker',
    blurb:
      'Check an account against Telegram itself: whether the session still '
      + 'works, whether the account can resolve and read a public channel, and '
      + 'whether it is frozen or restricted from posting.',
    cta: 'Open the account checker',
    page: '/tools/account-checker',
    panel: 'https://app.atreoxai.com/tools/account-checker',
  },
];

const TOOL_BY_ID = Object.fromEntries(TOOLS.map(t => [t.id, t]));

/* ── Every block kind both renderers must know ──────────────────────
   This used to be a sentence in the comment above GUIDES, which is a
   fine place for a list nobody can check. It is a constant now because
   the two renderers fail DIFFERENTLY on a kind they do not know:
   prerender.mjs throws, so a missing case there fails the deploy, while
   ReaderBlocks in guides.jsx returns null, so a missing case there just
   deletes the block from the page with nothing to notice.

   scripts/verify-blocks.mjs reads this list and asserts both renderers
   handle every entry, and that nothing in the content uses a kind not
   listed here. That check is what makes the two renderers one renderer.
─────────────────────────────────────────────────────────────────── */
const BLOCK_KINDS = [
  'p', 'callout', 'steps', 'card', 'cards', 'options', 'kv', 'stat',
  'faq', 'map', 'controls', 'figure', 'video', 'plates', 'table',
  'checklist', 'note', 'bullets', 'linkout', 'toolcta', 'plink',
];


/* Public guide folders are shared by the index, reader and prerenderer. */
GUIDES.push(...window.RESEARCH_GUIDES.map(g => ({
  ...g, url: g.slug, group: 'research', module: null, video: null,
  path: g.slug === 'telegram-account-aging-claims-tested' ? '/blog/' + g.slug : undefined,
  short: g.slug === 'telegram-account-aging-claims-tested' ? 'Aging claims, tested' : 'When a session dies',
  navTitle: g.slug === 'telegram-account-aging-claims-tested' ? 'Account aging: our test' : 'Session killed by a moving IP',
})));
const GUIDE_FOLDER_SPECS = [
  { id: 'start', title: 'Start here', lede: 'Choose accounts, connect proxies, and set up your plan.',
    urls: ['buying-telegram-accounts', 'proxies-for-telegram-accounts', 'billing', 'telegram-account-aging-claims-tested'] },
  { id: 'protection', title: 'Protection', lede: 'Prepare your accounts, secure their sessions, and keep them ready.',
    urls: ['account-manager', 'account-protection', 'spamblock-frozen-shadowban', 'profile-templates', 'active-warmup', 'telegram-session-killed-by-ip-change'] },
  { id: 'modules', title: 'Modules', lede: 'Find your audience and run each outreach module.',
    urls: ['channel-parser', 'group-parser', 'neurocommenting', 'neurodialogs', 'mass-reactions'] },
];
const GUIDE_NAV_TITLES = {
  'account-protection': 'Account protection',
  'spamblock-frozen-shadowban': 'Spamblock, frozen & shadowban',
  'profile-templates': 'Profile templates',
  'active-warmup': 'Active Warmup',
  neurocommenting: 'Neurocommenting', neurodialogs: 'Neurodialogs', 'mass-reactions': 'Mass Reactions',
};
for (const g of GUIDES) if (GUIDE_NAV_TITLES[g.url]) g.navTitle = GUIDE_NAV_TITLES[g.url];
const GUIDE_FOLDERS = GUIDE_FOLDER_SPECS.map(f => ({
  ...f, guides: f.urls.map(url => GUIDES.find(g => g.url === url)),
}));

const GUIDE_BY_SLUG = Object.fromEntries(GUIDES.map(g => [g.slug, g]));
const GUIDE_BY_URL  = Object.fromEntries(GUIDES.map(g => [g.url, g]));
const GUIDE_BY_MODULE = Object.fromEntries(
  GUIDES.filter(g => g.module).map(g => [g.module, g])
);

/* The one place a guide's address is spelled. Everything that links to
   a guide — the index tiles, the reader's rail, Functions, the router,
   the sitemap — goes through here, so the routes and the prerendered
   files can never point at each other wrongly. Takes a guide or a slug. */
const guideHref = g => {
  const guide = typeof g === 'string' ? GUIDE_BY_SLUG[g] : g;
  return guide ? (guide.path || '/guides/' + guide.url) : '/guides';
};

/* Reverse of the above, for the router: a pathname back to a guide.
   Unknown last segments return null, which the page treats as the index. */
const guideFromPath = pathname => {
  const legacy = GUIDES.find(g => g.path === (pathname || '').replace(/\/$/, ''));
  if (legacy) return legacy;
  const m = /^\/guides\/([^/?#]+)\/?$/.exec(pathname || '');
  if (!m) return null;
  let seg = m[1];
  try { seg = decodeURIComponent(seg); } catch (_) {}
  return GUIDE_BY_URL[seg] || null;
};

Object.assign(window, {
  MODULES, MODULE_BY_KEY, PRICED_MODULES, INCLUDED_MODULES,
  FULL_MONTHLY, FULL_YEARLY, YEARLY_SAVING, CHEAPEST_MODULE, eur,
  PIPELINE,
  GUIDES, GUIDE_FOLDERS, GUIDE_BY_SLUG, GUIDE_BY_URL, GUIDE_BY_MODULE,
  guideHref, guideFromPath,
  TOOLS, TOOL_BY_ID, BLOCK_KINDS,
});
