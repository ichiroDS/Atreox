
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
            "This directly ties into pricing. You cannot expect a $0.20 account to perform identically to a $0.90 account, even if both meet our recommended basic characteristics. Cheaper accounts almost always mean those hidden registration parameters are of lower quality. This doesn't mean you should blindly buy the most expensive accounts on the market. It simply means that cheaper accounts carry a higher risk of bans and require far more meticulous testing and a slower warmup process.",
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
          ['p', "That is a change from what this guide used to say. We previously recommended Indonesian stock on the grounds that it is cheap. Our own survival data does not support that: Indonesia sits in our worst-performing group, alongside Myanmar, India and Bangladesh. Cheap stock is cheap because it does not last."],
          ['p', "Treat this as our current best answer rather than a settled one. It comes from survival rates across our whole user base, and Argentina leads on a shorter history than the older geos. We publish our own batch results as they mature, including the ones that go against the recommendation."],
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
          ['figure', {
            src: '/public/screenshots/buying-telegram-accounts/geobenchmark.jpg',
            w: 1280, h: 544,
            alt: 'ATREOX dashboard Geo benchmark showing best and worst performing account countries by survival rate',
            caption: 'Geo benchmark in the ATREOX dashboard: survival rate by account country',
          }],
          ['callout', [
            "Survival rate on its own is the wrong number to buy on.",
            "What you are actually buying is a surviving account, and its price is what the seller charges divided by the share that lives. A geo that survives at 78% and costs four times more per account is the more expensive choice, not the better one.",
            "That is why Ukraine and Poland are not our recommendation despite sitting near the top of the chart. They do survive well. They also cost around $2 to $2.50 per account, which is several times what Argentine and Uzbek stock costs for a survival rate that is barely different. The same budget buys you far more working accounts in AR or UZ.",
          ]],
          ['p', "So read the chart as one input, not as a ranking to buy from. Two things it does not show, and both matter:"],
          ['bullets', [
            "What the stock costs. Divide the price by the survival share before you compare anything.",
            "How long we have been measuring. Argentina leads on the shortest history of any geo in the table. Its number will move more than the others as we collect more, which is why we publish our own batch results rather than asking you to take the chart on faith.",
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
                ['Instant IP Death:', "If a seller's accounts get banned immediately during the initial ATREOX health check due to the IP change, abandon that seller."],
                ['0-Day / Fresh Accounts:', 'No rest time equals an instant ban.'],
                ['"Sold Before" or Password-Protected:', 'Someone else holds the keys to the session or can recover it.'],
              ],
            },
          ]],
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
          ['p', "The Practical Logic (Simply Put):"],
          ['options', [
            { text: 'Need maximum savings and massive scale? Use Datacenter SOCKS5 (but keep your action tempo very conservative).' },
            { text: 'Need a "normal user" history and smooth warmup? Use Residential.' },
            { text: 'Need maximum natural behavior? Use Mobile proxies. Despite the cost, we strongly recommend beginners start with Mobile Proxies for the best survival rates.', badge: 'Recommended for beginners' },
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
          ['p', "A note on providers. DataImpulse is what we use for most geos, but it does not carry every country - Argentina, currently our first recommendation, is not available there at all. We use FloppyData for Argentine proxies. Check that your provider actually offers the country before you buy the accounts."],
          ['p', "The exact settings to use when generating your list:"],
          ['callout', [
            "Type: Sticky. Not rotating.",
            "This is the most important setting on this page, and an earlier version of this guide got it wrong. A rotating proxy changes its exit IP on a timer, underneath a session that is already logged in. To Telegram that looks like the account moving to a different address mid-session, which is one of the clearest signals it acts on.",
            "Every proxy the ATREOX team runs is sticky, and every proxy we recommend is sticky. If you are currently running accounts on rotating proxies because of the earlier version of this page, move them to sticky. Any survival results you collected on rotating proxies measured the proxy, not the stock.",
          ]],
          ['kv', [
            ['Type', 'Sticky. Not rotating.'],
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
                  'Open the Account Manager and click on the specific account.',
                  'Navigate to the "Proxies" tab.',
                  'Paste your connection string (e.g., ip:port:login:password).',
                  'Click Save.',
                ]],
              ],
            },
            {
              kicker: '2. Bulk Reassignment (Proxy Pool)',
              blocks: [
                ['p', "The Proxy Pool feature allows you to automatically distribute a large batch of proxies across hundreds of accounts in just two clicks."],
                ['steps', [
                  'Select your target accounts in the dashboard.',
                  'Open the Reassign Proxies menu.',
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
            { q: 'Which proxies are best for Telegram automation?', a: 'For automation, sticky proxies with anchored IPs are best. They provide predictable account behavior and drastically reduce the risk of deauthorization and bans.' },
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
          ['p', 'There are two ways to buy, and they are alternatives rather than tiers. Either you pick individual modules and pay for those, or you take the full licence and get every module including anything released while it is active. Two things - the Channel Parser and the Group Parser - come with any purchase at all.'],
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
          ['p', "It is a single page, not a set of tabs. Everything below is a region of that one screen, in the order it appears, plus the five dialogs that open on top of it."],
          ['callout', [
            "Everything on this page is explicit. None of the three checks runs on a schedule or in the background — each one happens because you pressed a button, and each is read-only on the Telegram side: no messages, no profile writes, nothing that could itself get an account flagged.",
          ]],
        ],
      },
      {
        id: 'map',
        title: 'Map of the page',
        blocks: [
          ['map', [
            { name: 'Toolbar', holds: 'Reassign proxies · Bulk import · Add account. Top right, always present.' },
            { name: 'Capability summary', holds: 'A banner counting how much of the pool has passed, failed or never had a capability check.' },
            { name: 'Shared-proxy warning', holds: 'Appears only when two or more active accounts sit behind the same proxy. Carries its own Reassign now button.' },
            { name: 'Status tiles', holds: 'Seven counts — Active, Busy, Cooldown, Needs Reauth, Banned, Flagged, Dead. Each one is also a filter for the list below.' },
            { name: 'Bulk actions bar', holds: 'Eight actions over the current selection. Always visible; the buttons disable at zero selected rather than the bar disappearing.' },
            { name: 'Account list', holds: 'One row per account: name, Comments, Last used, Added, Proxy, Days, Progress, Check, Status. Clicking a row opens its detail dialog.' },
            { name: 'Banned cleanup bar', holds: 'A floating bar at the bottom, only when the selection contains banned accounts.' },
            { name: 'Dialogs', holds: 'Add account · Bulk import (Paste text / TData) · Reassign proxies · Reauth · Account detail (Overview / Profile).' },
          ]],
        ],
      },
      {
        id: 'getting-accounts-in',
        title: 'Getting accounts in',
        blocks: [
          ['p', "Two ways in, both in the toolbar. Add account is the single-account form; Bulk import takes either a paste of session lines or a zip of Telegram Desktop tdata folders, which it converts for you."],
          ['controls', [
            {
              id: 'ctl-add-account', name: 'Add account', where: 'Toolbar', kind: 'button', value: 'Add account',
              rows: [
                ['What it does', 'Opens a form for one account: ID, display name, phone, session string, api_id, api_hash, and an optional proxy.'],
                ['Required', 'ID (no spaces or slashes), session string, api_id, api_hash. Display name and phone are optional.'],
                ['Validation', 'Session string must be at least 100 characters — a Telethon StringSession is usually 350+. api_id must be a positive integer. api_hash must be exactly 32 hex characters.'],
                ['When to use it', 'One account at a time, when you already have a Telethon session string. If you have tdata folders instead, use Bulk import — it converts them.'],
              ],
            },
            {
              id: 'ctl-proxy-toggle', name: 'Proxy', where: 'Add account dialog', kind: 'toggle', on: false,
              rows: [
                ['What it does', 'Reveals the proxy fields for this account: Type, Host, Port, User, Pass.'],
                ['Default', 'Off — an account is created with no proxy unless you turn this on.'],
                ['Type', 'socks5 or http. socks5 is the default selection.'],
                ['If left off', 'The account is saved without a proxy. Check proxy then returns a 400 for it, and the proxy column in the list stays empty.'],
              ],
            },
            {
              id: 'ctl-bulk-import', name: 'Bulk import', where: 'Toolbar', kind: 'button', value: 'Bulk import',
              rows: [
                ['What it does', 'Opens a two-tab dialog. Paste text takes one account per line; TData converts a zip of Telegram Desktop tdata folders into sessions first.'],
                ['Line format', 'id|display_name|phone|session_string|api_id|api_hash — pipe-separated, leave display_name and phone blank if unused.'],
                ['Limit', '100 accounts per request. Paste more and the dialog says so, then imports only the first 100.'],
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
        title: 'The three checks',
        blocks: [
          ['p', "Three separate checks, three separate things they can tell you, three independent five-minute cooldowns. They do not substitute for each other: an account can pass health and still be unusable, which is the whole reason the capability check exists."],
          ['controls', [
            {
              id: 'ctl-check-health', name: 'Check health', where: 'Bulk actions bar · Account detail → Actions', kind: 'button', tone: 'ok', value: 'Check health',
              rows: [
                ['What it does', 'Connects the account\'s own Telegram client for the length of the call, confirms the session is authorised, and makes one lightweight self-lookup. Reports back active, banned, disabled or unknown, plus whatever restricted / scam / fake flags Telegram already attaches to the account.'],
                ['What it cannot see', 'A spam block. A self-lookup cannot detect one; it only ever shows up reactively when a real send fails, and that lands the account in cooldown instead.'],
                ['Rate limit', 'One per account per five minutes. Sooner returns 429, and the button in the detail dialog shows the seconds remaining instead.'],
                ['Side effects', 'None on the Telegram side — no messages, no profile writes. Read-only.'],
                ['When to use it', 'Right after import, and whenever an account starts behaving oddly.'],
              ],
            },
            {
              id: 'ctl-check-proxy', name: 'Check proxy', where: 'Bulk actions bar · Account detail → Actions', kind: 'button', value: 'Check proxy',
              rows: [
                ['What it does', 'Opens a raw SOCKS5 or HTTP CONNECT through the account\'s configured proxy to a Telegram data-centre address and reports whether it got through, with the latency in milliseconds.'],
                ['Timeout', '10 seconds, hard.'],
                ['No proxy configured', 'Returns a 400. In the detail dialog the button is disabled with a tooltip saying so.'],
                ['Rate limit', 'One per account per five minutes, counted separately from the other two checks.'],
                ['Side effects', 'Never touches the Telegram session at all — no MTProto handshake, just a TCP connect.'],
                ['When to use it', 'When accounts stop working all at once, or after changing proxies. It separates "the proxy is dead" from "the account is dead".'],
              ],
            },
            {
              id: 'ctl-check-capability', name: 'Check capability', where: 'Bulk actions bar · Account detail → Actions', kind: 'button', value: 'Check capability',
              rows: [
                ['What it does', 'Asks the account to resolve a known-good public username and read that channel\'s message history — the exact pair of operations the engine performs for every monitored channel. Result is saved and shown in the list\'s Check column.'],
                ['Why it exists', 'An account can be frozen, or simply unable to resolve anything, while the health check\'s restricted / scam / fake flags stay at zero the whole time. Freezing is enforced at the request level, not written onto the account, so a self-lookup cannot see it.'],
                ['Results', 'ok · can\'t resolve · frozen · unknown · error. frozen is a real Telegram restriction, lifted only through their own verification flow. error means the check itself was rate-limited by Telegram, which is not a verdict either way.'],
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
          ['p', "Seven tiles across the top, each a live count and a filter — click one to show only those accounts, click again to clear. Active, Cooldown, Needs Reauth and Banned are mutually exclusive; Busy, Flagged and Dead are separate signals that can apply on top of any of them."],
          ['controls', [
            { id: 'ctl-tile-active', name: 'Active', where: 'Status tiles', kind: 'tile', tone: 'ok', value: '12',
              rows: [['Counts', 'Accounts whose status is active, that are not flagged, and that have not failed a capability check.']] },
            { id: 'ctl-tile-busy', name: 'Busy', where: 'Status tiles', kind: 'tile', value: '3',
              rows: [['Counts', 'Accounts currently claimed by discovery or the commenting pool. An account claimed by one of the two is still free for the other, so this counts anything not free for both.']] },
            { id: 'ctl-tile-cooldown', name: 'Cooldown', where: 'Status tiles', kind: 'tile', tone: 'warn', value: '2',
              rows: [
                ['Counts', 'Accounts waiting out a cooldown.'],
                ['Breakdown', 'Hovering the tile lists the reasons behind the number: floodwait, peerflood, profile update, discovery.'],
              ] },
            { id: 'ctl-tile-reauth', name: 'Needs Reauth', where: 'Status tiles', kind: 'tile', value: '1',
              rows: [['Counts', 'Accounts whose status is disabled — a dead session. These are the only accounts the Reauth button will act on.']] },
            { id: 'ctl-tile-banned', name: 'Banned', where: 'Status tiles', kind: 'tile', tone: 'bad', value: '0',
              rows: [['Counts', 'Accounts Telegram has banned. Selecting any of these brings up the cleanup bar at the bottom of the page.']] },
            { id: 'ctl-tile-flagged', name: 'Flagged', where: 'Status tiles', kind: 'tile', tone: 'warn', value: '0',
              rows: [
                ['Counts', 'Accounts carrying Telegram\'s own restricted, scam or fake flag, as read during the last health check. Independent of status — an account can be active and flagged at once.'],
                ['What to do', 'Do not throw it away. Give it no work for about two weeks and the flag lifts by itself. The mistake is keeping it commenting while it is flagged, not keeping it at all.'],
              ] },
            { id: 'ctl-tile-dead', name: 'Dead', where: 'Status tiles', kind: 'tile', tone: 'bad', value: '0',
              rows: [
                ['Counts', 'Accounts whose last capability check came back frozen or can\'t resolve — Telegram itself saying this account cannot do the one thing the engine needs.'],
                ['Exception', 'An account you disabled yourself shows as Needs Reauth, not Dead, so a deliberate action is never masked by a capability verdict.'],
                ['What to do', 'Do not delete it. Leave it alone for about three weeks, then run Check capability on it again — a meaningful share of frozen accounts come back on their own. Deleting on the day of the verdict throws away accounts that would have recovered.'],
              ] },
          ]],
          ['p', "Below the tiles, one row per account. Narrow screens drop the middle columns first and keep Check and Status to the end."],
          ['table', {
            head: ['Column', 'Shows'],
            rows: [
              ['Comments', 'How many comments this account has posted. Clicking the number opens a histogram.'],
              ['Last used', 'When the engine last used this account.'],
              ['Added', 'When the account entered the pool. This is the anchor every warmup calculation counts from.'],
              ['Proxy', 'The proxy currently assigned, with a warning marker when another active account shares it.'],
              ['Days', 'Days rested before the first neurocommenting session, out of the required 3. Only populated while Auto-Warmup is on.'],
              ['Progress', 'How far through the full 23-day warmup the account is — 3 resting days plus 20 ramp days. Reaches 100% once both are done.'],
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
              id: 'ctl-reauth', name: 'Reauth', where: 'Bulk actions bar', kind: 'button', tone: 'warn', value: 'Reauth',
              rows: [
                ['What it does', 'Opens a dialog to upload a fresh tdata export, as a single zip containing exactly one tdata folder, replacing a dead session on an existing account.'],
                ['Selection rule', 'Exactly one account, and its status must be disabled. Any other selection disables the button and the tooltip says why.'],
                ['Safety', 'The new session is validated with a real connection — through this account\'s own proxy, using its existing api_id and api_hash — before anything is written. If that fails you get a clear error and the existing session is left untouched.'],
                ['On success', 'The session string is replaced; api_id and api_hash are not. Status returns to active unless the account was deliberately paused, cooldowns are cleared, and both check timers reset so the next health and proxy checks run fresh instead of waiting out a stale five minutes.'],
                ['When to use it', 'When an account lands in Needs Reauth and you still have a working tdata for it.'],
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
              id: 'ctl-warmup-on', name: 'Auto-Warmup ON', where: 'Bulk actions bar', kind: 'button', tone: 'warn', value: 'Auto-Warmup ON',
              rows: [
                ['What it does', 'Turns on the per-account warmup lifecycle: a hard block on commenting, parsing and template application for the first 72 hours after the account was added, then a tightening daily comment cap from day 4 through day 23.'],
                ['Default', 'Off. A newly added account is not warming up until you switch it on.'],
                ['Anchored to', 'When the account was added, not when you flipped the switch. Turning it on for an already-aged account applies whatever stage its real age implies rather than re-locking it for three days.'],
                ['Cost', 'A plain database write. No Telegram traffic, so it completes immediately.'],
                ['When to use it', 'On every fresh batch, before anything else touches it.'],
              ],
            },
            {
              id: 'ctl-warmup-off', name: 'Auto-Warmup OFF', where: 'Bulk actions bar', kind: 'button', tone: 'bad', value: 'Auto-Warmup OFF',
              rows: [
                ['What it does', 'Removes the resting lockout and the ramp cap. The accounts become immediately available for commenting, parsing and template application at full limits.'],
                ['Confirmation', 'Asks first, and says plainly that accounts flagged or banned as a result are on you.'],
                ['Side effect', 'The Days and Progress columns go back to showing a dash, the same as an account that never opted in.'],
                ['When to use it', 'On accounts that are genuinely already aged and that you have decided do not need the ramp.'],
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
          ['p', "Clicking a row opens its dialog, which has two tabs: Overview and Profile. Overview holds four blocks in order — Info, Proxy, Actions, Danger zone."],
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
                ['What it does', 'Forces the account\'s status to one of four values: active, cooldown, banned, disabled.'],
                ['Default', 'Whatever the account\'s current status is. The Save button stays disabled until you pick something different.'],
                ['What it is really for', 'Parking an account you need kept out of circulation without deleting it. The usual case: no comment limit was set, the account has posted far more than it should have, and the next comment is the one that gets it banned. Moving it off active buys you time to decide.'],
                ['Why parking works', 'The engine only ever builds its pool from accounts whose status is active. A parked account is never selected for commenting, even if its id is still sitting in the commenting pool. In the panel the pool\'s available column offers active accounts only, so it cannot be added back by accident — and disabled or banned accounts already in the pool are pulled out of it automatically.'],
                ['Use disabled, not cooldown', 'Parking at cooldown does not hold. Setting it here writes no expiry, and on its next poll round the engine reactivates any cooldown account whose expiry is empty or already past — so the account quietly returns to active within one cycle. disabled stays put until you change it back.'],
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
            "Bring the accounts in — Bulk import for a batch, Add account for one. Paste your proxies into the same dialog if you have them ready.",
            "If you imported without proxies, run Reassign proxies now, before anything connects. One distinct proxy per account, or the request is refused outright.",
            "Select everything and press Check health. Anything that comes back banned on its first contact with a new IP was never going to survive; note the seller.",
            "Select everything again and press Check capability. This is the check that catches a frozen account while every other signal still reads clean.",
            "Select the survivors and press Auto-Warmup ON. It is off by default, and this is the step that buys the accounts their first 72 hours of rest.",
            "Wait out the rest, then use Apply template to give the batch a face.",
          ]],
          ['p', "After that the pool is ready for a module to claim from. The tiles are the thing to watch day to day: a rising Cooldown count is pacing, a rising Dead count is the accounts themselves."],
          ['note', "Account changes reach the engine on their own: it re-reads the pool from the database every poll round, so an account you add, park or re-proxy is picked up within one poll interval without you doing anything else.",
          ],
          ['linkout', { href: '/guides/profile-templates', label: 'Next: give the whole batch a face' }],
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
            { name: 'Accounts page — Apply template', holds: 'In the bulk actions bar. Pick a template, apply it to the current selection, watch a progress step report per-account results.' },
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
          ['p', "Applying happens on the Accounts page, not here. Select the accounts, press Apply template in the bulk actions bar, choose which template, and the rollout starts as a background task with a progress readout."],
          ['controls', [
            {
              id: 'ctl-apply', name: 'Apply template', where: 'Accounts page → bulk actions bar', kind: 'button', value: 'Apply template',
              rows: [
                ['What it does', 'Writes the template’s name, surname, bio and avatar onto every selected account, one at a time.'],
                ['Progress', 'The dialog switches to a progress step with a per-account result. Closing it does not stop the run — a corner widget keeps the task and takes you back to it.'],
                ['No templates yet', 'The picker is replaced by a note pointing at the Profile Templates page.'],
                ['What it does not touch', 'Usernames. A template has no username field; that is a per-account edit on the Accounts page, and it has its own much slower cooldown.'],
              ],
            },
          ]],
          ['p', "Three things can make an individual account come back unchanged, and all three are reported per account rather than failing the batch:"],
          ['table', {
            head: ['Reason', 'What it means', 'What to do'],
            rows: [
              ['Resting', 'The account is inside the 72-hour lockout that Auto-Warmup applies on the Accounts page. Template application is blocked for the whole window, and the message says how many hours are left.', 'Wait it out, or apply to the rest of the batch and come back.'],
              ['Rate limited', 'This account had a profile change less than an hour ago. The message says roughly how many minutes remain.', 'Retry after the hour. This is per account, not pool-wide.'],
              ['Floodwait', 'Telegram asked the engine to slow down. Three of these in a row pauses the run for 30 minutes.', 'Nothing — it resumes on its own.'],
            ],
          }],
          ['p', "Note the asymmetry in the resting rule: the 72-hour lockout blocks the bulk template path only. Editing one account's profile by hand on the Accounts page is deliberately still allowed during rest."],
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
            "Go to the Accounts page, select a batch that is past its 72-hour rest, and use Apply template.",
          ]],
          ['p', "If you are running more than one niche, build more than one template. One template across the whole pool gives every account the same face, which is fine for a small batch and obvious on a large one."],
          ['note', "Templates are also used by Active Warmup. Its Gradual profile updates action re-applies an account’s assigned template on a schedule, through this same pipeline and these same cooldowns — which is why that action stays switched off until a template exists to apply.",
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
            "Three different things in this panel are called warmup, and they are genuinely separate mechanisms. On the Dashboard, the Warmup switch beside Start is an owner-wide ramp on posting rate — off by default. On the Accounts page, Auto-Warmup ON/OFF is the per-account lockout: 72 hours of no commenting, then a tightening comment cap through day 23 — off by default. This page is the third: the account doing human activity, also off by default. All three are opt-in, all three are switched on separately, and they compose rather than replace each other.",
          ]],
        ],
      },
      {
        id: 'map',
        title: 'Map of the page',
        blocks: [
          ['p', "Nine sections, with a jump-nav across the top in this order."],
          ['map', [
            { name: 'Control', holds: 'Running/stopped state, four counts — Supervised, Active now, Resting, Outside window — the per-account status list, and the Enable button.' },
            { name: 'Accounts', holds: 'Which accounts the configuration below applies to when you press Enable. Replaced by a single account when you are editing one already enrolled.' },
            { name: 'Intensity', holds: 'Auto-adapt by account stage, and the manual preset picker it hides.' },
            { name: 'Schedule', holds: 'Activity windows, client timezone, random breaks.' },
            { name: 'Limits', holds: 'Actions per hour and per day, joins per day, messages per day, and progressive increase.' },
            { name: 'Actions', holds: 'Economy mode, and the checklist of twenty individual warmup actions.' },
            { name: 'Template', holds: 'The profile template the Gradual profile updates action re-applies. Optional.' },
            { name: 'Targets', holds: 'Specific channels to read, and whether accounts may touch your own channels.' },
            { name: 'Logs', holds: 'Engine log and the warmup action log.' },
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
                ['What it does', 'Enrols every account picked in the Accounts section below on the configuration currently shown on this page, and starts supervising them.'],
                ['Not a run', 'There is no start and stop. An enrolled account stays supervised until you disable it — working only inside its schedule window, and more lightly as it ages.'],
                ['In edit mode', 'The same button becomes Save changes and targets only the one account you are editing.'],
              ],
            },
            {
              id: 'ctl-stat-tiles', name: 'Supervised / Active now / Resting / Outside window', where: 'Control', kind: 'tile', value: '12',
              rows: [
                ['What they count', 'Supervised is everything enrolled. Active now is what is working this moment. Resting is accounts inside the Accounts page’s 72-hour lockout, which forces this module down to its floor. Outside window is accounts idle because their schedule is closed.'],
                ['Module state', 'The module reads as running whenever at least one account is supervised, and stopped when none is.'],
              ],
            },
            {
              id: 'ctl-status-list', name: 'Per-account status list', where: 'Control', kind: 'badge', tone: 'plain', value: 'Resting (reading-only)',
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
              id: 'ctl-auto-adapt', name: 'Auto-adapt by account stage', where: 'Intensity', kind: 'toggle', on: true,
              rows: [
                ['What it does', 'Picks the intensity preset from how old the account actually is, and moves it up on its own as it ages: under 7 days Careful, 7 to 30 days Normal, past 30 days Aggressive.'],
                ['Default', 'On.'],
                ['Which clock', 'The account’s real age, counted from when it was added to the pool — not from when you enrolled it here. A 40-day-old account enrolled today starts on Aggressive immediately.'],
                ['While it is on', 'The four numbers in Limits below are not read at all. Caps come from the preset the account’s age selects. Turn this off if you want those numbers to mean anything.'],
                ['When to turn it off', 'When you want one fixed intensity regardless of age — usually because you are deliberately running below what the age band would pick.'],
              ],
            },
            {
              id: 'ctl-preset', name: 'Preset', where: 'Intensity', kind: 'select', value: 'Careful',
              rows: [
                ['What it does', 'Sets one fixed intensity for the accounts being enrolled.'],
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
          ['p', "When accounts are allowed to be active. Outside the windows they sit idle; the counts on the Control section show how many are waiting."],
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
            "These four numbers do nothing while Auto-adapt is on, and Auto-adapt is on by default. The engine reads them only when Auto-adapt is off; otherwise the caps come from the preset the account’s age selects. The panel still shows the fields as editable either way.",
          ]],
          ['controls', [
            {
              id: 'ctl-actions-hour', name: 'Actions / hour', where: 'Limits', kind: 'field', value: '5',
              rows: [
                ['What it does', 'Ceiling on every warmup action this account may take in an hour. Also sets the pace: the gap between actions is one hour divided by this number, jittered.'],
                ['Default', '5.'],
                ['Range', '1 to 100.'],
                ['At the minimum', 'One action an hour — about as slow as this module goes without being switched off.'],
                ['At the maximum', '100 an hour is far above every preset, Aggressive included at 8. Nothing in the engine tempers it for you beyond the daily cap and the shared worker limit.'],
              ],
            },
            {
              id: 'ctl-actions-day', name: 'Actions / day', where: 'Limits', kind: 'field', value: '15',
              rows: [
                ['What it does', 'Ceiling on total warmup actions per day for this account. Checked after the hourly cap; once it is spent the account does nothing more that day.'],
                ['Default', '15.'],
                ['Range', '1 to 500.'],
              ],
            },
            {
              id: 'ctl-joins-day', name: 'Joins / day', where: 'Limits', kind: 'field', value: '2',
              rows: [
                ['What it does', 'Caps one action specifically — Joining groups. Nothing else counts against it.'],
                ['Default', '2.'],
                ['Range', '0 to 50.'],
                ['At zero', 'The account never joins anything during warmup, even with the action toggled on.'],
              ],
            },
            {
              id: 'ctl-messages-day', name: 'Saved Messages / day', where: 'Limits', kind: 'field', value: '3',
              rows: [
                ['What it does', 'Caps exactly two actions: Saved-messages notes and Forward to Saved Messages. Both write only to the account’s own Saved Messages — nothing here sends a message to another person or chat.'],
                ['Default', '3.'],
                ['Range', '0 to 50.'],
                ['At zero', 'Those two actions never fire. Every other action is unaffected.'],
              ],
            },
            {
              id: 'ctl-progressive', name: 'Progressive increase', where: 'Limits', kind: 'toggle', on: true,
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
              id: 'ctl-economy', name: 'Economy mode', where: 'Actions', kind: 'toggle', on: true,
              rows: [
                ['What it does', 'Drops every action marked traffic-heavy, whatever the checklist says. Those are the ones that download real media: View videos, Listen to voice messages, GIF search / inline bots, Sticker packs, Story views.'],
                ['Default', 'On.'],
                ['Why', 'Those actions burn real gigabytes, and mobile proxies are billed by traffic.'],
                ['When to turn it off', 'Only when your proxies are not metered and you want the fuller behavioural picture.'],
              ],
            },
            {
              id: 'ctl-action-checklist', name: 'Action checklist', where: 'Actions', kind: 'toggle', on: true,
              rows: [
                ['What it does', 'Twenty individual actions across nine categories, each switched on or off for the accounts being enrolled.'],
                ['Default', 'Reading only. A newly enrolled account has View dialogs, Scroll channel, Mark as read and Search messages on, and the other sixteen off.'],
                ['Three hard gates', 'Reactions, Story views and Joining groups need the account to be at least 3 days old. Economy mode removes the traffic-heavy ones. Gradual profile updates stays off until a template is selected — with nothing to apply it would do nothing every time it ran.'],
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
              ['Gradual profile updates', 'Profile', 'No', 'Needs a template'],
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
          ['controls', [
            {
              id: 'ctl-template', name: 'Profile template', where: 'Template', kind: 'select', value: 'No template',
              rows: [
                ['What it does', 'Chooses the template the Gradual profile updates action re-applies, through the same pipeline and pacing the Profile Templates page uses.'],
                ['Default', 'No template.'],
                ['If you have none', 'The picker is replaced by a link to the Profile Templates page, and the action stays blocked in the checklist.'],
                ['When to set it', 'Only if you want accounts touching their profiles during warmup. It is optional and off by default.'],
              ],
            },
            {
              id: 'ctl-target-channels', name: 'Target channels', where: 'Targets', kind: 'field', value: '@channel_one, @channel_two',
              rows: [
                ['What it does', 'A specific list of channels for these accounts to read and join, comma or newline separated.'],
                ['Default', 'Empty.'],
                ['If left empty', 'The account reads random channels from the pool Channel Parser has discovered. An account with its own list is unaffected by the state of that pool.'],
                ['When to set it', 'When you want accounts building history in a particular niche rather than whatever discovery happens to have found.'],
              ],
            },
            {
              id: 'ctl-own-channels', name: 'Allow reading/joining my own channels', where: 'Targets', kind: 'toggle', on: false,
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
        title: 'Two things you cannot configure past',
        blocks: [
          ['p', "Most of this page is yours to set. Two overrides are not, and both are enforced in the engine rather than left to the form."],
          ['plates', [
            { tone: 'bad', label: 'The resting floor', text: "While an account is inside the Accounts page’s 72-hour lockout, this module drops to its floor no matter what is configured: Careful’s numeric caps, joins and messages forced to zero, and only Reading actions allowed. Aggressive intensity and every action switched on have no effect during that window." },
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
            "Pick the accounts in the Accounts section. Start with a handful rather than the whole pool — only three ever run at once anyway, so a small first group tells you what a large one will do.",
            "Leave Auto-adapt on. It will put fresh accounts on Careful and move them up as they age, which is what you want and means the four numbers under Limits need no attention.",
            "Set the timezone under Schedule to match where the accounts are supposed to be from, and adjust the two default windows if those hours do not suit that region.",
            "Leave the action checklist on its Reading-only default, Economy mode on, and own channels off.",
            "Press Enable. The accounts are supervised from that moment, inside their windows, ramping from 30% of their caps to full over the first week.",
          ]],
          ['p', "Watch the Control section rather than the logs day to day: Resting means the lockout on the Accounts page is still in force, Outside window means the schedule is simply closed, and Active with an intensity beside it means the account is working."],
          ['note', "Turning an account’s warmup off is done from the status list on this page, not from the Accounts page. The Auto-Warmup buttons there control the separate 72-hour lockout, and switching those off does not stop an account being supervised here.",
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
    short: 'Build the target list',
    title: 'Finding Telegram channels by keyword',
    summary: 'Finding channels worth commenting into — the two search modes, the filters that decide what survives, and what the score means.',
    seoTitle: 'Find Telegram channels by keyword: search, filters',
    seoDescription:
      'Find channels worth commenting in: keyword and similar-channel search, filters for members, language and open comments, and how to use them.',
    module: 'channel-parser',
    video: null,
    body: [
      {
        id: 'what-it-is',
        title: 'What this page is',
        blocks: [
          ['p', "Channel Parser searches Telegram for channels you could comment into, checks each candidate against your filters, scores the survivors and lists them. It is a research tool: nothing it finds starts being commented on until you put it in the Neurocommenting channel list yourself."],
          ['p', "It shares its page with Group Parser. A pair of tabs at the top switches between them — Channel parser and Group parser — and each has its own form, its own results and its own history."],
          ['callout', [
            "Searching uses your own accounts, and it uses them heavily: every candidate channel costs several Telegram requests to inspect. An account running a search is reserved and cannot be in the commenting pool at the same time. Run searches when the accounts can spare the calls, not alongside a full commenting run.",
          ]],
        ],
      },
      {
        id: 'map',
        title: 'Map of the page',
        blocks: [
          ['map', [
            { name: 'Parser tabs', holds: 'Channel parser · Group parser. The top-level switch between two different tools sharing one address.' },
            { name: 'Search control', holds: 'The run state, the Search button, and Cancel run while one is going.' },
            { name: 'Mode tabs', holds: 'Keyword search · Similar channels. Two ways of producing candidates, sharing every filter below.' },
            { name: 'The form', holds: 'Keywords and optional endings, accounts, members range, languages, minimum comments on the last post, and how many results to stop at.' },
            { name: 'Progress', holds: 'While a run is going: which chunk it is on, and a live log of what each account is deciding.' },
            { name: 'Results', holds: 'Four tabs — All, Pending, Promoted, Rejected — with Copy Links and Clear above them.' },
          ]],
        ],
      },
      {
        id: 'keyword-search',
        title: 'Keyword search',
        blocks: [
          ['p', "You give it words; it searches Telegram for each one and inspects what comes back. The endings field is a multiplier on that: every keyword is combined with every ending, so five keywords and four endings is twenty searches."],
          ['controls', [
            {
              id: 'ctl-cp-keywords', name: 'Keywords', where: 'Keyword search', kind: 'field', value: 'crypto, trading',
              rows: [
                ['What it does', 'The words searched for. Typed one at a time or pasted as a list.'],
                ['Limit', 'Up to 300. Duplicates are dropped case-insensitively as you add them.'],
                ['How they are sent', 'In batches of ten. That is a hard limit on the search request itself, not a throttle, so a long list is split into chunks and the chunks run one after another.'],
                ['What one keyword really costs', 'More than one search. Telegram’s own search returns only about ten results for a query however many you ask for, so each keyword is also re-queried as several deterministic rewrites of itself to get past that ceiling.'],
              ],
            },
            {
              id: 'ctl-cp-endings', name: 'Endings (optional)', where: 'Keyword search', kind: 'field', value: 'signals, news',
              rows: [
                ['What it does', 'Words appended to each keyword to make the combinations actually searched — crypto plus signals is searched as the single phrase crypto signals.'],
                ['Why', 'Topic plus ending is how Telegram channels are actually named. Searching the bare topic finds far less than searching the names people give channels about it.'],
                ['Generate', 'A button asks the model for a set of endings in a language you pick, up to thirty at a time. It only fills the field — nothing is searched until you press Search.'],
                ['The multiplication', 'Combinations are keywords times endings. The form shows the count and a time estimate before you commit, and asks for confirmation on a long one.'],
              ],
            },
            {
              id: 'ctl-cp-accounts', name: 'Accounts', where: 'The form', kind: 'button', tone: 'plain', value: 'Use all accounts',
              rows: [
                ['What it does', 'Chooses which accounts do the searching. Either all healthy ones, or a selection.'],
                ['How they are used', 'The keyword list is split across up to a few accounts at once, each working its own share.'],
                ['Reserved while running', 'An account in a running search cannot be added to the commenting pool until the task finishes.'],
                ['Pacing', 'Every single Telegram request is paced and counted against that account’s budget, including the ones spent inspecting a candidate. There is also a per-task ceiling, so one long keyword list cannot spend an account’s whole hourly allowance by itself.'],
              ],
            },
            {
              id: 'ctl-cp-max-results', name: 'Max results', where: 'The form', kind: 'button', tone: 'plain', value: '500',
              rows: [
                ['What it does', 'Stops the run once this many channels have been accepted.'],
                ['Default', '500. Unlimited is offered, and is capped at 5000 by the engine regardless.'],
                ['Custom values', 'Anything from 1 to 5000.'],
              ],
            },
          ]],
          ['p', "A run can be cancelled while it goes. Cancelling stops the chunks that have not started; everything already found stays."],
        ],
      },
      {
        id: 'similar',
        title: 'Similar channels',
        blocks: [
          ['p', "The other mode. Instead of words you give it channels, and it asks Telegram what is similar to them. Every filter below applies the same way."],
          ['controls', [
            {
              id: 'ctl-cp-sources', name: 'Source channels', where: 'Similar channels', kind: 'field', value: '@somechannel',
              rows: [
                ['What it does', 'The channels to find neighbours of. One per line, as @username, a t.me link or a bare name.'],
                ['What is refused', 'Private invite links. They name no public channel, so there is nothing to ask about.'],
                ['When this beats keywords', 'When you already know two or three channels your audience reads. It skips the guessing about names entirely.'],
              ],
            },
            {
              id: 'ctl-cp-depth', name: 'Depth', where: 'Similar channels', kind: 'select', value: '1',
              rows: [
                ['Depth 1', 'Direct recommendations for each source channel only.'],
                ['Depth 2', 'Also searches channels similar to what depth 1 found. More results, longer runtime, more Telegram calls.'],
                ['If it finds nothing', 'A similar-channels run reporting zero is usually telling the truth about a pool you have already worked. Every candidate it surfaces that you previously added or rejected is skipped as already reviewed, and on a mature list that is most of them. The run says so now: the log names each skipped candidate with its reason, and the finished task carries the breakdown, so a zero is distinguishable from a search that did nothing.'],
                ['What bounds depth 2', 'Only the highest-scoring thirty of the accepted depth-1 channels are recursed into. Without that cap a fifty-source run could turn into hundreds of extra requests.'],
                ['Pacing', 'Depth 2 is paced more slowly than depth 1, because it stacks a second wave of requests onto the same account session inside one run.'],
              ],
            },
          ]],
        ],
      },
      {
        id: 'filters',
        title: 'The filters',
        blocks: [
          ['p', "Every candidate goes through the same pipeline in the same order, and the first failure ends it. Three of the steps are yours to set; three are not."],
          ['controls', [
            {
              id: 'ctl-cp-members', name: 'Members range', where: 'The form', kind: 'field', value: '5 000 — 10 000 000',
              rows: [
                ['What it does', 'Rejects a channel whose member count is outside the range.'],
                ['Default', 'From 5,000, with no meaningful upper limit.'],
                ['Accepted range', 'The floor cannot go below 500 and the ceiling not above 10,000,000.'],
                ['Which way to move it', 'Down. A smaller channel is a lot easier to be visible in than a large one, and the default floor already excludes most of them.'],
              ],
            },
            {
              id: 'ctl-cp-languages', name: 'Languages', where: 'The form', kind: 'badge', tone: 'plain', value: 'English',
              rows: [
                ['What it does', 'Rejects a channel whose detected language is not among the ones ticked.'],
                ['The ten offered', 'English, Russian, Ukrainian, German, Spanish, French, Portuguese, Italian, Polish, Turkish.'],
                ['How the language is decided', 'From the text of the last three posts, run through automatic detection.'],
                ['A channel it cannot read', 'Comes back as unknown, which never matches anything ticked, so a channel of images with no captions is rejected here.'],
                ['At least one', 'The form refuses to search with none selected.'],
              ],
            },
            {
              id: 'ctl-cp-min-comments', name: 'Min comments on last post', where: 'The form', kind: 'field', value: '5',
              rows: [
                ['What it does', 'Rejects a channel whose most recent post has fewer comments than this.'],
                ['Default', '5.'],
                ['Only the last post', 'One post is checked, not an average — one lookup instead of five. A channel that was busy last month and quiet this week fails here, which is the intent.'],
                ['Why it is the filter that matters', 'A comment nobody will see is worth nothing. This is the number that decides whether a channel is a place to be read.'],
              ],
            },
          ]],
          ['p', "Three more checks run that the form does not show, and they reject more than the ones it does:"],
          ['table', {
            head: ['Check', 'What it rejects'],
            rows: [
              ['Public channel', 'Anything without a public username. There is nothing to point an account at otherwise.'],
              ['Comments open', 'Any channel with no linked discussion group. Measured across 2,841 real candidates on this deployment, this one alone rejects 66 per cent of everything considered — by far the most destructive step in the pipeline, and the reason a search that found plenty returns little.'],
              ['Posts per week', 'A channel with fewer than five posts in the last seven days. Not adjustable from the panel.'],
            ],
          }],
          ['p', 'The whole funnel, measured rather than estimated. Across 2,841 candidates this deployment has actually put through the filters, 54 survived - 1.9 per cent. Where the other 2,787 went, each counted against the first filter that rejected it:'],
          ['table', {
            head: ['Rejected by', 'Share of all candidates'],
            rows: [
              ['Comments open', '66.1 per cent'],
              ['Members out of range', '15.1 per cent'],
              ['Comments on last post too low', '9.5 per cent'],
              ['Posts per week too low', '5.6 per cent'],
              ['Language mismatch', '1.8 per cent'],
              ['Passed everything', '1.9 per cent'],
            ],
          }],
          ['callout', [
            'Two readings of that table are both correct and worth holding together. A 1.9 per cent survival rate is not the parser working badly - it is what an honest set of filters does to an open recommendation feed. But it also means the single most effective thing you could change is the comments-open requirement, and that one is not adjustable: a channel with no discussion group has nowhere to put a comment.',
          ]],
        ],
      },
      {
        id: 'results',
        title: 'Reading the results',
        blocks: [
          ['p', "One row per surviving channel: username, title, members, language, comments on the last post, and a score. The score bands are coloured the same way in both parsers, so a 72 never reads as good on one and neutral on the other."],
          ['controls', [
            {
              id: 'ctl-cp-score', name: 'Score', where: 'Results', kind: 'tile', tone: 'ok', value: '72',
              rows: [
                ['What it is', 'A number from 0 to 100 built from four things, with comment activity weighted hardest.'],
                ['How it is built', 'Up to 40 points for size, on a logarithmic scale — 5,000 members is worth about 30, and past roughly half a million it stops paying. Up to 40 for comments on the last post, reaching full marks at ten comments. Up to 10 for posting frequency. Ten more for matching a language you asked for.'],
                ['What that means in practice', 'A modest channel with a busy comment section outscores a huge one nobody talks in. That is deliberate.'],
                ['Colour bands', 'Under 30 reads as poor, 30 to 60 as middling, above 60 as good.'],
              ],
            },
            {
              id: 'ctl-cp-copy', name: 'Copy Links', where: 'Results', kind: 'button', tone: 'plain', value: 'Copy Links',
              rows: [
                ['What it does', 'Copies the links of the rows on the current page to the clipboard, one per line.'],
                ['What it is for', 'Pasting straight into the Add channel(s) box on the Neurocommenting page, which accepts exactly this format.'],
                ['The current page only', 'Not the whole result set. Page through and copy each page.'],
              ],
            },
            {
              id: 'ctl-cp-clear', name: 'Clear', where: 'Results', kind: 'button', tone: 'bad', value: 'Clear',
              rows: [
                ['What it does', 'Deletes the stored results.'],
                ['What comes back', 'A later search can surface the same channels again — nothing here records that you have already seen and dismissed one.'],
              ],
            },
          ]],
          ['callout', [
            "The four result tabs read as a workflow that is not there. All, Pending, Promoted and Rejected are real statuses the engine keeps, and promoting a channel would add it to the monitored list in one step while rejecting it would stop it resurfacing on a re-scan — but this table offers no way to do either. Every row stays Pending forever, and the only route into the commenting list is Copy Links and a paste into the Neurocommenting page, which does not change the row's status. The Group Parser tab beside it does have the two buttons.",
          ]],
        ],
      },
      {
        id: 'first-run',
        title: 'First run',
        blocks: [
          ['steps', [
            "Start with three or four keywords and no endings. It costs little and tells you whether the filters are anywhere near right before you spend a long run on them.",
            "Leave the members range alone at first; lower the floor rather than raising the ceiling if too little comes back.",
            "Set Min comments on last post to what you actually need. Five is the default and it is not a low bar — a channel that clears it has a live comment section.",
            "Read the run rather than waiting for it. The live log names each candidate and why it was rejected - in both modes now; until recently the similar-channels log named the sources it worked through but not the candidates they produced - and it is usually obvious within a minute which filter is doing the damage.",
            "Once the filters look right, add endings and re-run. That is where the volume comes from.",
            "Copy the links of the rows worth having and paste them into Add channel(s) on the Neurocommenting page.",
          ]],
          ['note', "Very little coming back is the normal first experience, and it is usually not the keywords. Roughly three quarters of real candidates are rejected for having no comment section at all, before any filter you set is even reached.",
          ],
          ['linkout', { href: '/guides/neurocommenting', label: 'Next: point the commenting engine at them' }],
        ],
      },
    ],
  },
  {
    slug: 'group-parser',
    url: 'group-parser',
    group: 'module',
    short: 'Rooms worth walking into',
    title: 'Finding active Telegram groups',
    summary: 'Finding groups that are actually alive and that you can actually post in — the filters, the score, and where a promoted group goes.',
    seoTitle: 'Find active Telegram groups: senders, join checks',
    seoDescription:
      'Member counts lie. Find groups that are actually alive using unique senders, and check you can join and post before adding one to the pool.',
    module: 'group-parser',
    video: null,
    body: [
      {
        id: 'what-it-is',
        title: 'What this page is',
        blocks: [
          ['p', "Group Parser finds public groups — the rooms where people talk to each other, rather than channels where one account broadcasts. It lives on the same page as Channel Parser, behind the second of the two tabs at the top."],
          ['p', "It looks similar to its neighbour and behaves differently in every place that matters, because what makes a group worth having is not what makes a channel worth having."],
          ['callout', [
            "The channel pipeline's most destructive filter simply does not exist here. A channel is rejected outright if it has no linked discussion group to comment in — measured on real candidates, that alone removes about three quarters of them. A group is the discussion surface, so there is nothing to link to and nothing to reject for. Expect a group search to return far more than a channel search on the same effort.",
          ]],
        ],
      },
      {
        id: 'map',
        title: 'Map of the page',
        blocks: [
          ['map', [
            { name: 'Parser tabs', holds: 'Channel parser · Group parser, at the very top. This guide is the second one.' },
            { name: 'Search', holds: 'Keywords and endings, accounts, members range, languages, the two activity floors, the two access switches, and how many results to stop at.' },
            { name: 'Progress', holds: 'While a run is going: the chunk it is on, and the live log of what each account decided about each candidate.' },
            { name: 'Results', holds: 'The table, with Export CSV above it and status tabs across it — and, unlike the channel table, a Promote and a Reject on every row.' },
          ]],
        ],
      },
      {
        id: 'how-it-searches',
        title: 'How it finds candidates',
        blocks: [
          ['p', "Two different Telegram searches are run for every keyword and their results are merged. They were both kept because measurement said to: on a live test the two found different groups and the overlap between them was zero."],
          ['table', {
            head: ['Search', 'What it matches'],
            rows: [
              ['By name', 'The group’s own name. The same call the channel parser makes — Telegram returns channels and groups in one list and only a flag separates them.'],
              ['By message text', 'What people are actually saying, returning the groups those messages live in. A group only surfaces if it has a recent on-topic message, so this applies an activity test at the source rather than after four requests of inspection.'],
            ],
          }],
          ['p', "The second one also pages, which is where the volume comes from — the name search has a hard ceiling of roughly ten results per query however many you ask for. Three pages are taken per keyword: enough for several times that ceiling, while staying a small, bounded number of requests."],
          ['p', "Keywords, endings, account selection and the maximum-results picker work exactly as they do on the channel tab, including the ten-per-request batching and the confirmation before a long run."],
        ],
      },
      {
        id: 'filters',
        title: 'The filters',
        blocks: [
          ['p', "Members and languages mean the same thing here as on the channel tab. Everything else is different, because a group has no posts and no comments to count."],
          ['controls', [
            {
              id: 'ctl-gp-messages', name: 'Min messages (7d)', where: 'Search → Activity', kind: 'field', value: '20',
              rows: [
                ['What it does', 'Rejects a group with fewer messages than this in the last seven days.'],
                ['Default', '20.'],
                ['How it is measured', 'From one pull of the last fifty messages. A group busy enough to fill fifty messages inside a week is measured against that sample rather than its whole history.'],
                ['Why it is the weaker of the two', 'Message count alone cannot tell a community from two bots posting all day. That is what the next one is for.'],
              ],
            },
            {
              id: 'ctl-gp-senders', name: 'Min unique senders', where: 'Search → Activity', kind: 'field', tone: 'ok', value: '5',
              rows: [
                ['What it does', 'Rejects a group unless this many distinct people sent at least one message in the sample.'],
                ['Default', '5. Deliberately low — it is there to exclude the obvious dead and bot-run cases, not to demand a large sample.'],
                ['The number that matters', 'Two hundred messages from two accounts is not a community. This is the only filter that separates a real conversation from a feed, and it has no equivalent at all in the channel pipeline.'],
                ['Which one to raise', 'This one. Raising the message floor finds busier spam; raising the sender floor finds more people.'],
              ],
            },
            {
              id: 'ctl-gp-open-join', name: 'Only groups anyone can join', where: 'Search → Access', kind: 'toggle', on: true,
              rows: [
                ['What it does', 'Skips groups where joining has to be approved by an admin.'],
                ['Default', 'On.'],
                ['Why on', 'Joinable means joinable on demand. A join request may simply never be granted, and an account waiting on one is an account doing nothing.'],
                ['Checked how', 'From the group itself, not guessed from anything else.'],
              ],
            },
            {
              id: 'ctl-gp-can-post', name: 'Only groups members can post in', where: 'Search → Access', kind: 'toggle', on: true,
              rows: [
                ['What it does', 'Skips read-only groups where new members cannot send messages.'],
                ['Default', 'On.'],
                ['Why on', 'A group nobody may post in cannot be commented in, whatever else is true about it.'],
              ],
            },
          ]],
          ['p', "Two more checks run before any of those: the group has to be public — with a username to point an account at — and it has to actually be a group rather than a broadcast channel that arrived in the same result list."],
        ],
      },
      {
        id: 'results',
        title: 'Reading a row',
        blocks: [
          ['p', "The table carries more than the channel one, because more of what decides a group is visible up front: members, messages in the last seven days, distinct senders, slow mode, how joining works, language, where the search found it, and a score."],
          ['controls', [
            {
              id: 'ctl-gp-score', name: 'Score', where: 'Results', kind: 'tile', tone: 'ok', value: '68',
              rows: [
                ['What it is', 'Zero to a hundred, weighted toward conversation rather than size.'],
                ['How it is built', 'Up to 25 points for members, on a logarithmic scale — a thousand members is worth about 15 and a million barely more than 25. Up to 35 for messages in the week, full marks at around 140. Up to 25 for distinct senders, full marks at about 17 people. Fifteen more for matching a language you asked for.'],
                ['The penalty', 'Ten points off for slow mode of a minute or longer, because that throttles the exact thing an account would be there to do.'],
                ['Different from the channel score on purpose', 'That one can hand 40 of its 100 points to raw member count. Here members cap at 25 and the two activity terms carry 60 between them — a big silent group is worth less than a smaller talkative one.'],
              ],
            },
            {
              id: 'ctl-gp-slowmode', name: 'Slow mode', where: 'Results → a row', kind: 'badge', tone: 'warn', value: '30s',
              rows: [
                ['What it shows', 'How long a member has to wait between messages. Off means no cooldown.'],
                ['Why it is on the row', 'It is the difference between a group an account can take part in and one where it gets a turn every few minutes. Anything from a minute up also costs the group ten points.'],
              ],
            },
            {
              id: 'ctl-gp-source', name: 'Source', where: 'Results → a row', kind: 'badge', tone: 'plain', value: 'search global',
              rows: [
                ['What it shows', 'Which of the two searches surfaced this group — its name, or something said in it.'],
                ['Why it is worth a glance', 'A group found by message text had a recent on-topic message in it. A group found by name only matched a name.'],
              ],
            },
            {
              id: 'ctl-gp-promote', name: 'Promote', where: 'Results → a row', kind: 'button', tone: 'ok', value: 'Promote',
              rows: [
                ['What it does', 'Marks the group accepted and adds it to NeuroDialogs’ promoted-groups list.'],
                ['Where it actually goes', 'Into the DM module, not the commenting one. Accounts answering private messages may then mention it when it naturally fits, rate-limited to at most one mention every few messages per conversation.'],
                ['When it takes effect', 'The next message. That list is read fresh on every generation, so there is nothing to restart and no cache to clear.'],
                ['If you wanted it for commenting', 'That is not what this button does. The commenting engine watches channels, and a standalone group is not one.'],
              ],
            },
            {
              id: 'ctl-gp-reject', name: 'Reject', where: 'Results → a row', kind: 'button', tone: 'bad', value: 'Reject',
              rows: [
                ['What it does', 'Marks the group rejected so it does not resurface on a later scan.'],
                ['Why it is worth using', 'It is the only thing that remembers a decision. Without it the same unsuitable group comes back on every re-run of the same keywords.'],
              ],
            },
            {
              id: 'ctl-gp-export', name: 'Export CSV', where: 'Results', kind: 'button', tone: 'plain', value: 'Export CSV',
              rows: [
                ['What it does', 'Exports every row matching the current tab and filters — not just the page on screen, unlike the comment history on the Neurocommenting page.'],
              ],
            },
          ]],
        ],
      },
      {
        id: 'first-run',
        title: 'First run',
        blocks: [
          ['steps', [
            "Search a few keywords with both access switches left on. Everything they exclude is something an account could not have used anyway.",
            "Sort your attention by senders rather than by members. A group with 800 members and 30 people talking is worth more than one with 40,000 and four.",
            "Look at slow mode before committing. A minute or more between messages changes what an account can do there, and the score already docks it.",
            "Reject the ones that are wrong, rather than ignoring them. It is the only way they stop coming back.",
            "Promote the ones worth having — remembering that this hands them to NeuroDialogs to mention in conversation, not to the commenting engine.",
          ]],
          ['note', "Searching shares its account budget with the channel tab. A channel search and a group search running at once cannot together exceed the same owner-wide worker cap, so running both in parallel does not get through the work any faster — it just splits the same accounts between them.",
          ],
          ['linkout', { href: '/guides/neurodialogs', label: 'Next: answer the DMs those groups bring in' }],
        ],
      },
    ],
  },
  {
    slug: 'neurocommenting',
    url: 'neurocommenting',
    group: 'module',
    short: 'Empty list to live comments',
    title: 'Automating Telegram comments',
    summary: 'The page that runs the engine — every control on it, what it does once the engine reads it, and the order to touch them in.',
    seoTitle: 'Automate Telegram comments with AI: full setup',
    seoDescription:
      'Set up AI comments on Telegram channels: build a pool, assign channels, set delays that look human, and write a persona that reads like one.',
    module: 'neurocommenting',
    video: null,
    body: [
      {
        id: 'video-guide',
        title: 'Watch it first',
        blocks: [
          ['p', "The whole setup, start to first posted comment, in one run-through. The written sections below cover the same ground in more detail and are the reference to come back to; this is the fastest way to see the shape of it."],
          /* ── PUT THE YOUTUBE ID IN `id` BELOW ──
             Just the id, not the URL: for
             https://www.youtube.com/watch?v=dQw4w9WgXcQ that is
             "dQw4w9WgXcQ". While it is null the block renders the poster
             with "Video coming soon" and stays inert, which is why it is
             safe to ship before the recording exists.

             `poster` is a file in this repo on purpose — see LiteVideo in
             shared.jsx. Do not point it at i.ytimg.com. */
          ['video', {
            id: 'r6n9zkgLmtU',
            title: 'Setting up Neurocommenting',
            poster: '/public/video/neurocommenting-guide.jpg',
            caption: 'Full walkthrough — pool, channels, delays, persona, first comment.',
          }],
        ],
      },
      {
        id: 'what-it-is',
        title: 'What this page is',
        blocks: [
          ['p', "Neurocommenting is the module that actually posts. Everything else feeds it: accounts come from Account Manager, targets from the two parsers, a face from Profile Templates. This page is where the engine is started, and where the behaviour of every comment it writes is set."],
          ['p', "It is one page with nine regions and a jump-nav across the top in this order. Nothing here is a separate screen — the dialogs are the only things that open on top."],
          ['callout', [
            "Start is not a switch that stays on. The engine caps a single session at ten hours by default: at the top of the round where that is reached it stops itself cleanly, exactly as if you had pressed Stop, and it does not come back on its own — not on the next round, and not when the service restarts. Nothing in the panel says this, so the honest expectation is that a long run ends by itself and you press Start again.",
          ]],
        ],
      },
      {
        id: 'map',
        title: 'Map of the page',
        blocks: [
          ['map', [
            { name: 'Control', holds: 'The run state and uptime, the Start/Stop button, the Warmup switch, Delay settings, and the engine log.' },
            { name: 'Pool', holds: 'Two columns of accounts — available and in the pool — the three assignment buttons, the limit controls, and the per-account list of which channels each account owns.' },
            { name: 'Stats', holds: 'What the pool has produced: successful, failed and total.' },
            { name: 'Comments', holds: 'Every comment that went out, filterable, with the full text and the post it answered behind each row.' },
            { name: 'Channels', holds: 'The monitored channel list — what the engine watches — plus the presets that save a list and reload it later.' },
            { name: 'Blacklist', holds: 'Account-and-channel pairs the engine has taken out of circulation on its own, grouped by reason, with Prune unresolvable and Clear blacklist above them.' },
            { name: 'Skipped', holds: 'Channels the model almost never writes about, what each has produced, and a way to take them out of the pool.' },
            { name: 'Model', holds: 'Which of the five models writes your comments, what each costs relative to the others, and what our own safety measurements found.' },
            { name: 'Persona', holds: 'The prompt presets, which one is active, and the sensitive-content filter.' },
          ]],
        ],
      },
      {
        id: 'control',
        title: 'Control',
        blocks: [
          ['p', "Four things sit here: the run state with its uptime, the button that starts and stops the engine, one switch, and the delay window every comment waits out. The engine log is underneath, collapsed."],
          ['controls', [
            {
              id: 'ctl-start', name: 'Start', where: 'Control', kind: 'button', value: 'Start',
              rows: [
                ['What it does', 'Builds your account pool, connects every active account, and begins polling the monitored channels. A round runs every poll interval — 60 seconds by default — and each round re-reads the account pool and the channel list from the database.'],
                ['Before it starts', 'A preflight dialog opens if accounts, channels or an active persona are missing, listing which of the three failed and offering Start anyway. A check whose data has not loaded yet counts as passing, so a slow page never blocks the button.'],
                ['What can refuse it', 'The active persona is assembled into a system prompt at start time. A persona that cannot be assembled fails the start outright, rather than failing quietly at the first comment.'],
                ['Session cap', 'Ten hours by default. The check runs at the top of a round, never mid-send, and the stop is the clean one — the running flag is cleared and the pool disconnected, so the engine stays stopped until someone presses Start again.'],
                ['Restarting for a change', 'Almost never needed. Accounts, the channel list, the delay window and the Warmup switch are all re-read every round. The persona is the exception — it is read once at start and cached.'],
              ],
            },
            {
              id: 'ctl-stop', name: 'Stop', where: 'Control', kind: 'button', tone: 'bad', value: 'Stop',
              rows: [
                ['What it does', 'Ends the session and disconnects the pool. Comments still waiting out their delay are cancelled.'],
                ['What happens to a cancelled comment', 'It is not lost. The post goes back on the pending queue carrying its original catch time, and the rate-limit slot it was holding is released — so a later session picks it up in its real place in the order rather than as something that just happened.'],
                ['Never gated', 'Stop works whatever the subscription says. Only Start is gated.'],
              ],
            },
            {
              id: 'ctl-warmup', name: 'Warmup', where: 'Control, beside Start', kind: 'toggle', on: false,
              rows: [
                ['What it does', 'Ramps an account’s hourly and daily comment caps up gradually instead of letting a fresh account post at the full rate from its first hour.'],
                ['Default', 'Off. Without it every account posts at the full configured rate immediately.'],
                ['The ramp', 'Fourteen days, counted from when the account was added, moving linearly from 1 comment an hour and 3 a day up to the engine’s configured ceiling. Never below 1, never above the ceiling, and an account already older than fourteen days simply sits at the ceiling.'],
                ['Not the same warmup', 'Three separate things carry this name. This switch is the rate ramp. The Accounts page’s Auto-Warmup is a per-account 72-hour lockout with its own 23-day cap schedule. Active Warmup is a whole module that has accounts read and react. All three are off by default and switched on separately.'],
                ['Takes effect', 'Next poll round. No restart.'],
              ],
            },
            {
              id: 'ctl-delay', name: 'Delay before commenting', where: 'Control → Delay settings', kind: 'field', value: '480',
              rows: [
                ['What it does', 'The window a comment waits in before it is written. Once a post is caught and an account reserved, the engine picks a delay uniformly at random between Min and Max and sleeps that long.'],
                ['Default', '480 to 1500 seconds — 8 to 25 minutes.'],
                ['Presets', 'Three buttons fill both fields: Min (60-180s), Recommended (480-1500s), Max (1800-3600s). They only fill the fields — Save is what applies them.'],
                ['Validation', 'Both numbers must be above zero, and Min must be below Max. Save stays disabled and the form says so while they are not.'],
                ['What the wait costs', 'Nothing. The model is not called and Telegram is not touched until the delay is over, so a comment abandoned mid-wait costs nothing at all.'],
                ['At the edges', 'Twenty-five minutes is long enough for conditions to change. Right before sending, the account is re-checked — cooldown, quiet hours, a manual pause, a floodwait from another post landing first — and if it is no longer usable the post goes back on the queue with its original timestamp instead of being sent into the changed condition.'],
                ['Takes effect', 'Next poll round. No restart.'],
              ],
            },
            {
              id: 'ctl-logs', name: 'Engine logs', where: 'Control', kind: 'button', tone: 'plain', value: 'Engine logs',
              rows: [
                ['What it does', 'Streams the engine’s own log lines live while the card is open, with a dot showing whether the stream is connected.'],
                ['Scope', 'Your engine only. Every line is tagged with its owner before it reaches the stream.'],
                ['Clearing', 'The Clear button empties the view. Pressing Start empties it too, so a new run never reads as a continuation of the last one.'],
                ['Only while open', 'The connection opens when you expand the card and closes when you collapse it. Lines emitted while it was shut are not replayed.'],
              ],
            },
          ]],
          ['p', "The uptime counter beside the state runs from the moment the session started. The bar under it is scaled to twelve hours — longer than the ten-hour session cap — so on the default configuration it fills to about five-sixths and the session ends there."],
        ],
      },
      {
        id: 'pool',
        title: 'The commenting pool',
        blocks: [
          ['p', "The pool is the subset of your accounts that neurocommenting may use. It is not the same thing as your account list: an account can be healthy, connected and completely idle simply because it was never put in here."],
          ['p', "Two columns — Available accounts on the left, In commenting pool on the right — an arrow on each row to move one across, and checkboxes with a bulk arrow to move many. Underneath sits the assignment layer, which decides which pooled account handles which channel."],
          ['controls', [
            {
              id: 'ctl-pool-add', name: 'Add to pool', where: 'Pool → Available accounts', kind: 'button', value: 'Add to pool',
              rows: [
                ['What it does', 'Moves the account into the commenting pool and claims it for this module.'],
                ['One module at a time', 'An account may be driven by one behavioural module only. One already held by NeuroDialogs, Mass Reactions or Active Warmup is refused and named in the message, and the rest of the batch still goes through — a refusal never fails the whole request.'],
                ['Also refused', 'An account currently reserved by a running discovery search, and one still inside the Accounts page’s 72-hour resting window. Both come back as a reason rather than an error, and both clear on their own.'],
                ['Removing releases it', 'Taking an account out of the pool frees it for another module immediately.'],
                ['Unhealthy accounts', 'An account that goes banned or dead-session while pooled is pulled out automatically and reported, rather than sitting there posting into nothing.'],
              ],
            },
            {
              id: 'ctl-auto-assign', name: 'Auto-assign channels', where: 'Pool', kind: 'button', value: 'Auto-assign channels',
              rows: [
                ['What it does', 'Deals the whole monitored-channel list round-robin across the accounts currently in the pool, replacing any assignment that existed before.'],
                ['How it divides', 'Evenly, with the remainder spread one extra to the first accounts in the list — 62 channels across 30 accounts gives two accounts three each and the rest two.'],
                ['Why assign at all', 'An assigned account is the predictable path: when a post appears on a channel, its assigned account is used directly, with no scan of the pool. Everything else is fallback.'],
                ['Refused when', 'The pool is empty, or no channels are configured. Both say which.'],
              ],
            },
            {
              id: 'ctl-shuffle', name: 'Shuffle channels', where: 'Pool', kind: 'button', tone: 'plain', value: 'Shuffle channels',
              rows: [
                ['What it does', 'Re-points the channels that are already assigned so every account ends up with a completely different set from the one it had, keeping the number each account holds the same.'],
                ['Not the same as auto-assign', 'Auto-assign deals the full monitored list from scratch. Shuffle only touches what is already assigned, and guarantees no account keeps any of its previous channels.'],
                ['When it refuses', 'When no such rearrangement exists: one account holding more than half of all assigned channels, fewer than two accounts with assignments, or nothing assigned yet. The reason comes back verbatim.'],
              ],
            },
            {
              id: 'ctl-clear-assignments', name: 'Clear assignments', where: 'Pool', kind: 'button', tone: 'plain', value: 'Clear assignments',
              rows: [
                ['What it does', 'Drops every channel-to-account assignment.'],
                ['What happens then', 'Posting does not stop. Every channel falls back to picking from the pool by least-recently-used, so the work still spreads — it just stops being predictable per channel.'],
              ],
            },
            {
              id: 'ctl-set-limit', name: 'Set limit', where: 'Pool, right of the assignment buttons', kind: 'field', value: '10',
              rows: [
                ['What it does', 'Applies one comment limit to every account currently in the pool, in a single call.'],
                ['What the limit is', 'A lifetime cap, not a daily one. The counter never falls on its own — an account that reaches its limit is paused automatically, marked limit reached, and stays that way.'],
                ['Default', 'None. An account has no limit at all until one is set, here or on a single account.'],
                ['How it applies', 'Only on Enter or the tick button, never on losing focus — it touches every pooled account at once, so an incidental click should not fire it.'],
                ['Clearing it', 'The Clear limits button beside it removes the cap from every pooled account. An account paused for hitting a limit it is now clear of resumes by itself; one you paused by hand is left alone.'],
              ],
            },
            {
              id: 'ctl-reset-counts', name: 'Reset counts', where: 'Pool', kind: 'button', tone: 'warn', value: 'Reset counts',
              rows: [
                ['What it does', 'Sets the selected accounts’ comment counters back to zero and resumes any of them paused for hitting their limit. Asks first.'],
                ['Why it exists', 'Because the limit is a lifetime cap. Resuming a capped account on its own buys exactly one more comment before it hits the same ceiling again, since the count never went down. Clearing the counter is what makes a recurring limit workable.'],
                ['Selection, not the pool', 'It acts on whatever is ticked in either column. An account pulled out of the pool for hitting its limit sits in Available accounts, and this reaches it there without re-adding it first.'],
                ['What survives', 'Comment history. The rows are not deleted — a floor timestamp moves instead — so cost tracking and statistics are unaffected.'],
              ],
            },
            {
              id: 'ctl-pause', name: 'Pause', where: 'Pool → assignment list', kind: 'button', tone: 'warn', value: 'Pause',
              rows: [
                ['What it does', 'Takes this one account out of posting until you resume it. It is excluded starting from the next poll round.'],
                ['Why it is not a status', 'Nothing automated can move an account into or out of a manual pause — not floodwait handling, not the health checker clearing an account back to active, not cooldown expiry. That is the difference between this and parking an account in the Accounts page’s Danger zone.'],
                ['Resume', 'Only ever un-pauses. It refuses on an account that is not paused, so a banned or disabled account cannot be revived by pressing it.'],
              ],
            },
          ]],
          ['p', "Under the buttons, one row per account that holds channels: how many comments it landed and how many failed, whether it is paused, and the channels it owns behind a fold."],
          ['callout', [
            "Assignment is a preference, not a rule. If the assigned account is in cooldown, in quiet hours, paused, at its cap or blocked from that channel, the post is not skipped — it falls back to the rest of the pool, ordered least-recently-used, with accounts that have already succeeded on that channel first and accounts that failed to resolve it last. Only when the pool itself is empty does the fallback widen to every active account.",
          ]],
        ],
      },
      {
        id: 'model',
        title: 'Choosing the model',
        blocks: [
          ['p', "Five models can write your comments, and the choice is yours per module - Neurocommenting and NeuroDialogs are set separately. What follows is not a feature table. Every number here comes from our own probe against the live providers: 34 sensitive posts, each put to each model three times, 102 calls per model, through the real prompt path a comment actually takes. None of it comes from a vendor's description of its own model."],
          ['callout', [
            'Read a clean result as a ceiling, not a guarantee. A model that declined all 102 has a leak rate somewhere under about 3 per cent - that is what 102 clean draws support. It does not mean zero, and one of the five leaked exactly once. What 102 draws can settle is a difference of the size we found: 22.5 per cent against under 3 per cent is not a matter of luck.',
          ]],
          ['p', 'Leaked, throughout, means one thing: the model wrote a publishable comment under a post about death, war, crime, a disaster, a memorial or an election, with the sensitive-content rule in its prompt telling it not to.'],
          ['controls', [
            {
              id: 'mdl-grok', name: 'Grok 4.3', where: 'xAI - the default', kind: 'button', value: 'Grok 4.3',
              rows: [
                ['Why it is the default', 'It declined all 102 sensitive posts, and it is what every account on this deployment now uses. Chosen on that measurement, not on price - it is not the cheapest slot.'],
                ['What you give up', "Length. It writes the shortest comments of the five: a median of 89 characters against Claude's 137. If you want remarks with some substance, that is the trade."],
                ['One quirk', 'It stayed silent on an ordinary post it should have answered. Expect the occasional paid call that produces nothing.'],
                ['Price', '8.3x the old default on input, 4.2x on output.'],
              ],
            },
            {
              id: 'mdl-openai', name: 'GPT-4o mini', where: 'OpenAI - cheapest, and why we left it', kind: 'button', value: 'GPT-4o mini',
              rows: [
                ['The number', 'It wrote a comment on 23 of 102 sensitive posts. Not one in a hundred - closer to one in four.'],
                ['Worse than the average suggests', 'Eight distinct posts got through, and six of those it commented on every single time it was asked. That is not bad luck on a borderline case; it is a blind spot you can reproduce on demand.'],
                ['What it commented on', 'Mostly elections and politics - an opinion poll, a candidate withdrawing, an impeachment motion, a mayoral runoff. Also a court case and a four-hour air-raid alarm.'],
                ['So why is it still offered', 'It is genuinely the cheapest, and for a pool where nothing sensitive is ever posted the difference does not arise. If you cannot say that of your channels, the saving is not what you are choosing.'],
                ['Price', 'The baseline the other four are measured against.'],
              ],
            },
            {
              id: 'mdl-gemini', name: 'Gemini 3.5 Flash-Lite', where: 'Google - the cheapest one that held', kind: 'button', value: 'Gemini 3.5 Flash-Lite',
              rows: [
                ['Result', 'Declined all 102. Leak rate under about 3 per cent.'],
                ['Why you would pick it', "The cheapest way off GPT-4o mini: 2x on input and 4.2x on output, against Grok's 8.3x input."],
                ['An old caveat, now gone', 'An earlier run of ours hit a free-tier rate limit on this account and the result was unusable. The account is on a paid tier now and the full run completed with no throttling.'],
              ],
            },
            {
              id: 'mdl-claude', name: 'Claude Haiku 4.5', where: 'Anthropic - the longest comments', kind: 'button', value: 'Claude Haiku 4.5',
              rows: [
                ['Result', 'Wrote a comment on 1 of 102 - the only leak any model but GPT-4o mini produced, and on the mildest post in the set: a mayoral debate about transport reform.'],
                ['Why you would pick it', "It writes the longest comments of the five, a median of 137 characters against Grok's 89. That is the reason to pay more than Grok, and the only one."],
                ['Price', '6.7x on input, 8.3x on output. The dearest of the five per token.'],
              ],
            },
            {
              id: 'mdl-kimi', name: 'Kimi K2.6', where: 'Moonshot - read the price twice', kind: 'button', value: 'Kimi K2.6',
              rows: [
                ['Result', 'Declined all 102.'],
                ['The catch', 'It reasons before it answers, and that reasoning is billed as output: a measured 1206 output tokens per comment, where the others spend about 32. Its per-token rate says 6.7x; the actual bill is around 70x the old default per comment.'],
                ['Also slow', '45 to 50 seconds per call, against one or two for the rest.'],
                ['Who it is for', 'Someone who specifically wants this model and accepts both. The card in the panel prints the per-comment multiple next to the rates for exactly this reason.'],
              ],
            },
          ]],
          ['note', 'The model is not your safety layer. Before any of them is asked to write, a separate check decides whether the post is one we will write about at all - see the sensitive-content filter and the pre-generation check under Persona. That check does not use the model you pick here, so choosing a cheaper model is not choosing a weaker guard.'],
          ['p', 'Switching takes effect on the next comment. Nothing restarts, nothing already queued is rewritten, and the choice is stored per owner - changing it here does not change what NeuroDialogs uses for replies.'],
        ],
      },
      {
        id: 'persona',
        title: 'Persona',
        blocks: [
          ['p', "The persona is the whole instruction the model gets. There is no separate tone, length or language setting — a preset is a name, an optional description, and one prompt you write yourself."],
          ['p', "Presets come in two groups. System holds six built-ins, which you can read and copy but not edit; My Prompts holds yours. Clicking any card makes it active immediately, and the active persona is the one every comment is written with."],
          ['controls', [
            {
              id: 'ctl-persona-card', name: 'A preset card', where: 'Persona', kind: 'button', tone: 'plain', value: 'Positive comment',
              rows: [
                ['What clicking does', 'Makes that preset active, straight away. There is no save step and no confirmation.'],
                ['The six built-ins', 'Positive comment, Intimate, Emotional response, Question to author, Brief review, Analytical approach. Each is a short prompt naming a style, asking for a length, and telling the model to answer with the literal token SKIP when the post does not suit it.'],
                ['Editing a built-in', 'Not possible. Open it to read it, or duplicate it into My Prompts and edit the copy.'],
                ['Deleting', 'Your own presets only, and never the active one — the delete entry is disabled while a preset is active.'],
                ['When it is read', 'At engine start, then cached. Editing the active preset while the engine is running does not change what is being posted until it is restarted.'],
              ],
            },
            {
              id: 'ctl-persona-prompt', name: 'Prompt', where: 'Persona → Create / Edit dialog', kind: 'field', value: 'Write a short comment on {post_text}…',
              rows: [
                ['What it does', 'The system prompt, verbatim. Whatever you write here is what the model is told; the post itself arrives separately as the message to answer.'],
                ['Required', 'Yes, along with the name. Description is optional.'],
                ['Tokens', 'Four are substituted before the call: {post_text}, {channel_title}, {account_username}, {account_first_name}. Substitution is plain text replacement, so stray braces elsewhere in the prompt cannot break it.'],
                ['An unknown token', 'Is left exactly where it is. It is neither an error nor blanked out.'],
                ['Say when to skip', 'Worth doing explicitly. All six built-ins end with an instruction to reply with the literal token SKIP when the post does not suit the persona; a prompt without one comments on everything it is given.'],
                ['If the model refuses', 'A reply that opens with a recognisable refusal — in English, Russian or Ukrainian — is caught and treated as a skip rather than posted. A safety net for prompts with no skip instruction, not a substitute for one.'],
              ],
            },
            {
              id: 'ctl-sensitive', name: 'Sensitive content filter', where: 'Persona', kind: 'toggle', on: true,
              rows: [
                ['What it does', 'Appends a rule to the end of every prompt, above whatever the persona says: do not comment on posts about death, murder or violent crime, war or mobilisation, terrorism, disasters, mourning, or partisan politics, elections and election campaigns — including opinion polls, candidate ratings and campaign coverage. Such a post is skipped instead.'],
                ['Default', 'On.'],
                ['Turning it off lasts a week', 'It is no longer permanent. A switch-off expires after seven days and the filter comes back on by itself. The row tells you the date while it is off, and you can turn it back on sooner from the same control.'],
                ['Why it expires', 'Because a switch set once and forgotten is not a decision anyone is still making. On this deployment three accounts had it off, and between them they accounted for 87% of every comment the product had ever published.'],
                ['Turning it off', 'Asks for confirmation first — the only switch on this page that does — and the confirmation shows three real comments this product published from accounts with the filter off, under posts about people being killed. Turning it back on asks nothing.'],
                ['What it does not control', 'The pre-generation check below. This switch decides whether the model is also told to decline; it does not decide what the product is willing to write about at all.'],
                ['In the numbers', 'Two distinct reasons, not one. sensitive_content is the model declining; sensitive_precheck is the check below stopping the post before any model was asked. Both stay visible separately from ordinary skips.'],
                ['Loud at start', 'While it is off, the engine writes a warning into the log every time it starts.'],
              ],
            },
            {
              id: 'ctl-precheck', name: 'The check before generation', where: 'No control — it always runs', kind: 'button', value: 'Always on',
              rows: [
                ['What it does', 'Before your persona is assembled and before your chosen model is asked for anything, a separate call decides whether the post is about one of the sensitive topics. If it is, the post is dropped and no comment is generated.'],
                ['Why a second layer', 'Because the prompt rule rides on a persona that argues with it — be a real person, react to the detail — and we measured what that conflict costs: the old default model answered anyway on 23 of 102 sensitive posts. This check has no persona to lose to.'],
                ['It is not switchable', 'Deliberately. The filter above is a setting; this is a floor. Measured against our own history, it would have stopped 393 comments published from accounts that had the filter switched off.'],
                ['It is not your model', 'It runs on its own slot, so picking a cheaper model for writing does not pick a weaker guard.'],
                ['What it costs', 'About three hundredths of a cent per post, and a fraction of a second. A stopped post costs that instead of a full generation.'],
                ['If it cannot answer', 'The post goes back in the queue — not dropped, not published. A guard that cannot reach a verdict stops the line rather than opening it, and the engine logs why.'],
              ],
            },
          ]],
          ['note', "The prompt is not the only thing shaping a comment. Accounts sharing one persona each get a small, fixed style nudge appended to their prompt — be a little more direct, keep it warm, plain and no fluff — so ten accounts on one preset do not all sound like the same writer. It is fixed per account, not random per comment.",
          ],
        ],
      },
      {
        id: 'channels',
        title: 'The channels it watches',
        blocks: [
          ['p', "The monitored list is what the engine polls. It is re-read at the top of every round, so a channel added here is being watched a minute later without anything being restarted."],
          ['p', "Edits here save as you make them. There is no Save changes step — removing a row is written immediately, and the count above the table is the current list. Every monitored channel is commented on for real; there is no per-channel switch and no rehearsal mode."],
          ['controls', [
            {
              id: 'ctl-add-channels', name: 'Add channel(s)', where: 'Channels', kind: 'button', value: 'Add channel(s)',
              rows: [
                ['What it does', 'Takes a paste of channels, one per line, and appends the new ones to the monitored list.'],
                ['What a line may look like', 'An @username, a t.me link with or without the https, or a bare username. The link prefix and the @ are stripped before the name is checked.'],
                ['What counts as valid', 'Five to thirty-two characters, letters, digits and underscores, not starting with a digit. A line that does not match is reported back as invalid rather than failing the whole paste.'],
                ['Duplicates', 'Dropped, case-insensitively, both against the existing list and against the rest of the same paste. The result says how many were added, how many were duplicates and how many were invalid.'],
                ['No limit', 'There is no cap on lines. This only appends to a list — nothing touches Telegram until the engine next polls.'],
              ],
            },
            {
              id: 'ctl-clear-channels', name: 'Clear all', where: 'Channels', kind: 'button', tone: 'bad', value: 'Clear all',
              rows: [
                ['What it does', 'Empties the monitored list. Asks first.'],
                ['What it does not touch', 'Channel assignments, the blacklist and comment history all stay. So does every preset — this is the way to empty the list before loading a different one.'],
                ['Effect on a running engine', 'It stops finding posts on the next round. It does not stop the engine, and comments already waiting out their delay still go out.'],
              ],
            },
            {
              id: 'ctl-save-preset', name: 'Save Preset', where: 'Channels', kind: 'button', tone: 'plain', value: 'Save Preset',
              rows: [
                ['What it does', 'Snapshots the current channel list under a name so it can be reloaded later.'],
                ['A snapshot, not a link', 'Editing the list afterwards does not change the preset, and loading a preset replaces the list rather than merging into it.'],
                ['What a preset carries', 'The channel names only. The live-posting flags are not part of it and are left as they are when a preset is loaded.'],
              ],
            },
          ]],
          ['note', "The line under the table — that resolved title and baseline ID are tracked by the engine and not exposed — is accurate. The engine resolves each channel once, caches the result and reuses it for every later post, which is why a restart does not re-resolve hundreds of channels. None of that cache is readable from this page.",
          ],
        ],
      },
      {
        id: 'blacklist',
        title: 'What the engine took out of circulation',
        blocks: [
          ['p', "When a post fails in a way that says something durable about one account on one channel, the engine writes it down. The blacklist is that record, grouped by reason, with a count on each group and the individual account-and-channel pairs behind the fold."],
          ['table', {
            head: ['Reason', 'What produced it'],
            rows: [
              ['Sending forbidden', 'Telegram refused the send for this account on this channel — banned in the channel, or writing not allowed.'],
              ['No access', 'The channel is private to this account, or it needs rights the account does not have.'],
              ['Username not found', 'The account could not resolve the name. Often about the account rather than the channel: a fresh, low-history account can fail to resolve a channel that other accounts reach fine.'],
              ['Kicked from discussion group', 'The comment goes into the channel’s linked discussion group, and this account is not a member. The engine tries to join and re-send once; this is recorded only if that also fails, or if there is no discussion group at all.'],
              ['Other', 'Anything that did not classify — the catch-all.'],
            ],
          }],
          ['p', "The record is not passive. A failure of the first, second or fourth kind moves that channel off the account it was assigned to and onto one with a clean record there, handing the freed account one of the recipient’s channels in exchange so nobody’s workload changes size. A resolve failure is softer: the account is sorted to the back of the queue for that channel rather than moved off it."],
          ['controls', [
            {
              id: 'ctl-prune', name: 'Prune unresolvable channels', where: 'Blacklist, in the header', kind: 'button', tone: 'warn', value: 'Prune unresolvable',
              rows: [
                ['What it does', 'Stops monitoring the channels that are very probably gone — renamed or deleted — rather than merely hard to reach right now.'],
                ['The test it applies', 'Both conditions together: at least one recorded username-not-found failure, and never once successfully baselined by any account.'],
                ['Why it is worth pressing', 'A dead channel otherwise sits in the poll list forever, spending a resolve attempt on every eligible account, every round, for nothing.'],
                ['What it leaves', 'The blacklist history. Only the monitored list is trimmed — clear the blacklist separately if you want the rows gone too.'],
              ],
            },
            {
              id: 'ctl-clear-blacklist', name: 'Clear blacklist', where: 'Blacklist, in the header', kind: 'button', tone: 'bad', value: 'Clear blacklist',
              rows: [
                ['What it does', 'Deletes every recorded failure, across all reasons.'],
                ['What it changes', 'The ranking. With the record gone, accounts sorted to the back of a channel for having failed there return to normal order, and the channel stops looking unresolvable to the prune button.'],
                ['What it does not change', 'Whether an account can actually post there. Telegram’s answer is unchanged, so a genuinely banned account fails again and the entry comes back on the next attempt.'],
              ],
            },
          ]],
          ['callout', [
            "An entry here is a record of what happened, not the thing keeping an account out. The exclusion itself is a separate 24-hour block on that one account for that one channel, held elsewhere and not shown on this page — it expires on its own, and deleting the blacklist entry does not lift it early. Clearing the blacklist tidies the history and the ranking; it does not give an account back a channel it is currently blocked from.",
          ]],
        ],
      },
      {
        id: 'quiet-channels',
        title: 'Channels it almost always skips',
        blocks: [
          ['p', 'Some channels post almost nothing your persona can answer. The engine still reads every post on them and still pays for a decision on each one - it just decides no, over and over. This section names those channels and lets you take them out of the pool.'],
          ['p', 'A channel appears here once it has at least ten processed posts and the model has declined at least half of them. Both thresholds come from the engine, and the section states the rule it applied rather than keeping a second copy of it.'],
          ['callout', [
            'Nothing here is removed automatically. The pool is yours, and a product that quietly shrank it would show up a week later as an unexplained drop in output. The list is shown, the numbers are shown, and the button does what you tick.',
          ]],
          ['controls', [
            {
              id: 'ctl-never-commented', name: 'Never produced a comment', where: 'Skipped', kind: 'button', value: 'Ticked already',
              rows: [
                ['What it means', 'Enough history to judge, and not one published comment in all of it. You are paying for a model call on every post and receiving nothing back.'],
                ['Why they are pre-ticked', 'Because there is nothing to weigh up. Removing one costs you no output at all - that is the whole content of the group.'],
              ],
            },
            {
              id: 'ctl-mostly-skipped', name: 'Mostly skipped, but does publish', where: 'Skipped', kind: 'button', value: 'Not ticked',
              rows: [
                ['What it means', 'Over the threshold, but it does produce comments. Each row states how many.'],
                ['Why they start unticked', 'Removing one of these costs you real output, so it is a judgement rather than a cleanup. The count is on the row so you can make it with the number in front of you.'],
              ],
            },
          ]],
          ['p', 'Under the button, both halves of the trade are stated together - how many declined posts stop costing you model calls, and how many published comments you give up. A control that showed only the gain would be an argument rather than a control.'],
          ['p', 'The same channels are marked in the Channels list itself, so you can see which ones they are without coming back here.'],
        ],
      },
      {
        id: 'numbers',
        title: 'Reading the numbers',
        blocks: [
          ['p', "Two regions report what happened. Statistics is four tiles of totals; Comments is the row-by-row history behind them."],
          ['controls', [
            {
              id: 'ctl-stat-attempts', name: 'Total Attempts', where: 'Stats', kind: 'tile', value: '148',
              rows: [
                ['Counts', 'Successful plus unsuccessful — every real send that was attempted.'],
              ],
            },
            {
              id: 'ctl-stat-successful', name: 'Successful', where: 'Stats', kind: 'tile', tone: 'ok', value: '131',
              rows: [
                ['Counts', 'Comments that reached Telegram.'],
              ],
            },
            {
              id: 'ctl-stat-failed', name: 'Unsuccessful', where: 'Stats', kind: 'tile', tone: 'bad', value: '17',
              rows: [
                ['Counts', 'Real post attempts that failed. Nothing else — a comment the model declined to write, or a post nobody was free to take, is not counted here.'],
                ['Not the same as the pool’s failed', 'The per-account failed number in the Pool section is broader: it also counts generation errors and posts skipped because no account was available. The two numbers are supposed to differ.'],
              ],
            },
            {
              id: 'ctl-stat-rate', name: 'Success Rate', where: 'Stats', kind: 'tile', value: '88.5%',
              rows: [
                ['Counts', 'Successful over total attempts, to one decimal. Zero attempts reads as 0.0%.'],
              ],
            },
          ]],
          ['callout', [
            "These four are meant to read as “since you last pressed Start”, and they do — the totals are all-time on the server, and the panel subtracts whatever they were at the moment Start was clicked. That subtraction lives in the browser tab and nowhere else, so reloading the page, or opening it in a second tab, loses it: the tiles then quietly show the all-time totals instead, with nothing on screen saying which of the two you are looking at.",
          ]],
          ['p', "Comments below holds every event, newest first, fifty to a page. A row opens into the post it answered, the comment itself, and, for anything that did not post, the reason and the error."],
          ['table', {
            head: ['Kind', 'What it means'],
            rows: [
              ['generated', 'A comment was written. Whether it then reached Telegram is on the row itself — a send that failed is logged as post failed as well.'],
              ['skipped', 'The model declined to write one: the persona’s own skip instruction, or the sensitive-content rule.'],
              ['error', 'Generation failed before there was anything to send.'],
              ['rate limited', 'The post was caught but no account was free to take it. Logged before any account is chosen, so this row has no account attached.'],
              ['post failed', 'A real send was attempted and Telegram refused it.'],
            ],
          }],
          ['controls', [
            {
              id: 'ctl-comments-filters', name: 'Kind · Channel · From · To', where: 'Comments', kind: 'select', value: 'All kinds',
              rows: [
                ['What they do', 'Narrow what the table shows.'],
                ['Where the work happens', 'Only one kind on its own is filtered by the server. Several kinds at once, a channel, and both dates are applied in the browser — to the fifty rows of the current page, not to your whole history.'],
                ['What that means in practice', 'A channel filter can come back empty while that channel has plenty of comments: they are simply on another page. The line under the table is honest about it — it says how many of the fetched rows are showing.'],
              ],
            },
            {
              id: 'ctl-export', name: 'Export CSV', where: 'Comments', kind: 'button', tone: 'plain', value: 'Export CSV',
              rows: [
                ['What it does', 'Downloads what is on screen — the current page, after the filters above. The filename carries the page number.'],
                ['Not the whole history', 'Exporting everything means paging through and exporting each page.'],
              ],
            },
            {
              id: 'ctl-clear-comments', name: 'Clear', where: 'Comments', kind: 'button', tone: 'bad', value: 'Clear',
              rows: [
                ['What it does', 'Permanently deletes the entire comment and event history. Asks first, and cannot be undone.'],
                ['What it takes with it', 'The Statistics tiles, which are counted from these rows, and the per-account numbers in the Pool. Reset counts is the gentler tool — it moves a floor timestamp instead of deleting anything.'],
              ],
            },
          ]],
        ],
      },
      {
        id: 'first-run',
        title: 'First run',
        blocks: [
          ['p', "The shortest path from an empty page to comments going out. Steps one to four can be done in any order; the engine will not do anything useful until all four are done."],
          ['steps', [
            "Put accounts in the pool. They have to exist and be healthy in Account Manager first, and they cannot be held by another module — an account NeuroDialogs or Active Warmup is driving is refused here by name.",
            "Add the channels you want watched. A paste of @usernames or t.me links is the normal way in; the parser takes both.",
            "Press Auto-assign channels. Without assignments everything still works, but each post is decided by a scan instead of going straight to a known account.",
            "Pick a persona. Six built-ins are there to read; duplicate the closest one and edit the copy rather than starting from an empty box, and keep its skip instruction.",
            "Leave the delay window alone unless you have a reason. The default 8-to-25 minutes is the recommended preset already.",
            "Press Start. The preflight dialog will tell you if accounts, channels or a persona are missing before anything runs.",
          ]],
          ['p', "Then watch two things. The engine log, expanded, shows the round-by-round decisions in real time; the Comments table shows what came out of them. A run that produces skipped rows and no comments is a persona problem, not an engine problem."],
          ['note', "Remember the session cap: ten hours by default, then the engine stops itself and stays stopped. If comments dry up overnight, check the run state before changing anything else — the most likely answer is that the session ended on its own and nobody pressed Start again.",
          ],
          ['linkout', { href: '/guides/neurodialogs', label: 'Next: answer the DMs the comments bring in' }],
        ],
      },
    ],
  },
  {
    slug: 'neurodialogs',
    url: 'neurodialogs',
    group: 'module',
    short: 'DMs at a human pace',
    title: 'Automating Telegram DM replies',
    summary: 'The module that answers private messages — how a session is shaped, what bounds it, and every setting on the page.',
    seoTitle: 'Auto-reply to Telegram DMs with AI: setup guide',
    seoDescription:
      'Answer Telegram DMs automatically without sounding like a bot: session rhythm, reply delays, spend limits, the link gate and the block pause.',
    module: 'neurodialogs',
    video: null,
    body: [
      {
        id: 'what-it-is',
        title: 'What this page is',
        blocks: [
          ['p', "NeuroDialogs answers the people who write to your accounts — someone who saw a comment, opened the profile and sent a message. It is the only module in the system where a real person is on the other end and can decide to press report."],
          ['p', "Everything about the page follows from that. The accounts are not online waiting; they come online for a while, read what arrived, answer some of it at human speed, and go offline again."],
          ['callout', [
            "The obvious design — keep every account connected and reply the moment a message lands — was rejected on purpose. An account that is online around the clock and answers within two seconds at four in the morning is not a person, and the pattern is visible from outside. Almost every default on this page exists to break that pattern, which is why a correctly running pool looks idle most of the time.",
          ]],
        ],
      },
      {
        id: 'map',
        title: 'Map of the page',
        blocks: [
          ['p', "Five regions, with a jump-nav across the top in this order."],
          ['map', [
            { name: 'Control', holds: 'Start and Stop, five counters, one row per account with what it is doing right now, and the live log underneath.' },
            { name: 'Dialogs Pool', holds: 'Two columns of accounts — available and in the pool — the same shape as the commenting pool, and the same one-module-at-a-time rule.' },
            { name: 'Prompts', holds: 'Prompt presets, which one is active, the reply-length slider and the knowledge file attached to each.' },
            { name: 'Sessions', holds: 'Everything about rhythm and restraint: Rhythm, Replying, Limits, Group Promotion, and a folded Safety group.' },
            { name: 'Conversations', holds: 'Every thread, searchable, with the full exchange and a box to write in it yourself.' },
          ]],
        ],
      },
      {
        id: 'control',
        title: 'Control',
        blocks: [
          ['p', "Start does not start a conversation with anyone. It puts the pool into service; each account then schedules its own first session and comes online when its turn arrives."],
          ['controls', [
            {
              id: 'ctl-nd-start', name: 'Start', where: 'Control', kind: 'button', value: 'Start',
              rows: [
                ['What it does', 'Marks the module enabled and hands the pool to the runner. Accounts come online on their own schedule from that point, never all at once.'],
                ['What refuses it', 'An empty dialogs pool, and an active prompt that cannot be assembled — one pointing at a knowledge file that has since been deleted, for instance. Both refuse with a message naming what to fix, rather than reporting a running module that does nothing.'],
                ['How many at once', 'Three accounts online at a time, by default. A larger pool does not mean more simultaneous sessions; it means the turns spread further apart.'],
                ['Never at night', 'Sessions only happen inside an account’s own waking hours. An account whose local time is the small hours does not come online, whatever the gaps say.'],
                ['What a fresh start looks like', 'Nothing. Zero online, zero replies, for hours. The panel says so in its own words under the counters, because a correct run and a broken one look identical otherwise.'],
              ],
            },
            {
              id: 'ctl-nd-stop', name: 'Stop', where: 'Control', kind: 'button', tone: 'bad', value: 'Stop',
              rows: [
                ['What it does', 'Sessions in flight finish and their accounts go offline. Nothing new is scheduled.'],
                ['Never gated', 'Stop always works, whatever the subscription says.'],
              ],
            },
            {
              id: 'ctl-nd-state', name: 'An account row', where: 'Control', kind: 'badge', tone: 'plain', value: 'waiting',
              rows: [
                ['The four states', 'Online — in a session right now. Waiting — awake, with the next session due at the time shown beside it. Asleep — outside its own waking hours. Paused — pulled out by the safety layer, with the reason next to it.'],
                ['The three counters', 'Replies sent today, new people this account started talking to today, and how many of those people blocked or refused it today. A waiting badge appears when someone is unanswered.'],
                ['Paused is the only one to act on', 'The other three are ordinary. A paused account has a Resume button on its own row and does not come back without it.'],
              ],
            },
            {
              id: 'ctl-nd-readonly', name: 'reading only — automatic replies are off', where: 'Control, beside the state', kind: 'badge', tone: 'warn', value: 'reading only',
              rows: [
                ['What it means', 'The module is started and the accounts are working, but Automatic replies in Safety is off, so nothing is written.'],
                ['Why that is useful', 'It keeps the accounts warm and the inbox current while a prompt is being reworked. It is a real operating mode, not a broken one.'],
              ],
            },
          ]],
          ['p', "Five counters sit above the account rows: accounts in the pool, online now, conversations, unread, replies today. Daily AI spend is deliberately not among them — it is a number nobody watches, and the limit that protects it works without anyone looking."],
        ],
      },
      {
        id: 'prompts',
        title: 'Prompts',
        blocks: [
          ['p', "A prompt preset is a name, a template you write, a maximum reply length, and optionally a knowledge file. The active one is what every account in the pool speaks with."],
          ['controls', [
            {
              id: 'ctl-nd-template', name: 'Prompt template', where: 'Prompts → editor', kind: 'field', value: 'You are {account_first_name}, a real person…',
              rows: [
                ['What it does', 'The instruction the model answers under. Written as plain text, with tokens substituted before each call.'],
                ['The tokens', 'Eight, offered as buttons under the box: {message}, {sender_name}, {message_language}, {context}, {account_id}, {account_username}, {account_phone}, {account_first_name}.'],
                ['Substitution', 'Plain text replacement, like the commenting persona. Braces that are not a known token are left alone.'],
                ['What is appended for you', 'The length instruction is added to the end of every prompt automatically, so there is no need to repeat it in the text.'],
              ],
            },
            {
              id: 'ctl-nd-maxlen', name: 'Max reply length', where: 'Prompts → editor', kind: 'slider', pct: 27,
              rows: [
                ['What it does', 'Caps the reply, in characters, as an instruction appended to the prompt.'],
                ['Default', '300 characters.'],
                ['Range', '40 to 1000. The lower bound is real, not a formality — a 40-character cap forces the kind of terse message a person actually sends, and anything below it produces fragments.'],
                ['Why shorter is usually right', 'A long, well-structured paragraph arriving in a DM from a stranger reads as generated. Short reads as typed.'],
              ],
            },
            {
              id: 'ctl-nd-knowledge', name: 'Knowledge file', where: 'Prompts → editor', kind: 'select', value: 'None',
              rows: [
                ['What it does', 'Attaches a document whose contents go into the prompt, so the model states your prices, dates and links instead of inventing them.'],
                ['Accepted', 'Plain text and Markdown — .txt, .md, .markdown — up to 512 KB. Anything else is refused rather than accepted and fed to the model as noise.'],
                ['How much is used', 'The first 12,000 characters. A longer file is cut at a line break near that point and marked truncated in the picker, so it is visible which files are only partly in play.'],
                ['Not a search index', 'The whole file goes into every generation. That is deliberate at this size, and it is also why the cut exists — the text is re-sent on every single reply.'],
              ],
            },
          ]],
          ['note', "Deleting a knowledge file that a preset still points at does not fail quietly. The preset stops assembling, and the module refuses to start until it is fixed — which is better than accounts confidently answering questions with nothing behind the answer.",
          ],
        ],
      },
      {
        id: 'model',
        title: 'Choosing the model',
        blocks: [
          ['p', 'The same five models are available here as in Neurocommenting, and the setting is separate - this one decides who writes your direct-message replies, and changing it does not touch what writes your comments.'],
          ['p', 'The measurements below come from the commenting side: 34 sensitive posts, three draws each, 102 live calls per model. Be clear about what that does and does not tell you here. It measures how a model behaves when a persona prompt pushes it to be chatty and a safety rule tells it not to - the same tension a DM reply is written under, so it transfers. It was not measured on conversations, so treat it as strong evidence about the model rather than a measurement of this module.'],
          ['callout', [
            'One difference matters more here than on the commenting side: the pre-generation check that guards comments does NOT run on replies. A conversation is not a post about a subject, so there is nothing to classify before it starts. In DMs the model\'s own judgement, your prompt, and the Safety group below are the whole of it - which makes the choice of model count for more, not less.',
          ]],
          ['controls', [
            {
              id: 'nd-mdl-grok', name: 'Grok 4.3', where: 'The default', kind: 'button', value: 'Grok 4.3',
              rows: [
                ['Result', 'Declined all 102 sensitive posts - a leak rate under about 3 per cent, which is the strongest statement 102 clean draws support.'],
                ['Character', 'The shortest writer of the five, a median of 89 characters. In a conversation that reads as terse; whether it suits you depends on what your accounts are meant to sound like.'],
                ['Price', '8.3x GPT-4o mini on input, 4.2x on output.'],
              ],
            },
            {
              id: 'nd-mdl-claude', name: 'Claude Haiku 4.5', where: 'The longest replies', kind: 'button', value: 'Claude Haiku 4.5',
              rows: [
                ['Result', 'One leak in 102, on the mildest post in the set.'],
                ['Character', 'The longest writer, a median of 137 characters. For DMs this is the most substantive of the five, and the usual reason to pay above Grok.'],
                ['Price', 'The dearest per token: 6.7x on input, 8.3x on output.'],
              ],
            },
            {
              id: 'nd-mdl-gemini', name: 'Gemini 3.5 Flash-Lite', where: 'Cheapest that held', kind: 'button', value: 'Gemini 3.5 Flash-Lite',
              rows: [
                ['Result', 'Declined all 102.'],
                ['Why you would pick it', "The cheapest way off GPT-4o mini - 2x on input against Grok's 8.3x - without giving up the safety result."],
              ],
            },
            {
              id: 'nd-mdl-openai', name: 'GPT-4o mini', where: 'Cheapest, and not our default any more', kind: 'button', value: 'GPT-4o mini',
              rows: [
                ['Result', 'Wrote a comment on 23 of 102 sensitive posts, and on six of them every single time it was asked.'],
                ['Why that matters more in DMs', 'There is no pre-generation check on this path to catch what the model lets through. Whatever the model decides is what your account says.'],
                ['When it is still fine', 'Conversations that never go near death, war, crime or politics. If you cannot promise that of your inbox, the saving is not what you are choosing.'],
              ],
            },
            {
              id: 'nd-mdl-kimi', name: 'Kimi K2.6', where: 'Works, but read the price twice', kind: 'button', value: 'Kimi K2.6',
              rows: [
                ['Result', 'Declined all 102.'],
                ['The catch', 'It reasons before answering and is billed for the reasoning: about 1206 output tokens per reply against 32 for the others - roughly 70x GPT-4o mini per reply, not the 6.7x its rate suggests. It also takes 45 to 50 seconds a call.'],
                ['In a conversation', 'That delay is not neutral. A reply that lands a minute late reads differently from one that lands in two seconds.'],
              ],
            },
          ]],
          ['p', 'There is a daily spend ceiling on this module, and it is checked against the real per-token cost of whichever model you picked - so a dearer model does not silently buy you more spending, it reaches the same ceiling sooner. Switching takes effect on the next reply; nothing restarts and no session boundary is waited for.'],
        ],
      },
      {
        id: 'rhythm',
        title: 'Rhythm',
        blocks: [
          ['p', "When an account comes online is demand-driven, not a timer. An inbox with people waiting pulls the next session in; an empty one lets it drift out. That is why there are two gap ranges rather than one interval."],
          ['controls', [
            {
              id: 'ctl-nd-idle-gap', name: 'Gap between sessions — inbox empty', where: 'Sessions → Rhythm', kind: 'field', value: '120 — 300',
              rows: [
                ['What it does', 'How long an account stays offline when nobody is waiting for an answer.'],
                ['Default', '120 to 300 minutes — two to five hours.'],
                ['Picked how', 'A fresh random value inside the range after every session, not a fixed cadence. A constant interval is a metronome in the traffic pattern.'],
              ],
            },
            {
              id: 'ctl-nd-hot-gap', name: 'Gap between sessions — people waiting', where: 'Sessions → Rhythm', kind: 'field', value: '20 — 60',
              rows: [
                ['What it does', 'The same thing, for an inbox with unanswered people in it. Shorter, because a lead that waits five hours is usually gone.'],
                ['Default', '20 to 60 minutes.'],
                ['The trade', 'Shorter converts better and looks less human. This pair is the main dial between the two.'],
              ],
            },
            {
              id: 'ctl-nd-session-len', name: 'Session length', where: 'Sessions → Rhythm', kind: 'field', value: '20 — 40',
              rows: [
                ['What it does', 'How long an account stays online per visit.'],
                ['Default', '20 to 40 minutes.'],
                ['Still runs when capped', 'An account that has hit its daily reply limit comes online anyway: it reads, marks things read and writes nothing. That is a real state, not a wasted session.'],
              ],
            },
            {
              id: 'ctl-nd-extension', name: 'Max extension', where: 'Sessions → Rhythm', kind: 'field', value: '20',
              rows: [
                ['What it does', 'Extra minutes a session may run past its planned end while the other person is still actively replying.'],
                ['Default', '20 minutes.'],
                ['Why it exists', 'A person pulled into a live conversation does not stop mid-sentence because a timer expired.'],
                ['Zero', 'Turns the extension off — sessions then end exactly on their planned length.'],
              ],
            },
          ]],
        ],
      },
      {
        id: 'replying',
        title: 'Replying',
        blocks: [
          ['p', "Two different delay distributions, because a cold first reply and a follow-up inside a running conversation are not the same act. One range for both produced either implausibly fast strangers or uselessly slow conversations."],
          ['controls', [
            {
              id: 'ctl-nd-first-delay', name: 'First reply to a stranger', where: 'Sessions → Replying', kind: 'field', value: '300 — 2700',
              rows: [
                ['What it does', 'How long before the first answer to someone new.'],
                ['Default', '300 to 2700 seconds — five to forty-five minutes.'],
                ['Why so wide', 'An instant answer to a cold DM is the clearest bot tell there is. The width matters as much as the length: a consistent delay is its own signature.'],
              ],
            },
            {
              id: 'ctl-nd-reply-delay', name: 'Reply inside a live conversation', where: 'Sessions → Replying', kind: 'field', value: '40 — 180',
              rows: [
                ['What it does', 'The delay between messages once a conversation is already running.'],
                ['Default', '40 to 180 seconds.'],
                ['Fast on purpose', 'That is what a person engaged in a chat actually does.'],
              ],
            },
            {
              id: 'ctl-nd-context', name: 'Context messages', where: 'Sessions → Replying', kind: 'field', value: '10',
              rows: [
                ['What it does', 'How many previous messages of the conversation are sent to the model with each reply.'],
                ['Default', '10. The field accepts 0 to 50.'],
                ['At zero', 'Every reply is written with no memory of the conversation.'],
              ],
            },
            {
              id: 'ctl-nd-skip', name: 'Skip chance', where: 'Sessions → Replying', kind: 'slider', pct: 17,
              rows: [
                ['What it does', 'The chance of deliberately leaving an answerable conversation for the next session instead of answering it now.'],
                ['Default', '15%. The slider runs from 0 to 90%.'],
                ['Why', 'Nobody clears their whole inbox every time they open it.'],
              ],
            },
            {
              id: 'ctl-nd-language', name: 'Reply language', where: 'Sessions → Replying', kind: 'select', value: 'Match the sender',
              rows: [
                ['What it does', 'Either answers in whatever language the message arrived in, or pins one language for every reply.'],
                ['Default', 'Match the sender.'],
                ['Fixed', 'Reveals a second picker for the language itself.'],
              ],
            },
          ]],
          ['p', "Two more things happen without a setting: consecutive incoming messages are folded into one reply rather than answered one by one, and the typing indicator runs for roughly as long as a person would take, if typing simulation is on."],
        ],
      },
      {
        id: 'limits',
        title: 'The four limits',
        blocks: [
          ['p', "Four independent numbers, because no single one expresses the risk. Zero means no limit on any of them."],
          ['controls', [
            {
              id: 'ctl-nd-per-thread', name: 'Replies per person', where: 'Sessions → Limits', kind: 'field', value: '5',
              rows: [
                ['What it does', 'The total number of replies one conversation may ever receive.'],
                ['Default', '5. It is a lifetime count per conversation, not per session or per day.'],
                ['What it prevents', 'One person being pestered. A conversation that reaches it is closed with the reason shown in the inbox.'],
              ],
            },
            {
              id: 'ctl-nd-per-session', name: 'Replies per session', where: 'Sessions → Limits', kind: 'field', value: '8',
              rows: [
                ['What it does', 'The most one account may write in one visit.'],
                ['Default', '8.'],
                ['What it prevents', 'One sitting turning into a blast.'],
              ],
            },
            {
              id: 'ctl-nd-per-day', name: 'Replies per day', where: 'Sessions → Limits', kind: 'field', value: '25',
              rows: [
                ['What it does', 'One account’s total daily exposure.'],
                ['Default', '25.'],
                ['On reaching it', 'The account still comes online and reads for the rest of the day. It simply writes nothing.'],
              ],
            },
            {
              id: 'ctl-nd-new-threads', name: 'New people per day', where: 'Sessions → Limits', kind: 'field', tone: 'warn', value: '5',
              rows: [
                ['What it does', 'How many strangers this account starts talking to in a day.'],
                ['Default', '5.'],
                ['The important one', 'Unique non-contacts messaged is the closest available proxy for what actually trips Telegram’s own flood protection. Of the four, this is the one to keep low on fresh accounts.'],
              ],
            },
            {
              id: 'ctl-nd-dialogs-read', name: 'Chats read per session', where: 'Sessions → Limits', kind: 'field', value: '15',
              rows: [
                ['What it does', 'How many conversations an account opens and reads in one visit.'],
                ['Default', '15. The minimum is 1 — unlike the four above, this one has no unlimited setting.'],
              ],
            },
          ]],
        ],
      },
      {
        id: 'safety',
        title: 'Safety',
        blocks: [
          ['p', "The group is folded by default, with its current values written along the header so nothing is hidden by being shut. Everything in it is enforced in code — a prompt instruction is not an enforcement mechanism, and models break instructions regularly."],
          ['controls', [
            {
              id: 'ctl-nd-link-gate', name: 'No links before N exchanges', where: 'Sessions → Safety', kind: 'field', value: '3',
              rows: [
                ['What it does', 'Withholds any link the model writes until the conversation has been through this many back-and-forth rounds.'],
                ['Default', '3.'],
                ['What counts as a link', 'More than http addresses: t.me and tg:// forms, bare domains, and an @mention too — an @channel funnels exactly like a link and carries the same risk sent unprompted.'],
                ['The exception', 'If the person explicitly asked for it, one round is enough.'],
                ['Why in code', 'A link in the first message to a stranger is the fastest route to a spam report. The prompts all say not to; the gate is what makes it true.'],
              ],
            },
            {
              id: 'ctl-nd-block-rate', name: 'Auto-pause at block rate', where: 'Sessions → Safety', kind: 'slider', pct: 25,
              rows: [
                ['What it does', 'Pauses an account once this share of its recent sends comes back as a block or a privacy refusal.'],
                ['Default', '25%.'],
                ['Why it is the number to watch', 'Recipients blocking an account is the earliest externally visible sign it is heading for a ban — days before the ban itself.'],
                ['After it fires', 'The account appears paused in Control with the reason beside it and stays out until you resume it by hand.'],
              ],
            },
            {
              id: 'ctl-nd-cost', name: 'Daily AI spend limit', where: 'Sessions → Safety', kind: 'field', value: '5',
              rows: [
                ['What it does', 'Caps what the whole pool may spend on generation in a day, in dollars.'],
                ['Default', '5.'],
                ['On reaching it', 'Replying stops for the rest of the day. This is why the number is not a counter on the Control panel — it works without being watched.'],
              ],
            },
            {
              id: 'ctl-nd-auto-reply', name: 'Automatic replies', where: 'Sessions → Safety', kind: 'toggle', on: true,
              rows: [
                ['What it does', 'Off keeps accounts coming online and reading without writing anything.'],
                ['Default', 'On.'],
                ['Where it shows', 'The Control panel wears a reading only badge for as long as it is off, so the state is never silent.'],
              ],
            },
            {
              id: 'ctl-nd-stop-after-link', name: 'Stop after sending a link', where: 'Sessions → Safety', kind: 'toggle', on: true,
              rows: [
                ['What it does', 'Ends automatic replying in a conversation once a link has gone out.'],
                ['Default', 'On.'],
                ['Why', 'The link was the point of the conversation. Continuing past it is where an answer turns into pestering.'],
              ],
            },
            {
              id: 'ctl-nd-backlog', name: 'Answer the backlog', where: 'Sessions → Safety', kind: 'toggle', on: false,
              rows: [
                ['What it does', 'Answers unread messages that arrived before the module was started, rather than only marking them read.'],
                ['Default', 'Off.'],
                ['Why off', 'A pool started on dozens of stale conversations produces exactly the burst of outbound messages that gets accounts banned — the one thing the rest of this page exists to prevent.'],
              ],
            },
            {
              id: 'ctl-nd-idle-actions', name: 'Fill empty sessions with warmup actions', where: 'Sessions → Safety', kind: 'toggle', on: true,
              rows: [
                ['What it does', 'With nothing to answer, the account scrolls, reads and uses its saved messages instead of sitting online doing nothing.'],
                ['Default', 'On.'],
                ['Which actions', 'Active Warmup’s own action library. This does not enrol the account in that module — it borrows the behaviour for the length of the session.'],
              ],
            },
            {
              id: 'ctl-nd-blacklist', name: 'Never reply to these people', where: 'Sessions → Safety', kind: 'field', value: '@someone',
              rows: [
                ['What it does', 'A list of people no account will ever answer.'],
                ['Format', 'An @username or a numeric id, one per line or comma-separated.'],
              ],
            },
          ]],
          ['callout', [
            "Two more guards run without a setting of their own. Outgoing text is compared against what the pool has recently sent, and a reply too close to one already used is withheld and rewritten next session — one preset across a hundred accounts otherwise converges on identical phrasing, which is the textbook signature of a spam network. And a short, deliberately narrow set of incoming conversations is never answered automatically at all: payment demands, accusations and threats, apparent minors, anything crisis-shaped. Those are handed to you in the inbox instead.",
          ]],
        ],
      },
      {
        id: 'promotion',
        title: 'Group promotion',
        blocks: [
          ['p', "Separate from the link gate, and often confused with it. The gate decides whether any link may go out yet; this decides how often, once past the gate, a reply also mentions one of your groups."],
          ['controls', [
            {
              id: 'ctl-nd-groups', name: 'Promoted groups', where: 'Sessions → Group Promotion', kind: 'field', value: '@mygroup',
              rows: [
                ['What it does', 'The groups a reply may promote. One per line, as @group or a t.me link.'],
                ['Empty', 'The feature is simply off — no group instruction is added to the prompt at all.'],
                ['Where else this is written', 'Group Parser’s promote action writes into this same list, so a group promoted from there appears here.'],
              ],
            },
            {
              id: 'ctl-nd-every-n', name: 'Promote every N replies', where: 'Sessions → Group Promotion', kind: 'field', value: '5',
              rows: [
                ['What it does', 'At most one group mention per this many outgoing messages, counted per conversation.'],
                ['Default', '5.'],
                ['Zero', 'Never promote, whatever is in the list above.'],
                ['Enforced where', 'In code, when the prompt is composed — the model is not asked to limit itself.'],
              ],
            },
          ]],
        ],
      },
      {
        id: 'inbox',
        title: 'Conversations',
        blocks: [
          ['p', "Every thread the pool has, searchable, with the exchange on the right. A conversation that has stopped says why."],
          ['table', {
            head: ['Reason it stopped', 'What it means'],
            rows: [
              ['link sent', 'A link went out and Stop after sending a link is on.'],
              ['reply limit reached', 'The conversation hit Replies per person.'],
              ['blacklisted', 'This person is on the never-reply list.'],
              ['they blocked us', 'The recipient blocked the account.'],
              ['needs a human', 'The incoming screen caught something that must not get an automated answer.'],
              ['stopped manually', 'You wrote in it yourself.'],
              ['Telegram service account — never answered', 'Telegram’s own service messages. Never answered, by design.'],
            ],
          }],
          ['controls', [
            {
              id: 'ctl-nd-composer', name: 'The reply box', where: 'Conversations', kind: 'field', value: 'Reply as acc_101…',
              rows: [
                ['What it does', 'Sends a message as that account, from you.'],
                ['What it costs', 'The conversation. Writing in it takes it over — the engine stops answering that thread automatically until you hand it back.'],
                ['Why', 'Two authors writing into one chat minutes apart, possibly contradicting each other, is worse than silence.'],
                ['Handing it back', 'A resume action on the thread returns it to automatic answering.'],
              ],
            },
          ]],
          ['p', "The warning strip at the top of Control counts two things worth acting on: accounts auto-paused for safety, and conversations waiting on a human. Both are the kind of thing that will not resolve itself."],
        ],
      },
      {
        id: 'first-run',
        title: 'First run',
        blocks: [
          ['p', "The defaults on this page are already the cautious configuration. On a fresh pool, most of it is worth leaving alone."],
          ['steps', [
            "Put accounts in the dialogs pool. The one-module rule applies here as everywhere: an account that is commenting has to leave that pool first.",
            "Pick or write a prompt. Duplicate the closest built-in rather than starting from an empty box, and attach a knowledge file if there are prices, dates or links the answers must get right.",
            "Leave Rhythm, Replying and Limits at their defaults. They are the conservative setting already, and New people per day is the one to lower rather than raise on fresh accounts.",
            "Open Safety once and read it. Everything in it is on by default except Answer the backlog, which should stay off on a pool that has any history at all.",
            "Press Start, then leave it. The first sessions are hours away, and nothing being online is the expected state.",
          ]],
          ['p', "After that, the two things worth checking are the paused count and the blocked counter on each account row. A rising block count on one account is that account being disliked; a rising count across the pool is the prompt."],
          ['note', "Saving settings never needs a restart — they apply from the next session. The prompt is the exception in the other direction: the module refuses to start at all on a prompt that cannot be assembled, so a broken preset is caught at the button rather than discovered in someone’s DMs.",
          ],
          ['linkout', { href: '/guides/mass-reactions', label: 'Next: reactions, from the same pool of accounts' }],
        ],
      },
    ],
  },
  {
    slug: 'mass-reactions',
    url: 'mass-reactions',
    group: 'module',
    short: 'A pass that lands right',
    title: 'Adding reactions to Telegram posts',
    summary: 'Reactions that arrive like an audience instead of a switch being flipped — every setting on the page, and the numbers behind it.',
    seoTitle: 'Add Telegram reactions from multiple accounts',
    seoDescription:
      'Reactions that arrive like an audience, not a switch: targets, coverage, the arrival curve, per-account rate caps and choosing the emoji set.',
    module: 'mass-reactions',
    video: null,
    body: [
      {
        id: 'what-it-is',
        title: 'What this page is',
        blocks: [
          ['p', "Mass Reactions places reactions on new posts, or on the comments under them, using a pool of your accounts. It watches for posts as they appear and plans a fan-out for each one."],
          ['p', "By default it aims at comments rather than at the post. That is the product intent: a post with a lot of reactions is worth less than a post whose comment section looks alive."],
          ['callout', [
            "Dry run is on when you first arrive, and it stays on until you switch it off. In dry run the module does everything except the send — it catches posts, plans which account reacts with what and when, and writes all of it down. So the first thing a new owner gets is an inspectable plan rather than live traffic, and the honest first step on this page is to run it that way for a while and read the result.",
          ]],
        ],
      },
      {
        id: 'map',
        title: 'Map of the page',
        blocks: [
          ['p', "Nine regions, with a jump-nav across the top in this order."],
          ['map', [
            { name: 'Control', holds: 'Start and Stop, the Dry run switch, six counters, and one row per account with what it has placed today.' },
            { name: 'Reactions Pool', holds: 'Two columns of accounts, the same shape and the same one-module-at-a-time rule as the other pools.' },
            { name: 'Stats', holds: 'Attempts, successful, unsuccessful and the rate between them.' },
            { name: 'Channels', holds: 'The target channels, each tile showing whether its comments can actually be reacted to, plus the paste box and the discussion-group check.' },
            { name: 'What to react to', holds: 'Comments or channel posts, and how many comments under each post.' },
            { name: 'Emoji', holds: 'Which reactions accounts place, in what order, and which of them every probed target accepts.' },
            { name: 'Limits', holds: 'Per-account rate caps, the chance a message is covered at all, and the share of the pool that covers it.' },
            { name: 'Pacing', holds: 'How soon the first reaction lands, how the rest are spread behind it, the arrival curve, and the floodwait policy.' },
            { name: 'Joining', holds: 'One switch that explains why there is nothing to configure.' },
          ]],
        ],
      },
      {
        id: 'targets',
        title: 'Targets',
        blocks: [
          ['p', "Targets are their own list, deliberately not the channel list from Neurocommenting. That one means channels you comment on; these are usually your own channels, and overloading one list with both would be confusing."],
          ['controls', [
            {
              id: 'ctl-mr-add', name: 'Add', where: 'Channels', kind: 'button', value: 'Add',
              rows: [
                ['What it does', 'Adds channels from the paste box. One per line, as @channel or a t.me link, and the box says how many it recognised before you press it.'],
                ['What happens next', 'A discussion check runs automatically on what you just added, so a channel that cannot be reacted to in comment mode says so immediately rather than at the first failed send.'],
              ],
            },
            {
              id: 'ctl-mr-probe', name: 'Check discussion groups', where: 'Channels', kind: 'button', tone: 'plain', value: 'Check discussion groups',
              rows: [
                ['What it does', 'Asks each target for its linked discussion group and what reactions that group allows.'],
                ['The three answers', 'Not checked yet — never probed. No comments — the channel has no linked discussion group, so comment mode has nothing to aim at. Reactions off — the group accepts no reactions at all, and this is a setting on the group, not on the channel.'],
                ['Why it matters before starting', 'Both failing states are permanent until someone changes the group. Sending into them is a guaranteed failure per attempt.'],
                ['What else it collects', 'The list of reactions the group actually allows, which is what the Emoji section checks your set against.'],
              ],
            },
            {
              id: 'ctl-mr-foreign', name: 'A channel you do not administer', where: 'Channels → a tile', kind: 'badge', tone: 'warn', value: 'not your channel',
              rows: [
                ['What the marker means', 'The channel is not one you administer. Its admins can open a message and see exactly which accounts reacted.'],
                ['What the engine does about it', 'Uses a smaller share of your pool per message on that target — no more than 35%, whatever the coverage band below is set to.'],
                ['Why', 'The reactor list on someone else’s channel is an enumerable list of your accounts. A smaller slice per message is less of the pool exposed in one place.'],
                ['The safest targets', 'Your own channels, where nobody but you can enumerate who reacted.'],
              ],
            },
          ]],
        ],
      },
      {
        id: 'what-to-react-to',
        title: 'What to react to',
        blocks: [
          ['controls', [
            {
              id: 'ctl-mr-target-mode', name: 'Target', where: 'What to react to', kind: 'button', value: 'Comments',
              rows: [
                ['The two choices', 'Comments — reactions land on comments in the channel’s linked discussion group. Channel posts — they land on the post itself.'],
                ['Default', 'Comments.'],
                ['What comments cost', 'Membership. A reaction in a discussion group requires the account to be in that group, so accounts have to join first.'],
                ['What posts cost', 'Nothing extra — no joining needed. But a lively comment section is what makes a post look read, which is why the default is the other way.'],
              ],
            },
            {
              id: 'ctl-mr-comments-per-post', name: 'First comments per post', where: 'What to react to', kind: 'slider', pct: 30,
              rows: [
                ['What it does', 'How many comments under each post get reacted to, taken in the order they were written — the top of the thread, where a reader actually looks. Whoever wrote them.'],
                ['Default', '3.'],
                ['A count of comments, not of reactions', 'Each selected comment is then fanned out across the pool on its own. The reactions under one post are therefore this number multiplied by a share of the pool, not this number.'],
                ['How deep it looks', 'The first fifty comments of a thread are scanned to choose from, so the choice comes from a real window rather than whatever one page happened to hold, and a thread with thousands of comments is never walked.'],
                ['In post mode', 'Inert. The slider is only shown while the target is comments.'],
              ],
            },
          ]],
        ],
      },
      {
        id: 'emoji',
        title: 'Emoji',
        blocks: [
          ['p', "A discussion group sets its own list of allowed reactions. Sending one outside that list is a guaranteed failure, which is why the section checks your set against what the probe found."],
          ['controls', [
            {
              id: 'ctl-mr-emoji-set', name: 'The emoji set', where: 'Emoji', kind: 'badge', tone: 'plain', value: '👍 ❤ 🔥 👏',
              rows: [
                ['Default', 'Four: thumbs up, heart, fire, applause. Deliberately the most universally enabled ones — a wide default set is the fastest way to collect failures on a channel with a restricted list.'],
                ['The warning', 'An emoji that some probed target does not accept is flagged. A target nobody has probed makes no claim either way, and the section says so rather than implying the set is safe.'],
              ],
            },
            {
              id: 'ctl-mr-emoji-mode', name: 'Pick order', where: 'Emoji', kind: 'button', tone: 'plain', value: 'Random',
              rows: [
                ['The two choices', 'Random, or sequential through the list.'],
                ['Default', 'Random.'],
              ],
            },
          ]],
        ],
      },
      {
        id: 'limits',
        title: 'Limits',
        blocks: [
          ['p', "Two different things live here. Four rate caps bound what one account does; two more decide how much of the pool shows up on any given message. They deliberately do not multiply together."],
          ['controls', [
            {
              id: 'ctl-mr-per-hour', name: 'Per hour', where: 'Limits', kind: 'field', value: '4',
              rows: [
                ['What it does', 'The most reactions one account may place in an hour, across every target.'],
                ['Default', '4.'],
                ['Why so low', 'Past a certain rate an account stops reading as a person scrolling and starts reading as a script.'],
              ],
            },
            {
              id: 'ctl-mr-per-day', name: 'Per day', where: 'Limits', kind: 'field', value: '20',
              rows: [
                ['What it does', 'The same signal over a longer window.'],
                ['Default', '20.'],
              ],
            },
            {
              id: 'ctl-mr-per-channel', name: 'Per channel, per day', where: 'Limits', kind: 'field', value: '8',
              rows: [
                ['What it does', 'Caps one account’s reactions on a single channel in a day.'],
                ['Default', '8.'],
                ['Why it is separate', 'Reactions concentrated on one channel are the easiest pattern for that channel’s own anti-spam to catch, even while the hourly and daily caps are nowhere near reached.'],
              ],
            },
            {
              id: 'ctl-mr-per-run', name: 'Per account, per run', where: 'Limits', kind: 'field', value: '200',
              rows: [
                ['What it does', 'A hard ceiling on one account’s total activity for a run, independent of the three caps above.'],
                ['Default', '200.'],
              ],
            },
            {
              id: 'ctl-mr-probability', name: 'Chance a message gets reacted to at all', where: 'Limits', kind: 'slider', pct: 50,
              rows: [
                ['What it does', 'Decides, per caught message, whether it gets anything at all.'],
                ['Default', '50%.'],
                ['Why not 100%', 'Some messages getting nothing is what a real audience looks like. Every message being covered is a pattern visible across the whole channel, not just a bigger number.'],
              ],
            },
            {
              id: 'ctl-mr-coverage', name: 'Share of the pool per covered message', where: 'Limits', kind: 'slider', pct: 50,
              rows: [
                ['What it does', 'Given that a message is covered, how much of the eligible pool takes part.'],
                ['Default', '35% to 65%.'],
                ['Drawn fresh', 'A new value inside the band for every message, so the counts vary instead of landing on the same number every time.'],
                ['Does not multiply', 'This and the chance above are separate on purpose: one decides whether, the other decides how many. An earlier design multiplied them and made the real share unpredictable.'],
                ['Overridden where', 'On a channel you do not administer the share is capped at 35% however the band is set.'],
              ],
            },
            {
              id: 'ctl-mr-skip-reacted', name: 'Skip already-reacted messages', where: 'Limits', kind: 'toggle', on: false,
              rows: [
                ['What it does', 'Leaves alone any message that already carries more than the number you set.'],
                ['Default', 'Off.'],
                ['Zero', 'React only to messages with no reactions at all.'],
                ['What it costs', 'Nothing. The existing count arrives with the message, so this needs no extra request.'],
              ],
            },
          ]],
        ],
      },
      {
        id: 'pacing',
        title: 'Pacing',
        blocks: [
          ['p', "Three separate timings, each answering a different question: when the first reaction may land, how the rest are spread behind it, and how fast one account is allowed to work through its own queue."],
          ['controls', [
            {
              id: 'ctl-mr-first-delay', name: 'First reaction after a post appears', where: 'Pacing', kind: 'field', value: '60 — 600',
              rows: [
                ['What it does', 'How long after a post appears the earliest reaction may land.'],
                ['Default', '60 to 600 seconds — one to ten minutes.'],
                ['Never instant', 'Nobody reads that fast. A reaction arriving in the first seconds is the clearest possible tell.'],
              ],
            },
            {
              id: 'ctl-mr-spread', name: 'Spread window', where: 'Pacing', kind: 'field', value: '90',
              rows: [
                ['What it does', 'How long the whole fan-out for one message is smeared over.'],
                ['Default', '90 minutes.'],
              ],
            },
            {
              id: 'ctl-mr-curve', name: 'Arrival curve', where: 'Pacing', kind: 'select', value: 'Human — front-loaded',
              rows: [
                ['The two choices', 'Human — reactions cluster in the first minutes and thin out after, the shape a real post’s reactions have. Uniform — flat across the window.'],
                ['Default', 'Human.'],
                ['Why uniform is the risky one', 'A flat spread is a metronome, and a metronome is a signature.'],
              ],
            },
            {
              id: 'ctl-mr-account-gap', name: 'Gap between one account’s reactions', where: 'Pacing', kind: 'field', value: '30 — 120',
              rows: [
                ['What it does', 'The minimum spacing between two reactions by the same account, enforced at send time.'],
                ['Default', '30 to 120 seconds.'],
                ['Why it is separate from the curve', 'The arrival curve spaces different accounts across one message and says nothing about one account’s own queue. Comment mode puts one account onto several comments under the same post, so without this an account could fire five reactions inside a minute — which no amount of cross-account jitter disguises.'],
              ],
            },
            {
              id: 'ctl-mr-floodwait-pause', name: 'Pause after a FloodWait', where: 'Pacing', kind: 'field', value: '120',
              rows: [
                ['What it does', 'How long an account waits after Telegram tells it to slow down.'],
                ['Default', '120 seconds.'],
              ],
            },
            {
              id: 'ctl-mr-floodwait-streak', name: 'FloodWaits before quarantine', where: 'Pacing', kind: 'field', tone: 'warn', value: '3',
              rows: [
                ['What it does', 'After this many floodwaits in a row, the account stops and stays stopped until you clear it.'],
                ['Default', '3.'],
                ['Why a streak', 'One floodwait is ordinary. Three in a row is the account telling you it is being throttled specifically.'],
              ],
            },
          ]],
          ['note', "One timing is not on this page: a planned reaction is cancelled rather than sent if the post it belongs to has aged past four hours by the time its turn comes. A reaction landing on a post that old reads as a bot catching up rather than as a reader, so a job delayed by a floodwait or a restart is dropped instead of arriving late.",
          ],
        ],
      },
      {
        id: 'joining',
        title: 'Joining',
        blocks: [
          ['p', "There is one switch here and it cannot be turned on. That is the honest state of things rather than an oversight."],
          ['controls', [
            {
              id: 'ctl-mr-without-join', name: 'React without joining', where: 'Joining', kind: 'toggle', on: false,
              rows: [
                ['What it would do', 'Let accounts react in a discussion group without joining it first.'],
                ['Why it is off', 'It was measured rather than assumed: a non-member can read a comment thread but cannot react in it — Telegram requires membership for the send.'],
                ['Why the switch still exists', 'It explains why there is nothing to configure, which is more use than a silent gap. The engine refuses to set it rather than accepting a value it would then ignore.'],
              ],
            },
          ]],
          ['p', "Joining itself is paced by the engine’s existing channel-join limits, not by a second set here: at most one join per pass, then a wait of three to ten minutes before the next. An account already in the group is skipped without a join being issued at all."],
          ['callout', [
            "This is the slowest part of starting the module, and it is meant to be. Forty accounts entering one discussion group inside a minute is a textbook pattern — so a pool of forty accounts takes hours to finish joining a new target, and reactions in comment mode ramp up as that finishes rather than all being available at once.",
          ]],
        ],
      },
      {
        id: 'reading-it',
        title: 'Reading the run',
        blocks: [
          ['p', "Control carries six counters: accounts, targets, posts queued, reactions queued, sent and failed. Below them, one row per account with what it has placed today."],
          ['p', "Statistics has the same four tiles as the commenting page — attempts, successful, unsuccessful and the rate — and the same caveat applies to them: the panel subtracts what the totals were when Start was last pressed, and that subtraction is held in the browser tab, so reloading the page silently turns them back into all-time numbers."],
          ['controls', [
            {
              id: 'ctl-mr-dry-run', name: 'Dry run', where: 'Control, beside Start', kind: 'toggle', on: true,
              rows: [
                ['What it does', 'Everything except the send. Posts are caught, jobs are planned and logged, and nothing reaches Telegram.'],
                ['Default', 'On, for a new owner.'],
                ['What it is for', 'Reading a plan before it becomes traffic — which accounts, which emoji, how many per message, and how the arrival is spread.'],
                ['Switching it off', 'Takes effect immediately. There is no separate confirmation, so the toast saying reactions will now actually be sent is the whole warning.'],
              ],
            },
          ]],
        ],
      },
      {
        id: 'first-run',
        title: 'First run',
        blocks: [
          ['p', "The defaults are the conservative end of every range. The order below matters more than the numbers."],
          ['steps', [
            "Put accounts in the reactions pool. The one-module rule holds: anything commenting or answering DMs has to leave that pool first.",
            "Add your targets and press Check discussion groups. A channel that comes back as no comments or reactions off cannot be used in comment mode at all, and it is better to learn that now.",
            "Leave Dry run on. Press Start and let it plan for a while.",
            "Read the plan. What you are looking for is whether the reaction counts per message look like an audience, and whether the arrival is spread rather than bunched.",
            "If comments are the target, expect the joining to take hours before the pool is fully useful. That is the join pacing working, not a fault.",
            "Only then switch Dry run off.",
          ]],
          ['p', "Two numbers are worth watching afterwards: failures on a target, which usually means an emoji outside that group's allowed list, and the floodwait streak, which is the account asking to be slowed down."],
          ['linkout', { href: '/guides/buying-telegram-accounts', label: 'Start of the chain: buying the accounts' }],
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
  'checklist', 'note', 'bullets', 'linkout', 'toolcta',
];

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
  return guide ? '/guides/' + guide.url : '/guides';
};

/* Reverse of the above, for the router: a pathname back to a guide.
   Unknown last segments return null, which the page treats as the index. */
const guideFromPath = pathname => {
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
  GUIDES, GUIDE_BY_SLUG, GUIDE_BY_URL, GUIDE_BY_MODULE,
  guideHref, guideFromPath,
  TOOLS, TOOL_BY_ID, BLOCK_KINDS,
});
