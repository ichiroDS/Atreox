
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
   what Stripe actually charges. `included: true` marks the two modules
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
    name: 'Active Warmup',
    price: 30,
    icon: Zap,
    guide: 'active-warmup',
    desc: 'Runs scheduled activity on your accounts so a new one behaves like a used one.',
    tagline: 'History, before you need it',
    problem:
      "A fresh Telegram account with no history that starts posting comments on day one is the single most common way to lose a batch of accounts. The account has nothing behind it: no reading, no joins, no reactions, no reason to exist. Telegram notices.",
    does:
      "Active Warmup has the account do human-shaped things — reading channels, opening dialogs, reacting, joining — on a schedule, in your timezone, before and alongside the modules that actually earn. It doesn't pause during an account's rest window; it drops to its most conservative floor and keeps going, because an account that goes completely silent for three days is its own signal.",
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
      ['Profile template', 'Bind a template so an enrolled account gets a face at the same time it gets a history.'],
      ['Live status', 'Per account: resting, in-window, next window, current caps, and a 30-day action history with the outcome of each one.'],
    ],
    guard: 'While an account is inside its 3-day rest window, no setting overrides the floor: only reading-type actions fire, at Careful\'s numbers, with joins and messages capped to zero. Aggressive intensity and a fully-ticked action list change nothing until the window ends.',
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
      ['Bind', 'Attach a template to Active Warmup so a newly enrolled account gets its face and its history at the same time.'],
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

   `short`   one line for the index card — keep it to a few words.
   `intro`   the reader's opening paragraph. Module guides fall back to
             their module's own write-up in catalog, so only the two
             prep guides (which have no module) carry one here.
   `covers`  the chapters, in order.
   `module`  links the guide to its Functions section and its price
             (null for the prep guides, about things you buy elsewhere).
   `video`   a URL once one is recorded; the reader adds a Watch button
             when it is there and says nothing at all when it is not.
─────────────────────────────────────────────────────────────────── */
const GUIDES = [
  /* ── Before you start ── */
  {
    slug: 'buying-accounts',
    group: 'setup',
    title: 'Buying Telegram accounts',
    short: 'What to buy, what to avoid',
    summary:
      'What to buy, where, and how to tell a usable account from one that will die in a week — before you spend anything.',
    intro:
      'Accounts are the one thing ATREOX does not sell you, and the one thing that decides whether everything downstream works. A cheap batch that dies in its first week costs more than a good batch that runs for months, and the difference is visible before you pay if you know what to look for.',
    covers: [
      'Session strings, tdata folders and API credentials — what each one is and which you actually need',
      'Age, country and format: what changes the survival rate and what is just price',
      'The checks to run on a fresh batch before it touches a module',
    ],
    module: null,
    video: null,
  },
  {
    slug: 'proxies',
    group: 'setup',
    title: 'Choosing and connecting proxies',
    short: 'One per account, done right',
    summary:
      'One proxy per account, and why nearly every account loss starts with getting this wrong.',
    intro:
      'One account, one proxy — no exceptions. Two accounts behind the same address look like two accounts behind the same address, and Telegram treats them that way. This is the cheapest mistake to avoid and the most expensive one to make.',
    covers: [
      'Residential, mobile and datacentre — what each survives and what each costs',
      'Paste formats the importer accepts, and bulk-assigning across a batch',
      'Reading a failed proxy check, and reassigning without losing the account',
    ],
    module: null,
    video: null,
  },

  /* ── Module guides ── */
  {
    slug: 'account-manager',
    group: 'module',
    short: 'Import, check, keep alive',
    title: 'Account Manager',
    summary: 'Getting accounts into ATREOX and keeping them alive once they are.',
    covers: [
      'Bulk import, tdata conversion, and what each failure reason means',
      'Status check vs capability check — the second one is what catches a dead account',
      'Reading cooldowns: floodwait, peerflood, profile update, discovery',
    ],
    module: 'account-manager',
    video: null,
  },
  {
    slug: 'profile-templates',
    group: 'module',
    short: 'One face across a batch',
    title: 'Profile Templates',
    summary: 'Building a template and applying it across a batch without tripping profile limits.',
    covers: [
      'Name, bio and avatar, and using the {first_name} token so a batch is not identical',
      'Running a bulk apply and reading its per-account results',
      'The 1h profile-change and 48h username cooldowns in practice',
    ],
    module: 'profile-templates',
    video: null,
  },
  {
    slug: 'active-warmup',
    group: 'module',
    short: 'History before it earns',
    title: 'Active Warmup',
    summary: 'Setting up a warmup plan matched to how old your accounts actually are.',
    covers: [
      'Careful / Normal / Aggressive — what each preset actually sets',
      'Building a schedule, choosing a timezone, and why random breaks matter',
      'Auto-adapt and progressive increase, and when to leave caps fixed',
    ],
    module: 'active-warmup',
    video: null,
  },
  {
    slug: 'channel-parser',
    group: 'module',
    short: 'Build the target list',
    title: 'Channel Parser',
    summary: 'Building a target list that is worth commenting into.',
    covers: [
      'Keywords and AI-suggested endings for widening a niche',
      'Filters that matter: member range, language, comments on the last post',
      'Similar-channel search, and promoting results into the commenting pool',
    ],
    module: 'channel-parser',
    video: null,
  },
  {
    slug: 'group-parser',
    group: 'module',
    short: 'Rooms worth walking into',
    title: 'Group Parser',
    summary: 'Finding groups that are actually alive, and that you can actually post in.',
    covers: [
      'Messages in the last 7 days vs unique senders — why the second is the real filter',
      'Open-join and can-post gates, slow mode, and join requests',
      'Reading a group result row before committing accounts to it',
    ],
    module: 'group-parser',
    video: null,
  },
  {
    slug: 'neurocommenting',
    group: 'module',
    short: 'Empty list to live comments',
    title: 'Neurocommenting',
    summary: 'From an empty channel list to comments going out, and what to change when they read wrong.',
    covers: [
      'Writing a persona prompt: identity, tone, length, language rule, skip conditions',
      'Building the commenting pool and letting auto-assignment spread it',
      'Delay presets, rate-limit windows, per-account caps, and reading the blacklist',
    ],
    module: 'neurocommenting',
    video: null,
  },
  {
    slug: 'neurodialogs',
    group: 'module',
    short: 'DMs at a human pace',
    title: 'NeuroDialogs',
    summary: 'Setting up DM answering that converts without reading as an instant-reply bot.',
    covers: [
      'Prompt presets and attaching a knowledge file',
      'Session rhythm, hot vs idle gaps, and the two reply-delay ranges',
      'The link gate, per-thread caps, block-rate pause, and the daily spend limit',
    ],
    module: 'neurodialogs',
    video: null,
  },
  {
    slug: 'mass-reactions',
    group: 'module',
    short: 'A pass that lands right',
    title: 'Mass Reactions',
    summary: 'Running a reaction pass that arrives like an audience instead of a switch being flipped.',
    covers: [
      'Monitor vs existing mode, post age limits and processing order',
      'Coverage range, arrival curve, spread window and react probability',
      'Discussion-group reactions, floodwait policy, and using dry run first',
    ],
    module: 'mass-reactions',
    video: null,
  },
];

const GUIDE_BY_SLUG = Object.fromEntries(GUIDES.map(g => [g.slug, g]));
const GUIDE_BY_MODULE = Object.fromEntries(
  GUIDES.filter(g => g.module).map(g => [g.module, g])
);

Object.assign(window, {
  MODULES, MODULE_BY_KEY, PRICED_MODULES, INCLUDED_MODULES,
  FULL_MONTHLY, FULL_YEARLY, YEARLY_SAVING, CHEAPEST_MODULE, eur,
  PIPELINE,
  GUIDES, GUIDE_BY_SLUG, GUIDE_BY_MODULE,
});
