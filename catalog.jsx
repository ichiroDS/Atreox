
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
    seoTitle: 'Buying Telegram accounts: TData, GEO and testing sellers',
    seoDescription:
      'Test sellers before you scale: TData format, GEO matched to your proxies, rest time, no spamblock, and the checks that catch a dead account on import.',
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
            kicker: 'A faster, lighter test',
            blocks: [
              ['p', "If you want a faster, lighter approach to testing a new seller, buy just 5 accounts. Import them into ATREOX and immediately run the account checks."],
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
        ],
      },
      {
        id: 'marketplaces-and-geos',
        title: 'Marketplaces, Formats, and GEOs',
        blocks: [
          ['p', "When buying accounts, ATREOX requires the TData format. TData is the local session data Telegram Desktop stores on a computer—a folder containing everything needed to log in without a phone number or SMS code. It ensures zero friction, no re-verification, and higher trust from Telegram."],
          ['p', "When it comes to selecting a GEO for your accounts, the golden rule is that the account GEO must strictly match the GEO of the proxies you bought or plan to buy. USA accounts are not always the best option. In fact, at the time of writing this guide, the ATREOX team predominantly uses Indonesian accounts paired with Indonesian proxies, which also happen to be significantly cheaper and highly effective compared to American equivalents."],
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
    title: 'Buying & Managing Proxies',
    short: 'One per account, done right',
    summary:
      'Fifty accounts on one IP look like a farm to Telegram. The right proxy type, a GEO that matches, and a rotation setting that doesn\'t log you out.',
    seoTitle: 'Buying & Managing Proxies for Telegram Automation',
    seoDescription:
      'Datacenter, residential or mobile; static or rotating; exact GEO matching; a DataImpulse config that works; and the two ways to load proxies into ATREOX.',
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
                ['Maximum natural trust.', 'Easy rotation.', 'Highest survival rate.'],
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
        title: 'The Rotation Trap: Static vs. Rotating',
        blocks: [
          ['p', "Telegram automation fundamentally requires the SOCKS5 protocol for stable, persistent connections. However, how that IP behaves over time introduces significant risks."],
          ['p', "Proxies generally come in two connection types: static (the IP never changes) and rotating (the IP changes periodically)."],
          ['callout', [
            "Here is a crucial warning: Rotating proxies can cause instant account logouts. If your proxy rotates its IP too frequently, abruptly, or across different regions without proper session anchoring, Telegram's security system flags it as a hijacked session and forcefully deauthorizes the account. Therefore, even premium mobile rotating proxies can perform worse than cheap static ones if you do not configure your session handling correctly. If you use rotating proxies, ensure the rotation interval is stable and always stays within the exact same city or region.",
          ]],
        ],
      },
      {
        id: 'golden-rule-geo',
        title: 'The Golden Rule: Exact GEO Matching',
        blocks: [
          ['p', "A critical mistake beginners make is purchasing premium accounts from one region and running them through proxies from another."],
          ['callout', [
            "If you purchase Indonesian accounts, you must run them exclusively through Indonesian mobile proxies. When a Telegram session originally registered on a cellular network in Jakarta suddenly authenticates from a server in Frankfurt, the platform detects an anomalous location jump and flags the account instantly. Always align your account GEO and proxy GEO with strict precision.",
          ]],
        ],
      },
      {
        id: 'dataimpulse-setup',
        title: 'Buying Mobile Proxies (DataImpulse Setup)',
        blocks: [
          ['p', "For reliable mobile proxies, the ATREOX team frequently uses DataImpulse. They offer a pay-as-you-go model billed by bandwidth (GB) with clean SOCKS5 outputs."],
          ['p', "The exact settings to use when generating your list:"],
          ['kv', [
            ['Targeting', 'Default'],
            ['Country', 'MUST exactly match your account GEO.'],
            ['Rotation Interval', '120s (a safe baseline for background refreshing).'],
            ['Type', 'Rotating'],
            ['Protocol', 'SOCKS5 (The most stable format for Telegram; do not use HTTP/HTTPS).'],
            ['Format', 'login:password@hostname:port or socks5://user:pass@ip:port'],
            ['Quantity', 'Generate exactly one proxy line per account you own.'],
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
          ['p', "Unlike static proxies that are rented per monthly slot, mobile proxies are usually billed by traffic consumption. If your available data balance hits zero in the middle of an active campaign, your network connection drops and every running account goes dark simultaneously."],
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
            { q: 'Which proxies are best for Telegram automation?', a: 'For automation, stable proxies with anchored IPs (either static or carefully managed rotating IPs within the same GEO) are best. They provide predictable account behavior and drastically reduce the risk of deauthorization and bans.' },
            { q: 'Why is it important to use a separate proxy for every account?', a: 'Sharing a single proxy across multiple accounts links their network footprint. If one account gets flagged for spam, Telegram will instantly ban all other accounts sharing that identical IP address. The rule is absolute: 1 Account = 1 Proxy.' },
            { q: 'Can I use rotating proxies for Telegram?', a: "Yes, but only with proper configuration. Rapid, uncontrolled IP changes—especially across different cities or countries—will trigger Telegram's security protocols and result in an instant session logout." },
            { q: 'How do proxies impact account security?', a: 'Proxies are the baseline of your operational security. Unstable, "dirty," or rapidly jumping IP addresses will force Telegram to initiate security checks, apply heavy limits, or permanently ban the session.' },
            { q: 'How can I minimize ban risks when using proxies?', a: 'Always match the proxy GEO to the account GEO, strictly use SOCKS5 formats, respect action limits, utilize the Active Warmup module to gradually increase account activity, and never skimp on network quality.' },
          ]],
        ],
      },
    ],
  },
  {
    slug: 'account-manager',
    url: 'account-manager',
    group: 'module',
    short: 'Import, check, keep alive',
    title: 'Account Manager',
    summary: 'Every control on the Accounts page, what it actually does in the engine, and the order to touch them in on day one.',
    seoTitle: 'Account Manager: every control on the ATREOX accounts page',
    seoDescription:
      'Add and bulk-import accounts, assign one proxy each, and run the three checks — health, proxy, capability. Defaults, rate limits and edge behaviour, taken from the engine.',
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
        ],
      },
    ],
  },
  {
    slug: 'profile-templates',
    url: 'profile-templates',
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
    url: 'active-warmup',
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
    url: 'channel-parser',
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
    url: 'group-parser',
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
    url: 'neurocommenting',
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
    url: 'neurodialogs',
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
    url: 'mass-reactions',
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
});
