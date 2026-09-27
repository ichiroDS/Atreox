
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

   `summary` (one or two sentences) and `can` (short bullets) are the
   Functions page: what the module is for, and what you can do with it
   in the panel. Every bullet names something that exists in the
   dashboard today (atreox-dashboard/app/<module>) — a setting, a
   button, a section. Keep them short; the guide is where the detail
   lives. Nothing that lives in atreox-engine's RESERVED_CONFIG_FIELDS
   belongs here: those are settings the API refuses to write.

   `desc` is the one-liner Home and Pricing show; `tagline` is the pill
   over a module's guide.

   `guide` is the slug of the guide that teaches the module, and
   `guideSection` (optional) the section id inside it when the module is
   taught as part of another guide; moduleGuideHref() below joins them.
   The Functions section for a module is #fn-<key>.
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
    summary: 'Where your Telegram accounts come in and where you see their health. Every other module runs on the accounts you import here.',
    can: [
      'Import one account or a whole batch, from session strings or tdata folders',
      'Give each account its own proxy, reassign proxies and check them',
      'Run checks on any selection: health, proxy, capability and spamblock',
      'See every account’s state at a glance: active, cooldown, spamblock, frozen, needs reauth',
      'Protect bought accounts: Terminate other sessions, Reauthenticate, Download new tdata, Set 2FA',
      'Apply a profile template, reset comment counts, recover from tdata or delete, in bulk',
      'Import history: how each purchased batch is doing',
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
    summary: 'Gives accounts a normal-looking history before they start working: reading channels, reacting, viewing stories and joining groups, on a schedule you set.',
    can: [
      'Intensity presets: Careful, Normal or Aggressive',
      'Work windows in your timezone, with random breaks',
      'Pick which actions run: reading, reactions, story views, joining groups and more',
      'Hourly and daily caps, with a gradual ramp-up for newly added accounts',
      'Economy mode skips traffic-heavy actions (on by default)',
      'Choose the target channels and save your setup as a preset',
    ],
  },
  {
    key: 'profile-templates',
    name: 'Profile Templates',
    price: 0,
    included: true,
    icon: Palette,
    /* No guide of its own: it is taught as a section of Account Manager. */
    guide: 'account-manager',
    guideSection: 'profile-templates',
    desc: 'One face, applied across a batch of accounts.',
    tagline: 'Included with everything',
    summary: 'A name, surname, bio and avatar you set once and apply to many accounts, so a batch does not look like the same empty profile fifty times.',
    can: [
      'Templates with name, surname, bio and avatar',
      'Use {first_name} in the bio so every account reads differently',
      'Apply a template to any selection of accounts in Account Manager',
      'Runs in the background, paced to Telegram’s profile-change limits',
      'Active Warmup can re-apply each account’s template on a schedule',
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
    summary: 'Watches your target channels and comments under new posts from your accounts. Each comment is written for that post by the AI model and persona you choose.',
    can: [
      'Add channels one by one, paste a list, load a preset, or send them over from the Parser',
      'Organise channels into Telegram folders and let the pool work by folders',
      'Personas: build a prompt from fields or write your own, and pick the AI model',
      'Sensitive-content filter skips posts about tragedies, war and politics',
      'Daily comment limit per account (resets at 00:00 UTC) and a delay range between comments',
      'Every comment in a log with its post; channels that refuse comments collected in a blacklist',
      'AI Protection, AI Autoreply for private messages, and advanced join and pace settings',
    ],
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
    summary: 'Answers the private messages your accounts receive, in context. It works in rotation: a few accounts come online, answer the people waiting, and go offline again.',
    can: [
      'Start a run (8 hours by default); it stops by itself',
      'Choose how many accounts are online at once and how many chats each answers per turn',
      'People who are waiting are answered first; older unanswered messages only if you turn on the backlog',
      'Prompt presets with an optional knowledge file, and a choice of AI model',
      'Inbox of conversations and a live log of every reply',
      'AI Protection: accounts also read, scroll and browse while they work',
    ],
  },
  {
    key: 'mass-reactions',
    billing: 'mass_reactions',
    name: 'Mass Reactions',
    price: 30,
    icon: Sparkles,
    guide: 'mass-reactions',
    desc: 'Reacts from a pool of your accounts — to posts, or to the comments under them.',
    tagline: 'The first hour decides',
    summary: 'Adds reactions from a pool of your accounts to new posts in the channels you choose, or to the first comments under them, spread out over time like a real audience.',
    can: [
      'React to the posts, or to the first comments under each post',
      'Choose the emoji, used at random or in order',
      'Control how many accounts react and how the reactions spread over time',
      'Limits per hour, per day, per channel and per account',
      'Pauses an account after a FloodWait instead of pushing on',
      'React without joining, skip messages already reacted to, or do a dry run',
    ],
  },
  {
    key: 'channel-parser',
    billing: 'channel_parser',
    name: 'Channel Parser',
    price: 20,
    icon: Globe,
    guide: 'channel-parser',
    desc: 'Finds channels by keyword and exports them as a target list.',
    tagline: 'Where your audience already is',
    summary: 'Finds Telegram channels by keyword, or channels similar to ones you already have, and filters out the ones that are too small, in the wrong language or have no comments.',
    can: [
      'Keyword search, with suggested word endings to widen it',
      'Similar-channel search from channels you already use',
      'Filters: member range, languages, minimum comments on the last post',
      'Watch the search live and stop it at any time',
      'Send a channel straight to Neurocommenting, or reject it',
      'Copy the results as t.me links',
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
    summary: 'Finds public Telegram groups by keyword and keeps the ones where people actually talk and a new member can post.',
    can: [
      'Keyword search, the same way as the Channel Parser',
      'Filters: member range, messages in the last 7 days, unique senders, languages',
      'Only groups anyone can join, and only groups members can post in',
      'Promote or reject each group, and export the results as CSV',
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
    title: 'Buying accounts',
    short: 'What to buy, how to test it',
    summary:
      'What to look for in accounts and sellers, and how to test a new batch before you buy more.',
    seoTitle: 'How to buy Telegram accounts: format, sellers, testing',
    seoDescription:
      'What to buy (tdata, aged, no spamblock, proxy in the same country), how to judge a seller by negative reviews, and a two-week plan to test a new batch.',
    module: null,
    video: null,
    body: [
      {
        id: 'what-to-buy',
        title: 'What to buy',
        blocks: [
          ['p', "Accounts are the one part of the setup you cannot fix later. Buy by the criteria below, test a small batch, and only buy more from a seller whose batch held up."],
          ['checklist', [
            {
              tone: 'ok',
              title: 'Look for',
              items: [
                ['tdata format.', 'See the next section for why.'],
                ['Aging.', 'The longer the accounts rested after registration, the better.'],
                ['Not sold before.', 'A resold account may still be logged in somewhere else.'],
                ['No spamblock.', 'An account that is already limited is no use for commenting.'],
                ['Country you can match.', "You will need a proxy in the same country as the account's phone number."],
                ['No 2FA password, or the password from the seller.', 'Telegram may ask for the current password when Account Protection creates a new login.'],
              ],
            },
            {
              tone: 'bad',
              title: 'Avoid',
              items: [
                ['Sellers with many negative reviews.', 'Thresholds are below.'],
                ['Resold accounts.', 'Someone else may still hold a working login.'],
                ['Accounts with an unknown 2FA password.', 'You will not be able to secure them.'],
              ],
            },
          ]],
        ],
      },
      {
        id: 'formats',
        title: 'tdata or session',
        blocks: [
          ['p', "Buy tdata. It is the folder Telegram Desktop keeps for a logged-in account, and it is what ATREOX imports in bulk: one .zip with a folder per account (zips per account inside it are fine), up to 100 accounts per import."],
          ['p', "A session string can only be added one account at a time (Import accounts → Single import), together with its api_id and api_hash."],
          ['p', "tdata also lets you log an account in again later. If its session ever dies, Recover from tdata in Account Manager creates a new one. A bare session string cannot be recovered this way."],
        ],
      },
      {
        id: 'sellers',
        title: 'Choosing a seller',
        blocks: [
          ['p', "Seller ratings on account shops are almost always close to perfect, so ignore the score. Open the seller's profile and count the negative reviews."],
          ['table', {
            head: ['Negative reviews', 'Verdict'],
            rows: [
              ['Up to 3', 'Ideal'],
              ['Up to 10', 'OK'],
              ['Up to 50', 'Acceptable'],
              ['Over 100', 'Stay away'],
            ],
          }],
          ['p', "Then look at aging. Between two sellers with a similar review count, pick the one whose accounts rested longer. Treat the aging figure as the seller's claim, not a fact: the last section explains why."],
        ],
      },
      {
        id: 'testing',
        title: 'Testing a new batch',
        blocks: [
          ['p', "Start every new seller with a small batch and give it two weeks before you buy more."],
          ['steps', [
            "Import the batch with one proxy per account. Under About this purchase, fill in Seller and Layover (the aging the seller claimed). They can only be recorded at import, and they are how you compare sellers later.",
            "Select the new accounts and run Checks → Check health and Check capability.",
            "Week 1: put the accounts in Active Warmup and run the protection steps from the Account Protection guide.",
            "Week 2: add them to Neurocommenting with a limit of 3 comments per account per day. Raise the limit by 1 every day.",
            "Compare batches in Account Manager → History: how many are still alive, frozen or unable to post, per seller.",
          ]],
          /* SHOT: Account Manager → History tab, the Batches table with two or three demo imports (Seller, Layover, Bought, Alive now, Frozen, Can't post columns). Seller and provider cells must be neutral demo names that do not resemble real shops or proxy providers. */
          ['note', "The comment limit is a daily limit. It resets at 00:00 UTC, and accounts that reach it resume on their own after that."],
          ['linkout', { href: '/guides/active-warmup', label: 'Active Warmup' }],
          ['linkout', { href: '/guides/account-protection', label: 'Account Protection' }],
        ],
      },
      {
        id: 'aging',
        title: 'What our aging test showed',
        blocks: [
          ['p', "We bought two batches on the same day, from two sellers, and ran them with the same proxy setup and the same warmup. One seller advertised a long aging period; the other claimed none. Within a week most of the long-aging batch was frozen, without having posted a single comment. The other batch held up."],
          ['bullets', [
            "A seller's aging claim on its own does not tell you whether the accounts will last.",
            "Accounts that freeze while doing nothing arrived that way. That is the seller, not your setup.",
            "Accounts that look fine while resting are not proven good yet. Problems often show up once they start working.",
            "One bad batch from a usually decent seller looks exactly like a bad seller. Test every batch, not just every new seller.",
          ]],
          ['linkout', { href: '/guides/proxies-for-telegram-accounts', label: 'Next: Proxies' }],
        ],
      },
    ],
  },
  {
    slug: 'proxies',
    url: 'proxies-for-telegram-accounts',
    group: 'setup',
    title: 'Proxies',
    short: 'One per account, sticky, same country',
    summary:
      'Which proxies to buy for your accounts, and how to add and check them in ATREOX.',
    seoTitle: 'Proxies for Telegram accounts: which type to buy',
    seoDescription:
      'One proxy per account, sticky with a hold time, in the same country as the phone number, mobile preferred. How to add, reassign and check proxies.',
    module: null,
    video: null,
    body: [
      {
        id: 'rules',
        title: 'The rules',
        blocks: [
          ['p', "Every account connects to Telegram through its own proxy. Buy proxies that meet all of these:"],
          ['kv', [
            ['One per account', 'Never put two accounts behind one IP. Account Manager warns you when two active accounts share an exit IP.'],
            ['Sticky, with a hold time', 'The IP must not change while the account is connected. Details below.'],
            ['Same country', "The proxy must be in the same country as the account's phone number."],
            ['Mobile preferred', 'Mobile first, residential second, datacenter last. See below.'],
            ['SOCKS5', 'A proxy line without a type is read as SOCKS5.'],
          ]],
          ['figure', {
            src: '/public/screenshots/proxies-for-telegram-accounts/connection.png',
            w: 1280, h: 472,
            alt: 'Diagram: a Telegram account connects through a SOCKS5 proxy to the internet and then to the Telegram server',
            caption: 'One account, one proxy, one path to Telegram',
          }],
        ],
      },
      {
        id: 'types',
        title: 'Which type',
        blocks: [
          ['options', [
            { text: 'Mobile: IPs of mobile carriers, shared with real phone users. The most natural for Telegram, and the most expensive.', badge: 'Preferred' },
            { text: 'Residential: home internet IPs. Looks like a normal user, costs less than mobile.' },
            { text: 'Datacenter: server IPs. The cheapest and the least trusted. If you use them, keep activity very conservative.' },
          ]],
          ['p', "Compare what a working account costs you, not what a proxy costs. A cheaper proxy that loses more accounts is not cheaper."],
        ],
      },
      {
        id: 'sticky',
        title: 'Sticky, not rotating',
        blocks: [
          ['p', "A rotating proxy changes its IP on a timer. If that happens while an account is connected, Telegram sees one login used from two addresses, treats it as stolen and ends it. Never use timed rotation."],
          ['p', "Buy sticky proxies, and set the hold time: how long a sticky session keeps one IP. Providers call it session time, TTL or lifetime. Set the longest your provider allows. Without it the provider's default applies, and it can be short."],
          ['p', "If a login was already killed this way, the error reads \"The authorization key was used under two different IP addresses simultaneously\". The account is not banned; its session is dead. Fix the proxy first, then log in again with Recover from tdata."],
          ['linkout', { href: '/guides/account-protection', label: 'Account Protection' }],
        ],
      },
      {
        id: 'adding',
        title: 'Adding proxies in ATREOX',
        blocks: [
          ['cards', [
            {
              kicker: 'When you import',
              blocks: [
                ['steps', [
                  'Account Manager → Import accounts → Bulk import, and upload the zip.',
                  'Paste the proxies into the Proxies box, one per line, at least as many as there are accounts.',
                  'Leave Distribute proxies evenly across accounts ticked, and press Import.',
                ]],
                ['p', "Lines are handed out in order. If there are fewer lines than accounts, they are reused and some accounts end up sharing an IP."],
              ],
            },
            {
              kicker: 'For accounts you already have',
              blocks: [
                ['steps', [
                  'Account Manager → Reassign proxies (top right).',
                  'Choose Selected accounts or All active accounts. Narrow the list by country if you need to.',
                  'Paste exactly one line per account: line 1 goes to account 1 in the Pairing order list, line 2 to account 2, and so on.',
                  'Press Preview pairing, check each account\'s country and new proxy, then Apply.',
                ]],
                ['p', "Apply stays locked if a line does not hold its IP, or if an account would move to another country (unless you confirm it). Accounts connected right now are skipped. Changes take effect on each account's next connect."],
              ],
            },
          ]],
          /* SHOT: Account Manager → Reassign proxies dialog after Preview pairing: Pairing order list on the left, proxy lines on the right, and the preview table (Line, Account, Country, New proxy, Exit = held). Demo proxy lines only, no real provider hostnames. */
          ['p', "For a single account: click its row, and in Overview → Proxy press Edit proxy, paste the line and press Save proxy."],
          ['p', "Accepted formats (the type is socks5 or http; without one, SOCKS5 is assumed):"],
          ['bullets', [
            'type:host:port:user:pass',
            'host:port:user:pass',
            'user:pass@host:port',
            'type://user:pass@host:port',
          ]],
        ],
      },
      {
        id: 'checking',
        title: 'Checking a proxy',
        blocks: [
          ['p', "Select accounts and run Checks → Check proxy, or open one account and press Check proxy under Actions. You get a verdict (Works with Telegram, Proxy works, Telegram refused, or No connection to the proxy), the country of the exit IP and the country Telegram sees."],
          /* SHOT: Account detail → Overview → Actions after Check proxy: the "Works with Telegram" verdict line with latency, exit IP country and "Telegram sees" country. */
          ['p', "If the two countries differ, Telegram goes by the one it sees. Fix the proxy before the account does any work."],
          ['p', "Account Manager also shows a warning when accounts sit on a proxy that does not hold its IP, and offers to move them to new proxies."],
          ['toolcta', {
            tool: 'proxy-checker',
            angle: 'Check a proxy before you put an account on it: the free checker says whether it works with Telegram and whether it holds its IP.',
          }],
          ['linkout', { href: '/guides/account-manager', label: 'Next: Account Manager' }],
        ],
      },
    ],
  },
  {
    slug: 'account-manager',
    url: 'account-manager',
    group: 'module',
    short: 'Import, check, manage',
    title: 'Account Manager',
    summary: 'Import accounts, give each one its own proxy, check them, read their status and act on many at once. Also covers spamblock, freeze and shadow-ban, and profile templates.',
    seoTitle: 'Telegram Account Manager: import, check and manage accounts in bulk',
    seoDescription:
      'Import Telegram accounts from tdata in bulk, give each its own proxy, run health, capability and spamblock checks, read the status tiles and apply profile templates.',
    module: 'account-manager',
    video: null,
    body: [
      {
        id: 'what-it-is',
        title: 'What it is',
        blocks: [
          ['p', "Account Manager is where accounts enter ATREOX. You import them here, give each one a proxy, check them, and every module takes its accounts from this list. The page has two tabs at the top: Manager (the accounts) and History (how each imported batch has held up)."],
          ['figure', {
            src: '/public/screenshots/account-manager/accounts-table.png',
            w: 1400, h: 855,
            alt: 'Account Manager list: one row per account with Protected shield, Comments, Last used, Added, Proxy flag, Supervise, Check and Status columns',
            caption: 'One row per account. Click a row to open that account.',
          }],
          ['table', {
            head: ['Column', 'What it shows'],
            rows: [
              ['Protected', 'The protection shield: grey until all five protection steps are done, blue at 5/5. Click it to see which steps are left.'],
              ['Comments', 'How many comments the account has posted.'],
              ['Last used', 'When a module last used the account.'],
              ['Added', 'When you imported it.'],
              ['Proxy', "The flag of the proxy's country from the last check. Green ring: worked in the last 24 hours. Red: the last check failed. Grey: not checked, or checked more than a day ago. Two flags with ≠ between them: Telegram sees the account in a different country than the proxy's exit IP."],
              ['Supervise', 'Days since import as x/7 when Supervise is on, a dash when it is off.'],
              ['Check', 'The result of the last capability check: ok, not checked, check failed, frozen, can’t resolve or can’t post.'],
              ['Status', 'The account’s state: active, cooldown, paused, spamblock, banned and so on.'],
            ],
          }],
        ],
      },
      {
        id: 'import',
        title: 'Import accounts',
        blocks: [
          ['steps', [
            "Press Import accounts (top right). Bulk import opens first.",
            "Select the zip the purchase came in: one folder per account with its tdata inside. Per-account zips inside it are fine. Each folder becomes one account, named after the folder. A folder that can't be read is listed with the reason, and the rest still import.",
            "Paste your proxies into Proxies, one per line (show formats lists the accepted formats). Paste one proxy per account.",
            "Optionally fill in About this purchase: Seller, Type of proxy, Layover and Provider. It is saved only if you type it now, and it is what the History tab groups batches by.",
            "Press Import. Up to 100 accounts per import; for more, import the rest in a second run.",
          ]],
          ['figure', {
            src: '/public/screenshots/account-manager/import-dialog.png',
            w: 1344, h: 515,
            alt: 'Bulk import accounts dialog with Bulk import and Single import tabs and a Select Files field for the purchase zip',
            caption: 'Bulk import takes the zip exactly as the seller sent it.',
          }],
          ['p', "Single import is for one account you already have as a session string: it asks for an ID, the session string, api_id, api_hash, and optionally a proxy."],
          ['p', "The History tab shows one row per imported batch: when it was imported, the seller and proxy details you entered, how many accounts were bought, how many are alive now, and how many are dead, frozen or can't post."],
        ],
      },
      {
        id: 'proxies',
        title: 'Proxies',
        blocks: [
          ['p', "Every account needs its own proxy, sticky (never rotating) with a hold time, in the same country as the account's phone number. The page warns you when that is not the case:"],
          ['kv', [
            ['Red banner', "Several active accounts share one proxy. Reassign now gives them separate proxies. If the sharing is on purpose, This is intentional — keep them silences the warning until another account joins that proxy."],
            ['Amber banner', "Accounts on a proxy that does not hold its exit IP. The IP can change while the account is connected, and Telegram then ends the session. Click the number to show those accounts; the banner offers to add a hold time or to reassign them."],
            ['Reassign proxies', "Top right. Choose the accounts, paste one proxy line per account, and press Preview to see which proxy goes to which account before anything is saved. It applies only when the number of lines matches the number of accounts and every line holds its exit IP."],
          ]],
          ['p', "For one account, open it and use Edit proxy in its Proxy block."],
          ['linkout', { href: '/guides/proxies-for-telegram-accounts', label: 'How to choose proxies' }],
        ],
      },
      {
        id: 'checks',
        title: 'Checks',
        blocks: [
          ['p', "Select accounts, open the Checks folder and pick a check. Run Check capability on every new batch: the engine does not use an account until its capability check has run."],
          ['figure', {
            src: '/public/screenshots/account-manager/bulk-checks.png',
            w: 1400, h: 364,
            alt: 'Checks folder open in the bulk actions bar: Check health, Check proxy, Check capability, Check spamblock',
            caption: 'The Checks folder.',
          }],
          ['table', {
            head: ['Check', 'What it tells you'],
            rows: [
              ['Check health', "Whether the session is still logged in, or the account is banned or deleted. It cannot see a spamblock or a freeze."],
              ['Check proxy', "Whether the proxy works and reaches Telegram, its speed, and which country Telegram sees. It never touches the account's session."],
              ['Check capability', "Whether the account can do what the modules need: find a public channel by username, read it and post. Shows ok, frozen, can't resolve or can't post in the Check column. check failed means it could not decide (timeout, dead proxy); run it again."],
              ['Check spamblock', "Asks @SpamBot, Telegram's own bot, whether the account is limited. This one sends one message to @SpamBot; the other three send nothing."],
            ],
          }],
          ['p', "Each check can run on the same account once every five minutes."],
        ],
      },
      {
        id: 'statuses',
        title: 'Status tiles',
        blocks: [
          ['p', "The seven tiles count your accounts by state. Click a tile to show only those accounts; click it again to show all."],
          ['figure', {
            src: '/public/screenshots/account-manager/status-tiles.png',
            w: 1400, h: 102,
            alt: 'Seven status tiles: Active, In work, Unchecked, Spamblock, Invalid, Frozen, Needs reauth',
            caption: 'Every account is in exactly one tile, except In work, which is part of Active.',
          }],
          ['table', {
            head: ['Tile', 'Means', 'What to do'],
            rows: [
              ['Active', 'Healthy accounts. Accounts in cooldown, at their daily limit or paused are counted here too; the row says which.', 'Nothing.'],
              ['In work', 'Active accounts a module is using right now (commenting pool, a Parser search, folder creation). Hover for the split.', 'Nothing.'],
              ['Unchecked', 'No capability check yet, or the proxy is down so the engine cannot reach the account.', 'Run Check capability; if the row says proxy down, fix the proxy.'],
              ['Spamblock', '@SpamBot says the account is limited, or its capability check says can’t post.', 'See Spamblock, freeze and shadow-ban below.'],
              ['Invalid', 'Banned, or a session Telegram has rejected. Importing the same tdata again will not bring it back.', 'If you have a backup from Download new tdata, use Recover from tdata. Otherwise delete it.'],
              ['Frozen', 'The capability check came back frozen or can’t resolve.', 'See below. Do not delete it right away.'],
              ['Needs reauth', 'The engine failed to reconnect it three times in a row, or it is not responding. Accounts you parked as disabled are counted here too.', 'Recover from tdata, or check the proxy if the row says not responding.'],
            ],
          }],
        ],
      },
      {
        id: 'bulk-actions',
        title: 'Bulk actions',
        blocks: [
          ['p', "Tick accounts (shift-click selects a range), then open one of the three folders above the list. Actions run only on the ticked accounts you can see; one bulk action runs at a time."],
          ['figure', {
            src: '/public/screenshots/account-manager/bulk-accounts.png',
            w: 1400, h: 495,
            alt: 'Accounts folder open: Apply template, Reset counts, Leave folders, Supervise, Recover from tdata, Delete accounts',
            caption: 'The Accounts folder. Checks and Protection sit beside it.',
          }],
          ['kv', [
            ['Apply template', 'Puts a profile template on the selected accounts. See Profile templates below.'],
            ['Reset counts', "Sets today's comment counter back to zero, so accounts stopped at their daily comment limit can post again today. The limit itself does not change."],
            ['Leave folders', 'Takes the accounts out of the Telegram folders they joined through ATREOX, and by default out of those folders’ channels too.'],
            ['Supervise', 'Keeps the accounts out of Neurocommenting, NeuroDialogs and Mass Reactions until seven days after import. The Supervise column counts x/7. The days count from import, not from when you press it, and it cannot be switched off; it ends by itself at 7/7.'],
            ['Recover from tdata', 'Replaces a dead session with a new one from a tdata upload: one account, or several from one upload.'],
            ['Delete accounts', 'Removes the accounts after a confirmation. Cannot be undone.'],
            ['Checks', 'The four checks above.'],
            ['Protection', 'Terminate other sessions, Reauthenticate, Download new tdata, Set 2FA. See Account Protection.'],
          ]],
          ['linkout', { href: '/guides/account-protection', label: 'Account Protection: the step-by-step sequence' }],
        ],
      },
      {
        id: 'one-account',
        title: 'One account',
        blocks: [
          ['p', "Click a row to open the account. It has three tabs:"],
          ['kv', [
            ['Overview', 'Display name (a label inside ATREOX only), the proxy with Edit proxy and Clear proxy, the checks for this account, and Danger zone, where you can set the status by hand. Set it to disabled to park an account: no module will use it until you set it back to active.'],
            ['Profile', "The real Telegram profile: first name, last name, username, bio and avatar (up to 5 MB). One profile change per account per hour; a username change once per 48 hours."],
            ['Protection', 'The five protection steps with their buttons, and a history of every attempt.'],
          ]],
        ],
      },
      {
        id: 'spamblock-frozen-shadowban',
        title: 'Spamblock, freeze and shadow-ban',
        blocks: [
          ['p', "Three different restrictions get called “blocked”. Each shows up differently and needs a different response."],
          ['table', {
            head: ['', 'What it is', 'How the dashboard shows it', 'What to do'],
            rows: [
              ['Spamblock', 'Telegram limits the account from sending, usually after too much activity or reports.', 'Spamblock tile; spamblock on the row after Check spamblock.', 'Take it out of its module and let it rest. Open @SpamBot in Telegram: it says whether the limit is temporary and until when, and lets you ask for a review.'],
              ['Write-ban', 'Telegram refuses the account’s messages, while it can still read.', 'Spamblock tile; can’t post in the Check column after Check capability.', 'Modules stop using it. The engine re-checks it by itself a day after the verdict; if it can post again, it goes back to work.'],
              ['Frozen', 'Telegram blocks the account from finding channels by username and reading them. Check health cannot see it.', 'Frozen tile; frozen or can’t resolve in the Check column after Check capability.', 'Do not delete it straight away. Modules stop using it, and the engine re-checks it by itself once the verdict is 7 days old; if it passes, it goes back to work.'],
              ['Shadow-ban', 'Comments look sent but nobody else sees them. Telegram gives no status for this.', 'Nothing directly: the account keeps posting, but its comments do not appear.', 'Look at the channel from another account. If the comments are missing, take the account out of work and run Check capability.'],
            ],
          }],
          ['p', "Accounts waiting for that automatic re-check are listed in a notice at the top of the page, with when the next batch runs."],
        ],
      },
      {
        id: 'profile-templates',
        title: 'Profile templates',
        blocks: [
          ['p', "An account with no picture, no bio and a default name looks like a bot to anyone who clicks it. A template is a profile you build once — name, surname, bio and avatar — and put on a whole batch."],
          ['steps', [
            "Open Profile Templates in the sidebar and press New template.",
            "Fill in Template name (only you see it), Name, Surname (optional), Description (the bio) and Avatar (optional, PNG or JPEG up to 5 MB).",
            "In Description, {first_name} is replaced by the template's Name. Keep an eye on the second counter: the bio after that replacement must fit in 70 characters.",
            "Press Create.",
            "In Account Manager, tick the accounts, open Accounts, press Apply template and pick the template. Closing the dialog does not stop it; a progress widget in the corner keeps track.",
          ]],
          ['figure', {
            src: '/public/screenshots/account-manager/template-dialog.png',
            w: 1024, h: 1248,
            alt: 'Create template dialog with Template name, Name, Surname, Description with 200 and 70 character counters, and Avatar',
            caption: 'Every account the template is applied to gets exactly these values.',
          }],
          ['p', "Every account gets exactly the same name, bio and picture. If you want a batch that does not look like one batch, make several templates and apply each to a different group."],
          ['p', "Applying is paced: one profile change per account per hour, 30–90 seconds between accounts, and three Telegram flood-waits in a row pause the run for 30 minutes. An account changed less than an hour ago is skipped and reported."],
          ['callout', [
            "A/B testing templates: create a separate Telegram invite link to your own channel for each template (Telegram lets one channel have many invite links and shows how many people joined through each) and put each link in its template's bio. A fair test needs at least 100 accounts per template, all posting about the same number of comments over a week. Then compare joins per link.",
          ]],
        ],
      },
      {
        id: 'first-day',
        title: 'A new batch, in order',
        blocks: [
          ['steps', [
            "Import the batch with one proxy per account.",
            "Select all and run Check health, then Check capability. Check spamblock too if you want to know the starting state.",
            "Press Supervise, so no outreach module can use the accounts during their first seven days.",
            "Start the protection sequence and, in parallel, Active Warmup for one week.",
            "Apply a profile template.",
            "After the week, start Neurocommenting at 3 comments per account per day and raise the daily limit by 1 every day.",
          ]],
          ['linkout', { href: '/guides/account-protection', label: 'Next: Account Protection' }],
        ],
      },
    ],
  },
  {
    slug: 'account-protection',
    url: 'account-protection',
    group: 'module',
    short: 'Make a bought account yours',
    title: 'Account Protection',
    summary: "A bought account still shares its login with the seller. Follow this sequence over three days to get a login of your own, log the seller out, keep a backup and set a password.",
    seoTitle: 'Protect a bought Telegram account: terminate sessions, reauthenticate, 2FA',
    seoDescription:
      "A purchased Telegram session shares the seller's login key. The step-by-step sequence to make it yours: terminate other sessions, reauthenticate, back up the new tdata and set 2FA.",
    module: null,
    video: null,
    body: [
      {
        id: 'why',
        title: 'Why protect a bought account',
        blocks: [
          ['p', "A bought account arrives already logged in, on the seller's login key. Importing it gives you that key, but the seller still has it too. With it they can log every other session out, including yours, and sell the account again."],
          ['p', "The sequence below gives the account a login of your own, logs the seller's copy out, makes a backup login and sets a cloud password."],
        ],
      },
      {
        id: 'the-sequence',
        title: 'The sequence',
        blocks: [
          ['steps', [
            "Import the account with its own proxy. Wait 24 hours and change nothing.",
            "Terminate other sessions. Logs out every other device, including extra sessions the seller opened. The imported session itself stays.",
            "Reauthenticate. Creates a brand-new session of your own and switches ATREOX to it. The key you bought is no longer used.",
            "Wait 24 hours. Telegram does not let a session younger than 24 hours log others out.",
            "Terminate other sessions again. Now it runs from your own session, so it also logs out the imported key — including every copy the seller kept. This is the step that makes the account yours.",
            "Wait 24 hours.",
            "Download new tdata. Creates a separate backup login and downloads it as a zip. It comes after the second Terminate because that step would have logged the backup out too.",
            "Set 2FA. Adds a cloud password, so a code sent to the phone number is no longer enough to log in. It goes last: a password set while the seller still shares the session does not remove them.",
          ]],
          ['p', "If you run Terminate other sessions too early, the dialog says Retry after with a time. Nothing is lost; run the same step again then."],
        ],
      },
      {
        id: 'running-it',
        title: 'Running it in the dashboard',
        blocks: [
          ['p', "Select accounts in Account Manager and open the Protection folder. Its four actions are listed in order; Terminate other sessions is used twice. Each opens a dialog that goes through the accounts one by one and shows a result for each. The same four buttons are on the Protection tab of each account."],
          ['figure', {
            src: '/public/screenshots/account-protection/bulk-protection.png',
            w: 1400, h: 364,
            alt: 'Protection folder open: Terminate other sessions, Reauthenticate, Download new tdata, Set 2FA',
            caption: 'The Protection folder in Account Manager.',
          }],
          ['controls', [
            {
              id: 'ctl-terminate-sessions', name: 'Terminate other sessions', where: 'Bulk actions · Protection', kind: 'button', value: 'Terminate other sessions',
              rows: [
                ['What it does', 'Ends every Telegram session on the account except the one ATREOX is using.'],
                ['Used twice', 'Once from the imported session, once from your new one after Reauthenticate.'],
                ['Too soon', 'Refused while the current session is under 24 hours old. The row shows when to retry.'],
              ],
            },
            {
              id: 'ctl-protect-reauth', name: 'Reauthenticate', where: 'Bulk actions · Protection', kind: 'button', value: 'Reauthenticate',
              rows: [
                ['What it does', 'Creates a new session, checks it belongs to the same account, and switches ATREOX to it.'],
                ['Existing password', 'If the account already has a 2FA password, enter it in the row.'],
              ],
            },
            {
              id: 'ctl-download-session', name: 'Download new tdata', where: 'Bulk actions · Protection', kind: 'button', value: 'Download new tdata',
              rows: [
                ['What it does', 'Creates a separate backup session and downloads it as a zip with tdata and a session file. ATREOX keeps using the working session.'],
                ['One hour', 'The download link works for an hour. Download tdata in the row fetches the same backup again.'],
              ],
            },
            {
              id: 'ctl-set-2fa', name: 'Set 2FA', where: 'Bulk actions · Protection', kind: 'button', value: 'Set 2FA',
              rows: [
                ['What it does', 'Sets the cloud password: the new password twice and an optional hint, plus the current password if one exists.'],
                ['One password per run', 'The same new password goes on every account in the run. Save it before you press the button.'],
              ],
            },
          ]],
          ['figure', {
            src: '/public/screenshots/account-protection/shield-2of5.png',
            w: 704, h: 624,
            alt: 'Protection shield popover: 2 of 5 required protection measures applied, with the remaining steps listed',
            caption: 'Click a shield to see which steps are done.',
          }],
          ['kv', [
            ['The shield', 'Counts the five actions (not the waits). Grey until all five succeed in order, blue at 5/5.'],
            ['Out of order', 'An action run out of order starts the count again from Terminate other sessions. A failed step does not; press Retry this account.'],
            ['Account in use', 'An account a module is using right now is refused with Account is in use. Stop the module or wait, then retry.'],
            ['Recover from tdata', 'Replaces the working session, so the shield goes back to 0/5.'],
          ]],
        ],
      },
      {
        id: 'backup',
        title: 'The backup',
        blocks: [
          ['p', "The zip from Download new tdata is a full login: whoever has the file has the account. Keep it offline and do not log in with it anywhere."],
          ['p', "If Telegram ever ends the working session, load the backup with Recover from tdata in the Accounts folder. It only helps if the backup login itself is still alive."],
        ],
      },
      {
        id: 'session-killed-by-ip',
        title: 'Session killed by a moving IP',
        blocks: [
          ['p', "Sometimes an account stops connecting and looks banned, but the account is fine — only its session is dead. Telegram answers with AUTH_KEY_DUPLICATED: the same login key was used from two IP addresses at once, so Telegram treats it as copied and revokes it. ATREOX counts such an account under Invalid."],
          ['p', "Two things cause it:"],
          ['bullets', [
            "The proxy's exit IP changed while the account was connected — a rotating proxy, or a sticky one without a hold time.",
            "The same session was opened in a second place: another tool, your own computer, or a copy of the session file.",
          ]],
          ['p', "To prevent it: one sticky proxy per account, with a hold time, and never open the working session anywhere else while ATREOX runs it."],
          ['p', "If it has happened: do not reconnect the same session or re-import the same tdata — that key is dead. Fix the proxy first, then load your backup with Recover from tdata."],
        ],
      },
      {
        id: 'ai-protection',
        title: 'AI Protection',
        blocks: [
          ['p', "The sequence protects the login. AI Protection protects the behaviour: while an account works in Neurocommenting, NeuroDialogs or Mass Reactions, it also does what a person does — reads channels and groups, scrolls, views posts and stories, looks through its settings, likes a post, archives a chat."],
          ['figure', {
            src: '/public/screenshots/account-protection/ai-protection.png',
            w: 1400, h: 325,
            alt: 'AI Protection block with Off, Low, Medium and High levels and the (i) explanation open, showing the actions in the last 24 hours',
            caption: 'The (i) explains the chosen level and shows how many actions ran in the last 24 hours.',
          }],
          ['p', "Neurocommenting has it in the Settings section at the bottom of the page; NeuroDialogs and Mass Reactions have it right under Control. Each module has its own level. The default is Medium. The level only changes how often it happens:"],
          ['table', {
            head: ['Level', 'Neurocommenting', 'NeuroDialogs', 'Mass Reactions'],
            rows: [
              ['Off', 'Only the module’s own work', 'Only the module’s own work', 'Only the module’s own work'],
              ['Low', 'About every 25 min per account', 'Every 3–7 min between replies', '1 in 4 reactions preceded by browsing'],
              ['Medium', 'About every 10 min', 'Every 1–3 min', 'Every other reaction'],
              ['High', 'About every 4 min', 'Every minute or two', 'Almost every reaction'],
            ],
          }],
          ['bullets', [
            "It uses only the account's own channels and groups: no new usernames looked up, nothing joined.",
            "Private chats are never opened, read or archived.",
            "It runs on the connection the module already has — no second login, no second IP.",
          ]],
        ],
      },
    ],
  },
  {
    slug: 'active-warmup',
    url: 'active-warmup',
    group: 'module',
    short: 'Human activity before work',
    title: 'Active Warmup',
    summary: 'Accounts read, scroll and react like ordinary users so they have a history before they start commenting. How to start it, what each setting does, and how long to warm a new batch.',
    seoTitle: 'Warm up Telegram accounts before commenting: Active Warmup',
    seoDescription:
      'Warm up new Telegram accounts for a week before they comment: human-like reading, reactions and joins, safe hourly and daily caps, schedules, and how to start commenting after.',
    module: 'active-warmup',
    video: null,
    body: [
      {
        id: 'what-it-is',
        title: 'What it does',
        blocks: [
          ['p', "Active Warmup has accounts do ordinary things — read channels, scroll, mark messages read, search, and later react and join — so that when they start commenting they have a history behind them."],
          ['callout', [
            "Testing a new batch: give it one week of Active Warmup and protection first. Then start Neurocommenting at 3 comments per account per day and raise the daily limit by 1 every day. The limit is set in the Neurocommenting Commenting Pool (Set limit) and resets at 00:00 UTC.",
          ]],
          ['p', "Active Warmup is separate from Supervise in Account Manager. Supervise only keeps accounts out of the outreach modules for seven days after import; it does not make them do anything. Turning one on does not turn on the other."],
        ],
      },
      {
        id: 'start',
        title: 'Start warming a batch',
        blocks: [
          ['steps', [
            "Open Active Warmup. In Warmup Pool, tick accounts under Available accounts.",
            "Check the settings below (Schedule, Safety limits, Warmup actions, Target channels). They apply to every account you ticked.",
            "Press Enable (N accounts) at the top.",
          ]],
          ['figure', {
            src: '/public/screenshots/active-warmup/warmup-pool.png',
            w: 1400, h: 375,
            alt: 'Warmup Pool: Available accounts on the left, Supervised accounts on the right with Active - Normal and Active - Careful badges',
            caption: 'Enrolled accounts move to the right, with their current intensity.',
          }],
          ['p', "Enrolled accounts stay enrolled until you stop them: Disable on a row, or Stop all at the top. Edit (the pencil) loads one account's settings so you can change just that account. However many accounts are enrolled, only 3 are connected and working at the same time."],
        ],
      },
      {
        id: 'schedule',
        title: 'Schedule',
        blocks: [
          ['figure', {
            src: '/public/screenshots/active-warmup/schedule.png',
            w: 1400, h: 466,
            alt: 'Schedule section: Auto-adapt by account stage, two activity windows 09:00-11:00 and 15:00-18:00, Client timezone, Random breaks',
            caption: 'Accounts act only inside the activity windows.',
          }],
          ['kv', [
            ['Auto-adapt by account stage', 'On by default. Picks the intensity from how long ago the account was imported: under 7 days Careful, 7–30 days Normal, over 30 days Aggressive.'],
            ['Activity windows', 'The hours accounts may act, in the timezone below. Default: 09:00–11:00 and 15:00–18:00. With no windows, accounts may act at any hour, still within their caps.'],
            ['Client timezone', 'The timezone the windows are read in.'],
            ['Random breaks', 'On by default. Now and then makes the pause between two actions much longer, so activity is not evenly spaced.'],
          ]],
        ],
      },
      {
        id: 'limits',
        title: 'Safety limits',
        blocks: [
          ['p', "Caps per account. While Auto-adapt is on, the four fields are greyed out and the caps come from the preset the account's age picks:"],
          ['table', {
            head: ['Preset', 'Actions / hour', 'Actions / day', 'Joins / day', 'Saved Messages / day'],
            rows: [
              ['Careful', '3', '10', '1', '2'],
              ['Normal', '5', '15', '2', '3'],
              ['Aggressive', '8', '25', '3', '5'],
              ['Maintenance', '2', '6', '1', '1'],
            ],
          }],
          ['figure', {
            src: '/public/screenshots/active-warmup/safety-limits.png',
            w: 1400, h: 252,
            alt: 'Safety limits: Actions per hour, Actions per day, Joins per day, Saved Messages per day, and the Progressive increase switch',
            caption: 'Turn Auto-adapt off to pick a preset or type your own caps.',
          }],
          ['kv', [
            ['Progressive increase', 'On by default. Day 1 of warmup runs at 30% of the caps, rising to 100% by day 7.'],
            ['Maintenance', 'Not something you pick. After 60 days in warmup, an account drops to these low caps by itself.'],
            ['Joins / day', 'Counts only joining groups and channels. 0 means the account never joins.'],
            ['Saved Messages / day', "Counts the two Saved Messages actions. They only write to the account's own Saved Messages, never to other people."],
          ]],
        ],
      },
      {
        id: 'actions',
        title: 'Warmup actions',
        blocks: [
          ['p', "Twenty actions in nine groups, each switched on or off. By default only the four Reading actions are on: View dialogs, Scroll channel, Mark as read and Search messages."],
          ['figure', {
            src: '/public/screenshots/active-warmup/warmup-actions.png',
            w: 1400, h: 1496,
            alt: 'Warmup actions checklist grouped into Reading, Activity, Entertainment, Social, Groups, Profile, Reactions, Story views and Joining groups',
            caption: 'Reading only by default. Badges show what is blocked and why.',
          }],
          ['kv', [
            ['3+ days old', 'Reactions, Story views and Joining groups work only on accounts imported at least 3 days ago.'],
            ['Economy mode', 'On by default. Turns off the traffic-heavy actions (videos, voice messages, GIFs and inline bots, sticker packs, story views), which use a lot of proxy traffic.'],
            ["Reapply account's template", "Re-applies the profile template the account already has. Does nothing on an account that never had one."],
            ['Never', 'Accounts never message each other. There is no such action.'],
          ]],
        ],
      },
      {
        id: 'targets',
        title: 'Target channels',
        blocks: [
          ['kv', [
            ['Channel list', 'Optional. Channels for these accounts to read and join, separated by commas or new lines. Left empty, accounts read channels that Channel Parser has found. While that list has fewer than 20 channels, accounts without their own list only view their dialogs.'],
            ['Allow reading/joining my own channels', 'Off by default. A fresh account that reads only your own channels is a giveaway, so turn it on only for accounts past their first warmup stage.'],
          ]],
        ],
      },
      {
        id: 'watching',
        title: 'Watching it work',
        blocks: [
          ['kv', [
            ['Statistics', 'Supervised (enrolled), Active now, and Outside window (waiting for their next window).'],
            ['Row badge', 'Each enrolled account shows what it is doing and at which intensity, for example Active — Careful.'],
            ['Engine log', 'Under Module control at the top; every warmup action appears there.'],
            ['Flood-waits', 'If Telegram asks an account to slow down three times in a row, that account pauses for 30 minutes. The others keep going.'],
          ]],
          ['linkout', { href: '/guides/neurocommenting', label: 'Next: Neurocommenting' }],
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
          ['figure', {
            src: '/public/screenshots/channel-parser/search.png',
            w: 1400, h: 1544,
            alt: 'Channel Parser keyword search form with keywords, accounts, members range, languages and max results',
            caption: 'The search form: keywords, the accounts that search, and the filters.',
          }],
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
          ['figure', {
            src: '/public/screenshots/channel-parser/results.png',
            w: 1400, h: 810,
            alt: 'Channel Parser results table with members, language, score and Start commenting / Reject buttons',
            caption: 'Results, best score first. Start commenting sends a channel straight to Neurocommenting.',
          }],
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
          ['figure', {
            src: '/public/screenshots/group-parser/search.png',
            w: 1400, h: 1680,
            alt: 'Group Parser search form with keywords, members range, languages, activity and access filters',
            caption: 'The group search: size, language, activity and access filters.',
          }],
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
          ['figure', {
            src: '/public/screenshots/group-parser/results.png',
            w: 1400, h: 365,
            alt: 'Group Parser results with members, messages in 7 days, senders, slow mode and Allow in DMs / Reject buttons',
            caption: 'Group results with activity figures and the actions for each group.',
          }],
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


/* The research article: rendered by the Guides reader at its own public
   address under /blog, but in no folder - its conclusions are taught in
   the Buying accounts guide, and the article stays as the evidence. */
GUIDES.push(...window.RESEARCH_GUIDES.map(g => ({
  ...g, url: g.slug, group: 'research', module: null, video: null,
  path: '/blog/' + g.slug,
})));

/* Public guide folders are shared by the index, reader and prerenderer.
   Every guide in GUIDES except the research article sits in exactly one
   folder (scripts/verify-guide-navigation.mjs holds that). A url listed
   here with no guide behind it is dropped rather than crashing the page;
   the same script fails the build on it, so it never ships. */
const GUIDE_FOLDER_SPECS = [
  { id: 'start', title: 'Start here',
    urls: ['buying-telegram-accounts', 'proxies-for-telegram-accounts'] },
  { id: 'protection', title: 'Protection',
    urls: ['account-manager', 'account-protection', 'active-warmup'] },
  { id: 'modules', title: 'Modules',
    urls: ['channel-parser', 'group-parser', 'neurocommenting', 'neurodialogs', 'mass-reactions'] },
];
const GUIDE_FOLDERS = GUIDE_FOLDER_SPECS.map(f => ({
  ...f, guides: f.urls.map(url => GUIDES.find(g => g.url === url)).filter(Boolean),
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

/* Where a module is taught: its guide's address, plus the section when
   the module is a chapter of another guide (Profile Templates lives in
   Account Manager). null when no guide covers it. */
const moduleGuideHref = m => {
  const guide = m && GUIDE_BY_SLUG[m.guide];
  return guide ? guideHref(guide) + (m.guideSection ? '#' + m.guideSection : '') : null;
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
  guideHref, guideFromPath, moduleGuideHref,
  TOOLS, TOOL_BY_ID, BLOCK_KINDS,
});
