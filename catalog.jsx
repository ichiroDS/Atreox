
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
          ['p', "It shares its page with Group Parser. The Channels and Groups tabs in the top bar switch between them, and each has its own form, its own results and its own history."],
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
            { name: 'Parser tabs', holds: 'Channels · Groups, in the top bar. The switch between two different tools sharing one address.' },
            { name: 'Search control', holds: 'The run state, Start search, Cancel run while one is going, and the last run\'s tally.' },
            { name: 'Progress', holds: 'Directly under the control while a run is going: which chunk it is on, and a live log of what each account is deciding.' },
            { name: 'Search', holds: 'Two mode tabs — Keyword search · Similar channels — sharing every filter: keywords and optional endings, accounts, members range, languages, minimum comments on the last post, and how many results to stop at.' },
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
          ['p', "Group Parser finds public groups — the rooms where people talk to each other, rather than channels where one account broadcasts. It lives on the same page as Channel Parser, behind the Groups tab in the top bar."],
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
            { name: 'Parser tabs', holds: 'Channels · Groups, in the top bar. This guide is the second one.' },
            { name: 'Search control', holds: 'The run state, Start search, and Cancel run while one is going.' },
            { name: 'Progress', holds: 'Directly under the control while a run is going: the chunk it is on, and the live log of what each account decided about each candidate.' },
            { name: 'Search', holds: 'Keywords and endings, accounts, members range, languages, the two activity floors, the two access switches, and how many results to stop at.' },
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
             "dQw4w9WgXcQ". While it is null the block renders nothing at
             all (no empty frame) - so if it goes back to null, remove
             this section's sentence about watching it too.

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
          ['p', "It is one page with nine regions, and a jump-nav across the top lists them in this order: Control, AI Protection, Pool, Stats, Comments, Channels, Blacklist, Model, Persona. Under Persona, at the very bottom, sits a tenth strip, Advanced settings. It stays collapsed until you click it and is not in the jump-nav. Nothing here is a separate screen — the dialogs are the only things that open on top."],
          ['callout', [
            "Start does not keep one session running forever. The engine caps a single session at ten hours by default: at the top of the round where that is reached it stops itself cleanly. What happens next is the Auto-continue switch beside Start. On, which is the default, the engine takes a random break of 90 to 210 minutes and starts the next session by itself, and the panel says when. Off, the session that hit the cap is the last one and the engine stays stopped until you press Start. A service restart is not a stop: a running engine comes back on its own a minute or two after the service does.",
          ]],
        ],
      },
      {
        id: 'map',
        title: 'Map of the page',
        blocks: [
          /* СКРИН 1: верх страницы Neurocommenting — полоса jump-nav (Control, AI Protection, Pool, Stats, Comments, Channels, Blacklist, Model, Persona) и блок Control под ней. */
          ['map', [
            { name: 'Control', holds: 'The run state and uptime, the Start/Stop button, the Auto-continue and Warmup switches, Delay settings, and the engine log.' },
            { name: 'AI Protection', holds: 'One four-way switch, Off, Low, Medium or High: how often working accounts also read, scroll and browse like a person, and how many such actions they made in the last 24 hours.' },
            { name: 'Pool', holds: 'Two columns of accounts, available and in the pool, then Comment Limits: the assignment buttons, the Work by folders switch, the daily limit controls, and the per-account list of which channels each account owns.' },
            { name: 'Statistics', holds: 'What the pool has produced: total attempts, successful, failed sends and success rate. The jump-nav calls it Stats.' },
            { name: 'Comments', holds: 'Every comment event, newest first, fifty to a page, with the full text and the post it answered behind each row.' },
            { name: 'Channels', holds: 'The monitored channel list — what the engine watches — with the catch-up limit, the Telegram folders built from a preset, and the presets that save a list and reload it later.' },
            { name: 'Blacklist', holds: 'Channels not worth commenting on: those with no successful comments and, while Comment deletion control is on, those that delete your comments. The deletion control switch and Remove channels sit in its header.' },
            { name: 'Model', holds: 'Which of the five models writes your comments, what each costs relative to the others, and what our own safety measurements found.' },
            { name: 'Persona', holds: 'The prompt presets, which one is active, and the sensitive-content filter.' },
            { name: 'Advanced settings', holds: 'Collapsed at the very bottom and not in the jump-nav: join concurrency and a per-account pace limit. They apply to every module, not only this one.' },
          ]],
        ],
      },
      {
        id: 'control',
        title: 'Control',
        blocks: [
          ['p', "Five things sit here: the run state with its uptime, the button that starts and stops the engine, two switches, and the delay window every comment waits out. The engine log is underneath, collapsed."],
          ['controls', [
            {
              id: 'ctl-start', name: 'Start', where: 'Control', kind: 'button', value: 'Start',
              rows: [
                ['What it does', 'Builds your account pool, connects every account in it, and begins polling the monitored channels. A round runs every poll interval — 60 seconds by default — and each round re-reads the account pool and the channel list from the database.'],
                ['Before it starts', 'A preflight dialog opens if accounts, channels or an active persona are missing, listing which of the three failed and offering Start anyway. A check whose data has not loaded yet counts as passing, so a slow page never blocks the button.'],
                ['What can refuse it', 'An empty commenting pool: an empty pool means no accounts, never all of them. And the active persona, which is assembled into a system prompt at start time — a persona that cannot be assembled fails the start outright, rather than failing quietly at the first comment.'],
                ['While it connects', 'Connecting the accounts can take a couple of minutes. The button shows the progress, and Cancel start beside it abandons the start at any point.'],
                ['Session cap', 'Ten hours by default. The check runs at the top of a round, never mid-send, and the stop is the clean one: the pool is disconnected and comments still waiting out their delay go back on the queue. Whether a new session follows is up to Auto-continue.'],
                ['Service restarts', 'A running engine survives them. It is started again 90 to 120 seconds after the service comes back. If the service keeps dying, the third restart within an hour is not followed, and the run ends with a reason instead of reconnecting every account again and again.'],
                ['Restarting for a change', 'Almost never needed. Accounts, the channel list, the delay window and the Warmup switch are all re-read every round. The persona is the exception — it is read once at start and cached.'],
              ],
            },
            {
              id: 'ctl-auto-continue', name: 'Auto-continue', where: 'Control, beside Start', kind: 'toggle', on: true,
              rows: [
                ['What it does', 'Decides what happens when a session reaches its cap. On: the engine takes a break and starts the next session by itself. Off: that session is the last one, and the engine stays stopped until you press Start.'],
                ['Default', 'On.'],
                ['The break', 'Random, 90 to 210 minutes each time, so the sessions do not settle on the same start times every day. While it lasts the panel reads Between sessions and says when the next one starts.'],
                ['Changed mid-break', 'Turning it off during a break cancels the session that was due. Pressing Stop during a break cancels it too.'],
                ['What it does not bring back', 'A pool you emptied while the engine was running. That run ends outright, whatever the switch says.'],
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
                ['Not the same warmup', 'This switch is the posting-rate ramp. Supervise in Accounts is the seven-day outreach rest gate measured from import. Active Warmup is the separate module that has accounts read and react.'],
                ['Takes effect', 'Next poll round. No restart.'],
              ],
            },
            {
              id: 'ctl-delay', name: 'Delay before commenting', where: 'Control → Delay settings', kind: 'field', value: '480',
              rows: [
                ['What it does', 'The wait between a written comment and its send. Once a post is caught, an account reserved and the comment written, the engine picks a delay uniformly at random between Min and Max and sleeps that long before sending.'],
                ['Default', '480 to 1500 seconds — 8 to 25 minutes.'],
                ['Presets', 'Three buttons fill both fields: Min (60-180s), Recommended (480-1500s), Max (1800-3600s). They only fill the fields — Save is what applies them.'],
                ['Validation', 'Both numbers must be above zero, and Min must be below Max. Save stays disabled and the form says so while they are not.'],
                ['Why the comment is written first', 'So that a post the model declines frees the account in seconds, not after it has sat out the whole delay for a comment it will never write. The price: a post that has to go back on the queue after the wait has its comment thrown away and written again on its next turn, a fraction of a cent.'],
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
          ['p', "The uptime counter beside the state runs from the moment the session started. The bar under it is scaled to the engine's real session cap, so a full bar means the session is about to end itself, and the line under the bar gives the time it ends and whether the next one follows."],
          /* СКРИН 2: блок Control во время работы — полоса uptime, строка "This session ends at … — the next one starts after a short break" и янтарная строка "Done for today: all N accounts…" под ней. */
          ['p', "A Running engine that has nobody free to post gets an amber line under the bar saying why: accounts paused, in cooldown, at their pace limit and so on, with the numbers. The one that is not a fault reads Done for today: every account in the pool has posted today's comment limit, and they come back by themselves after 00:00 UTC."],
        ],
      },
      {
        id: 'ai-protection',
        title: 'AI Protection',
        blocks: [
          ['p', "The block right under Control. With it on, an account working here also does, now and then, what a person does in Telegram between comments. An account that only ever comments is a pattern Telegram can see; one that also reads and looks around is a user."],
          /* СКРИН 3: блок AI Protection под Control — переключатель Off / Low / Medium / High, выбран Medium, строка "Each working account does something human about every 10 min · N actions in the last 24 h". */
          ['controls', [
            {
              id: 'ctl-nc-ai-protection', name: 'AI Protection', where: 'Right under Control', kind: 'select', value: 'Medium',
              rows: [
                ['What it does', 'Each working account does something human about every 25 minutes on Low, 10 on Medium and 4 on High. Every gap is drawn at random around that figure, and an account’s first action comes one gap after the engine first sees it, so pressing Start does not set the whole pool browsing at once.'],
                ['The actions', 'Open a channel or a group and read it, scroll back through a channel, view posts and stories, look through its own settings and profile, like a recent post, archive or unarchive a chat. One at random each time; reading is the most common, likes and archiving the rarest.'],
                ['What it never does', 'It works only with the account’s own chats, on the connection the engine already holds. It never looks up a username and never joins anything. Private chats are never read, marked read or archived.'],
                ['Likes', 'A like is visible, so it counts against the account’s hourly pace (see Advanced settings). When the hour is full, the like is skipped.'],
                ['If Telegram objects', 'A flood wait backs off that account’s browsing only. It is never put in cooldown for it and keeps commenting.'],
                ['Default', 'Medium. Off means the accounts only comment.'],
                ['Counter', 'The line under the switch shows how many of these actions the pool made in the last 24 hours. It is kept in memory, so a service restart starts it again from zero.'],
                ['Takes effect', 'No restart. Off stops it at once; a new level applies from each account’s next action.'],
              ],
            },
          ]],
          ['plink', [
            'The same switch sits on Neurodialogs and Mass Reactions, where the level means something slightly different. ',
            { text: 'AI Protection across the modules', href: '/guides/account-protection#ai-protection' },
            '.',
          ]],
        ],
      },
      {
        id: 'pool',
        title: 'The commenting pool',
        blocks: [
          ['p', "The pool is the subset of your accounts that neurocommenting may use. It is not the same thing as your account list: an account can be healthy, connected and completely idle simply because it was never put in here."],
          ['p', "Two columns — Available accounts on the left, In commenting pool on the right — an arrow on each row to move one across, and checkboxes with a bulk arrow to move many. Underneath, under the heading Comment Limits, sits the assignment layer, which decides which pooled account handles which channel, and the daily limit."],
          ['controls', [
            {
              id: 'ctl-pool-add', name: 'Add to pool', where: 'Pool → Available accounts', kind: 'button', value: 'Add to pool',
              rows: [
                ['What it does', 'Moves the account into the commenting pool and claims it for this module.'],
                ['One module at a time', 'An account may be driven by one behavioural module only. One already held by NeuroDialogs, Mass Reactions or Active Warmup, or a folder creator still building its folders, is refused and named in the message, and the rest of the batch still goes through — a refusal never fails the whole request.'],
                ['Also refused', 'An account currently reserved by discovery, or one still within its seven-day Supervise window, is refused with a reason. The supervision window is measured from import, not when supervision was enabled.'],
                ['Removing releases it', 'Taking an account out of the pool frees it for another module immediately. Removing the last one asks first: the engine will not start with an empty pool.'],
                ['Unhealthy accounts', 'An account that goes banned or dead-session while pooled is pulled out automatically and reported, rather than sitting there posting into nothing. Never the last ones, though: if every pooled account looks unhealthy at once, nothing is removed automatically and the panel says so.'],
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
              id: 'ctl-set-limit', name: 'Set limit', where: 'Pool → Comment Limits, right of the assignment buttons', kind: 'field', value: '10',
              rows: [
                ['What it does', 'Applies one comment limit to every account currently in the pool, in a single call.'],
                ['What the limit is', 'A daily cap. It counts only today’s successful comments, from 00:00 UTC. An account that reaches it is paused automatically and marked limit reached.'],
                ['It comes back by itself', 'Right after 00:00 UTC. Every five minutes the engine looks for accounts paused on the limit whose count for the new day is under it, and resumes them; a running engine picks them up on its next round. An account you paused by hand is never touched.'],
                ['In the list', 'Each account’s limit cell reads N of M today.'],
                ['Default', 'None. An account has no limit at all until one is set, here or on a single account.'],
                ['How it applies', 'Only on Enter or the tick button, never on losing focus — it touches every pooled account at once, so an incidental click should not fire it.'],
                ['Clearing it', 'The Clear limits button beside it removes the cap from every pooled account. An account paused for hitting a limit it is now clear of resumes by itself; one you paused by hand is left alone.'],
              ],
            },
            {
              id: 'ctl-pool-reset-counts', name: 'Reset counts', where: 'Pool → Comment Limits', kind: 'button', tone: 'warn', value: 'Reset counts',
              rows: [
                ['What it does', 'Sets the selected accounts’ count for today back to zero and resumes any of them paused for hitting their limit. Asks first.'],
                ['Why it exists', 'To carry on before midnight UTC. A spent account comes back by itself at 00:00 UTC; Reset counts is for when you want it posting again now. Raising the limit does the same.'],
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
          ['p', "Under the buttons, one row per account that holds channels: how many comments it landed and how many failed, its limit for today, whether it is paused, and the channels it owns behind a fold."],
          /* СКРИН 4: Pool → Comment Limits — заголовок с переключателем "Work by folders", ряд кнопок (Auto-assign, Shuffle, Clear assignments, Set limit, Clear limits, Reset counts) и строки аккаунтов с ячейкой "N of M today". */
          ['callout', [
            "Assignment is a preference, not a rule. If the assigned account is in cooldown, in quiet hours, paused, at its cap or blocked from that channel, the post is not skipped — it falls back to the rest of the pool, ordered least-recently-used, with accounts that have already succeeded on that channel first and accounts that failed to resolve it last. The fallback never goes beyond the pool: an account that is not in it is never used.",
          ]],
          ['note', "When every account in the pool has spent today's limit, the engine does not stop. It stays Running, writes into the log that the pool is done for today, stops polling channels it cannot comment on, and carries on by itself once the accounts come back after 00:00 UTC. The session cap and Auto-continue work as usual meanwhile."],
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
          ['p', "Edits here save as you make them. There is no Save changes step — removing a channel is written immediately, and the count above the list is the current list. Every monitored channel is commented on for real; there is no per-channel switch and no rehearsal mode."],
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
          ['note', "The engine resolves each channel once, caches the result and reuses it for every later post, which is why a restart does not re-resolve hundreds of channels. None of that cache is readable from this page.",
          ],
        ],
      },
      {
        id: 'post-order',
        title: 'Which post goes first, and the join before writing',
        blocks: [
          ['p', "Each round the engine reads the monitored channels and queues the posts it can comment on. Only a post with a comment thread and some text is queued. A service message, a post with comments switched off, a photo with no caption: all are dropped at the poll, and none of them counts as a failure. An album is one post, not one per photo."],
          ['p', "The queue goes latest post first: every channel's newest post before any channel's second-newest, then one post further back each time. Among posts at the same depth, the freshest goes first. There is no age cutoff; a caught post waits in the queue for up to 14 days."],
          ['controls', [
            {
              id: 'ctl-catchup', name: 'Posts per pass', where: 'Channels, above the list', kind: 'field', value: '20',
              rows: [
                ['What it does', 'When a channel has more new posts than this since it was last read, only the newest are queued and the older ones are skipped. It keeps a channel you have not read for two weeks from flooding the queue.'],
                ['Default', '20 posts per channel per pass. A value you set is marked as yours; clearing the field goes back to the default.'],
                ['What was skipped', 'The arrow beside it opens the channels that skipped old posts in the last 7 days, with how many.'],
              ],
            },
          ]],
          ['p', "Once a post has an account, the engine looks at the post's comment thread first: one read. If the thread is gone, the post is skipped and the account is free again. If the discussion group needs the account to join, it joins now, before a comment is written and before the delay, instead of learning it from a refused send."],
          ['bullets', [
            "One join attempt per account per channel, ever, and at most eight join attempts per account a day. The join also waits its turn under the join limits in Advanced settings.",
            "A group where an admin approves members gets a join request. Nothing is written, another account takes the post, and the request is checked again after 30 minutes, then 2, 6 and 24 hours.",
            "A group whose admin lets two requests expire without approving any is left alone for a week. At most two of your accounts wait on one group's admin at a time.",
            "A group that has banned the account is not tried, and the post goes to another account. A group where nobody may write is skipped.",
          ]],
          ['p', "None of these outcomes counts as a failed post: the post is put back on the queue for someone else, or skipped. Only then is the comment written, the delay waited out, the account checked once more, and the comment sent."],
        ],
      },
      {
        id: 'folders',
        title: 'Working by folders',
        blocks: [
          ['p', "A Telegram folder here is a shared folder of channels, the kind that opens from a t.me/addlist link. Joining one is a single request that puts an account into up to 100 channels at once, and leaves it holding what it needs to read and post in each of them without looking up a single username — the request Telegram rations hardest. With Work by folders on, pool accounts reach their channels that way instead of one channel at a time."],
          ['p', "It lives in two places: the Folders block under Channels, where folders are built from a preset, and the Work by folders switch in the Comment Limits heading of the Pool, which turns the mode on."],
          ['steps', [
            "Save the channel list as a preset (Channels → Save Preset).",
            "Under Channels → Folders, press Create folders and pick the preset and a creator account. The creator joins every channel of the preset, builds folders of up to 100 channels and shares them. It has to be an account outside the pool, and it stays in those channels afterwards to keep the folders alive. A large preset can need a second or third creator, and the dialog says so.",
            "Wait for the folder cards to read Ready. The creator joins slowly on purpose — 45 to 120 seconds between joins and a 10 to 20 minute pause every 20 — so a big preset takes hours. The dialog gives an estimate, and the cards show how far it is.",
            "In the Pool, switch Work by folders on, then press Auto-assign channels. It spreads the pool evenly across the ready folders and splits each folder's channels among its accounts. When accounts would join or move, it asks first, with the numbers.",
            "That is all. Each account joins its folder in the background, paced like every join, and starts commenting in its folder's channels as soon as it is in.",
          ]],
          /* СКРИН 5: Channels → Folders — карточки папок (название, Creator, число аккаунтов, статус Ready / "Creator joining channels", кнопки копирования ссылки и удаления) и кнопка Create folders. */
          ['controls', [
            {
              id: 'ctl-work-by-folders', name: 'Work by folders', where: 'Pool → Comment Limits heading', kind: 'toggle', on: false,
              rows: [
                ['What it does', 'Switches the pool from per-channel assignment to folders. Auto-assign then deals accounts across the folders, and each folder’s channels are split among the accounts in it.'],
                ['Needs', 'At least one ready folder. Until there is one, the switch cannot be turned on.'],
                ['Auto-assign', 'Makes a dry run first. If anyone would join or move, it shows how many accounts go to each folder and how many joins that is, and waits for Assign & join. A re-deal that moves nobody goes straight through. Channels in no folder stay unassigned, and any free account comments there.'],
                ['Shuffle', 'Asks which kind. Within folders: the same accounts get a new split of their folder’s channels, and nothing changes in Telegram. Move to new folders: each folder’s accounts join another folder and leave the old one in the background, and can leave the old channels too, to stay under Telegram’s 500-channel limit.'],
                ['Who takes a post', 'Accounts of the channel’s own folder first, since they can post there without a lookup.'],
                ['The list below', 'Grouped by folder, with each account’s join state while it is getting in. While accounts join or move, a chip in the heading shows the progress, with Stop.'],
                ['Turning it off', 'Always allowed, even mid-move. Accounts keep their channels and stay in their folders; Leave folders on the Accounts page takes them out.'],
              ],
            },
            {
              id: 'ctl-create-folders', name: 'Create folders', where: 'Channels → Folders', kind: 'button', value: 'Create folders',
              rows: [
                ['What it does', 'Splits a channel preset into shareable Telegram folders of up to 100 channels, built by the creator account you pick.'],
                ['Before you confirm', 'The dialog connects the creator and shows the real plan: how many folders, their names, and roughly how long the build takes. Channels of the preset you do not monitor are pointed out; folders only affect monitored channels.'],
                ['The creator is In work', 'While it builds, the creator counts in the In work tile of Account Manager, with the cause Creating Telegram folders, and its row carries a Creating folders badge: channels joined out of the total and how long it has been at it, with the time left in the tooltip. It is held for the folders and cannot be put in any module meanwhile. It is released as soon as its own folders are done.'],
                ['On each card', 'The folder name, its creator, how many pool accounts are in it, the status, a copy-link button and delete. Ready without N channels means some channels could not be added; Which? lists them and why.'],
                ['The link', 'Copy it, do not open it in your own Telegram: it offers to put your own account into every channel of the folder.'],
                ['If the creator dies', 'Its name on the card turns amber. The link may stop working, and new accounts cannot join.'],
                ['Delete', 'The creator deletes the folder and its link. Accounts in it leave the folder but stay in its channels and keep their assignments.'],
              ],
            },
          ]],
          /* СКРИН 6: Account Manager — плитка In work и строка аккаунта-создателя с бейджем "Creating folders · 37/100 · 1h" (тултип с оставшимся временем). */
        ],
      },
      {
        id: 'blacklist',
        title: 'What the engine took out of circulation',
        blocks: [
          ['p', "The blacklist is a list of channels, not of account failures. It holds two categories, each folded behind a small arrow with its count: Channels with no successful comments, and, only while Comment deletion control is on, Comments deleted. Every channel has a checkbox, and so does each category; what is ticked is what Remove channels removes."],
          /* СКРИН 7: секция Blacklist — в заголовке переключатель "Comment deletion control" (включён) и кнопка Remove channels; раскрыты категории "Channels with no successful comments" и "Comments deleted" с плашками вида "2 of 14 deleted · 3h ago". */
          ['table', {
            head: ['Category', 'What puts a channel there'],
            rows: [
              ['Channels with no successful comments', 'At least five attempts by at least two different accounts in the last 30 days, and not one comment published, whatever the reason. Each row shows the attempts, the accounts and the most common reason. The next section has the detail.'],
              ['Comments deleted', 'Comment deletion control found your comments gone from the thread. Each row shows how many of the checked comments were deleted and when the last one was. The X on a row forgets those deletions; the channel stays monitored.'],
            ],
          }],
          ['p', "The engine still records every failure of one account on one channel — sending forbidden, no access, kicked from the discussion group, username not found — and still acts on them. A channel an account cannot post in is moved to an account with a clean record there, and the freed account gets one of that account’s channels in exchange, so nobody’s workload changes size. A resolve failure is softer: the account is sorted to the back of the queue for that channel. Those records are just no longer listed here. With shuffles and folder moves, one account failing on one channel is a poor reason to drop the channel."],
          ['controls', [
            {
              id: 'ctl-deletion-control', name: 'Comment deletion control', where: 'Blacklist, in the header', kind: 'toggle', on: false,
              rows: [
                ['What it does', 'About an hour after each comment goes out, the account that posted it looks for it. If the thread answers and your comment is not in it, the comment counts as deleted and the channel is listed under Comments deleted.'],
                ['Default', 'Off.'],
                ['What it costs', 'One Telegram read per comment, on the connection the engine already holds. A read, so it does not count against the hourly pace.'],
                ['What is not a deletion', 'A post the channel deleted as a whole, or a channel the account lost access to. A check that fails for a network reason is tried again and never turns into a deletion; one that could not run within a day is dropped.'],
                ['Turning it on', 'Applies from the very next comment, and comments from the last hour get their check too. The first results arrive about an hour later; until then the category says nothing has been checked yet.'],
                ['Turning it off', 'The checks stop and the category disappears. The deletions already found are kept, and come back if it is turned on again.'],
              ],
            },
            {
              id: 'ctl-prune', name: 'Remove channels', where: 'Blacklist, in the header', kind: 'button', tone: 'warn', value: 'Remove channels',
              rows: [
                ['What it does', 'Stops monitoring every channel you ticked in the list below, after a confirmation. Ticking a category ticks every channel in it, whether it is open or not.'],
                ['Presets and folders', 'A removed channel is also taken out of every channel preset and Telegram folder that holds it. The folders are edited by their creator in the background.'],
                ['Why it is worth pressing', 'A dead channel otherwise sits in the poll list forever, costing a read every round and an account turn on every post, for nothing.'],
                ['What it leaves', 'The comment history. Only the monitored list, the presets and the folders are trimmed.'],
              ],
            },
          ]],
          ['callout', [
            "Removing a channel is the only thing this section does to the engine. The blocks that keep one account off one channel after a refusal, for anything from a few hours to a month depending on the cause, are held elsewhere, are not shown on this page, and expire on their own.",
          ]],
        ],
      },
      {
        id: 'quiet-channels',
        title: 'Channels that never give you a comment',
        blocks: [
          ['p', 'Some channels never publish anything from you. The engine still reads every post there, reserves an account and often writes a comment - and none of it lands, because the model declines, the send is refused or every account gets kicked. They are the first category in the Blacklist, Channels with no successful comments, where you can tick them and remove them.'],
          ['p', 'A channel is listed once it has had, in the last 30 days, at least five attempts from at least two different accounts and not one published comment, for any reason. Two accounts, because one account failing five times says more about that account than about the channel. An attempt is a real try: a comment written, a send refused, a generation error, or the model or the safety check declining the post. A post with no text or no comment thread, or one that went back on the queue, is not an attempt.'],
          ['callout', [
            'Nothing here is removed automatically. The pool is yours, and a product that quietly shrank it would show up a week later as an unexplained drop in output. The list is shown, the numbers are shown, and Remove channels does only what you tick.',
          ]],
          ['controls', [
            {
              id: 'ctl-never-commented', name: 'Channels with no successful comments', where: 'Blacklist, first category', kind: 'button', value: 'Not ticked',
              rows: [
                ['What it means', 'Enough attempts to judge, and not one published comment in all of them. You are paying for account turns and model calls on this channel and receiving nothing back. Each row shows the attempts, how many accounts made them and the most common reason.'],
                ['Removing them', 'Tick the channels, or the whole category, and press Remove channels. Removing one of these costs you no output at all.'],
              ],
            },
          ]],
        ],
      },
      {
        id: 'advanced',
        title: 'Advanced settings',
        blocks: [
          ['p', "The strip at the very bottom of the page, closed until you click it and not in the jump-nav. These settings are yours rather than this module's: they govern every join and every visible action your accounts make, in every module. Each one saves as you change it; there is no Save button. Comment deletion control, in the Blacklist header, is stored with them."],
          /* СКРИН 8: раскрытая полоса Advanced settings внизу страницы — колонки Joins и Pace с переключателями и счётчиками. */
          ['controls', [
            {
              id: 'ctl-parallel-joins', name: 'Parallel joins on a shared gateway', where: 'Advanced settings → Joins', kind: 'toggle', on: false,
              rows: [
                ['What it does', 'Off: accounts behind the same exit IP take turns to join. On: they join in parallel whatever proxy they share, up to the engine’s own connection cap.'],
                ['Applies to', 'Every join: discussion groups, Telegram folders, bulk joins, reactions and warmup.'],
                ['Default', 'Off.'],
                ['Turning it on', 'Asks first when pool accounts share an exit IP, and says how many do.'],
              ],
            },
            {
              id: 'ctl-joins-per-proxy', name: 'Concurrent joins per proxy', where: 'Advanced settings → Joins', kind: 'field', value: '2',
              rows: [
                ['What it does', 'How many accounts behind one exit IP may join at the same time. 1 means strictly one at a time.'],
                ['Range', '1 to 10. Default 2.'],
                ['When it counts', 'Only while parallel joins are off.'],
              ],
            },
            {
              id: 'ctl-skip-joined', name: 'Skip already-joined discussions', where: 'Advanced settings → Joins', kind: 'toggle', on: false,
              rows: [
                ['What it does', 'At Start, trusts our record of which discussion groups and folders an account has joined, instead of checking each one with Telegram.'],
                ['Default', 'Off.'],
                ['The trade', 'Fewer requests through the proxy and a faster start. An account that has left or been removed since is not re-joined up front; the thread check before each comment still catches it.'],
              ],
            },
            {
              id: 'ctl-pace-limit', name: 'Limit pace per account', where: 'Advanced settings → Pace', kind: 'toggle', on: false,
              rows: [
                ['What it does', 'Caps each account’s visible actions in any rolling hour, whichever module makes them.'],
                ['What counts', 'A comment, a join or a leave, a reaction, a DM, a warmup action and an AI Protection like. Reading channels, thread checks and deletion checks do not.'],
                ['When an account is full', 'Neurocommenting gives the post to another account or moves on. Reactions, warmup, dialogs and joins wait for a free slot.'],
                ['Default', 'Off. Actions are counted even while it is off, so turning it on is accurate from the first second.'],
              ],
            },
            {
              id: 'ctl-actions-per-hour', name: 'Actions per hour per account', where: 'Advanced settings → Pace', kind: 'field', value: '10',
              rows: [
                ['What it does', 'The cap itself: visible actions per account in any rolling hour.'],
                ['Range', '1 to 100. Default and recommended: 10.'],
                ['When it counts', 'Only while Limit pace per account is on.'],
              ],
            },
          ]],
        ],
      },
      {
        id: 'numbers',
        title: 'Reading the numbers',
        blocks: [
          ['p', "Two regions report what happened. Statistics is four tiles of totals; Comments is the row-by-row history behind them."],
          ['controls', [
            {
              id: 'ctl-stat-attempts', name: 'Total Attempts', where: 'Statistics', kind: 'tile', value: '148',
              rows: [
                ['Counts', 'Successful plus failed sends — every real send that was attempted.'],
              ],
            },
            {
              id: 'ctl-stat-successful', name: 'Successful', where: 'Statistics', kind: 'tile', tone: 'ok', value: '131',
              rows: [
                ['Counts', 'Comments that reached Telegram.'],
              ],
            },
            {
              id: 'ctl-stat-failed', name: 'Failed sends', where: 'Statistics', kind: 'tile', tone: 'bad', value: '17',
              rows: [
                ['Counts', 'Real post attempts that failed. Nothing else — a comment the model declined to write, or a post nobody was free to take, is not counted here.'],
                ['Not the same as the pool’s failed', 'The per-account failed number in the Pool section is broader: it also counts generation errors and posts skipped because no account was available. The two numbers are supposed to differ.'],
              ],
            },
            {
              id: 'ctl-stat-rate', name: 'Success Rate', where: 'Statistics', kind: 'tile', value: '88.5%',
              rows: [
                ['Counts', 'Successful over total attempts, to one decimal. Zero attempts reads as 0.0%.'],
              ],
            },
          ]],
          ['callout', [
            "These four read “since the last Start”. The totals are all-time on the server, and the panel subtracts whatever they were when Start was clicked, keeping that starting point in this browser. A browser that has never pressed Start shows all-time totals instead — and the line above the tiles always says which of the two you are looking at.",
          ]],
          ['p', "Comments below holds every event, newest first, fifty to a page, with Previous and Next under it. For anything that did not post, the reason is printed under its status. A row opens into the post it answered, the comment itself, and the reason and the error."],
          ['table', {
            head: ['Kind', 'What it means'],
            rows: [
              ['generated', 'A comment was written. Whether it then reached Telegram is on the row itself — a send that failed is logged as post failed as well.'],
              ['skipped', 'The model declined to write one: the persona’s own skip instruction, or the sensitive-content rule.'],
              ['error', 'Generation failed before there was anything to send.'],
              ['rate limited', 'The post was caught but no account was free to take it. Logged before any account is chosen, so this row has no account attached.'],
              ['post failed', 'A real send was attempted and Telegram refused it.'],
              ['re-queued', 'Shown with the skipped badge and its reason. Nothing was sent: the post went back on the queue for another account or a later round — a join request still pending, an account that became unusable during the delay, a Stop mid-wait.'],
            ],
          }],
          ['controls', [
            {
              id: 'ctl-export', name: 'Export CSV', where: 'Comments, under the table', kind: 'button', tone: 'plain', value: 'Export CSV',
              rows: [
                ['What it does', 'Downloads the page on screen, fifty rows. The filename carries the page number.'],
                ['Not the whole history', 'Exporting everything means paging through and exporting each page.'],
              ],
            },
            {
              id: 'ctl-clear-comments', name: 'Clear', where: 'Comments, under the table', kind: 'button', tone: 'bad', value: 'Clear',
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
            "Put accounts in the pool. They have to exist and be healthy in Account Manager first, and they cannot be held by another module — an account NeuroDialogs or Active Warmup is driving, or one still inside its seven-day Supervise window, is refused here by name.",
            "Add the channels you want watched. A paste of @usernames or t.me links is the normal way in; the parser takes both.",
            "Press Auto-assign channels. Without assignments everything still works, but each post is decided by a scan instead of going straight to a known account.",
            "Pick a persona. Six built-ins are there to read; duplicate the closest one and edit the copy rather than starting from an empty box, and keep its skip instruction.",
            "Leave the delay window alone unless you have a reason. The default 8-to-25 minutes is the recommended preset already.",
            "Press Start. The preflight dialog will tell you if accounts, channels or a persona are missing before anything runs.",
          ]],
          ['p', "Then watch two things. The engine log, expanded, shows the round-by-round decisions in real time; the Comments table shows what came out of them. A run that produces skipped rows and no comments is a persona problem, not an engine problem."],
          ['note', "If comments dry up, check the Control block before changing anything else. Between sessions it says when the next one starts; with Auto-continue off, the session that reached the ten-hour cap was the last one. A Running engine that posts nothing has an amber line under the bar saying why — Done for today means every account has spent today's limit and will be back after 00:00 UTC.",
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
          ['p', "Eight regions, with a jump-nav across the top in this order — the same shape as every module page: control and engine logs first, then the working surfaces, then the settings, with Model and Persona last."],
          ['map', [
            { name: 'Control', holds: 'The run state, Start and Stop, and the live log underneath, collapsed.' },
            { name: 'Conversations', holds: 'Every thread, searchable, with the full exchange and a box to write in it yourself.' },
            { name: 'Dialogs Pool', holds: 'Two columns of accounts — available and in the pool — the same shape as the commenting pool, and the same one-module-at-a-time rule.' },
            { name: 'Statistics', holds: 'Five counters, and one row per account with what it is doing right now.' },
            { name: 'Presets', holds: 'The Sessions settings saved under a name and loaded back in one click. Kept in this browser only.' },
            { name: 'Sessions', holds: 'Everything about rhythm and restraint: Rhythm, Replying, Limits, Group Promotion, and a folded Safety group.' },
            { name: 'Model', holds: 'Which model writes the replies.' },
            { name: 'Persona', holds: 'Prompt presets, which one is active, the reply-length slider and the knowledge file attached to each.' },
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
                ['What a fresh start looks like', 'Nothing. Zero online, zero replies, for hours. Statistics says so in its own words under the counters, because a correct run and a broken one look identical otherwise.'],
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
              id: 'ctl-nd-state', name: 'An account row', where: 'Statistics', kind: 'badge', tone: 'plain', value: 'waiting',
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
          ['p', "Five counters sit above the account rows in Statistics: accounts in the pool, online now, conversations, unread, replies today. Daily AI spend is deliberately not among them — it is a number nobody watches, and the limit that protects it works without anyone looking."],
        ],
      },
      {
        id: 'prompts',
        title: 'Persona: the prompts',
        blocks: [
          ['p', "A prompt preset is a name, a template you write, a maximum reply length, and optionally a knowledge file. The active one is what every account in the pool speaks with."],
          ['controls', [
            {
              id: 'ctl-nd-template', name: 'Prompt template', where: 'Persona → editor', kind: 'field', value: 'You are {account_first_name}, a real person…',
              rows: [
                ['What it does', 'The instruction the model answers under. Written as plain text, with tokens substituted before each call.'],
                ['The tokens', 'Eight, offered as buttons under the box: {message}, {sender_name}, {message_language}, {context}, {account_id}, {account_username}, {account_phone}, {account_first_name}.'],
                ['Substitution', 'Plain text replacement, like the commenting persona. Braces that are not a known token are left alone.'],
                ['What is appended for you', 'The length instruction is added to the end of every prompt automatically, so there is no need to repeat it in the text.'],
              ],
            },
            {
              id: 'ctl-nd-maxlen', name: 'Max reply length', where: 'Persona → editor', kind: 'slider', pct: 27,
              rows: [
                ['What it does', 'Caps the reply, in characters, as an instruction appended to the prompt.'],
                ['Default', '300 characters.'],
                ['Range', '40 to 1000. The lower bound is real, not a formality — a 40-character cap forces the kind of terse message a person actually sends, and anything below it produces fragments.'],
                ['Why shorter is usually right', 'A long, well-structured paragraph arriving in a DM from a stranger reads as generated. Short reads as typed.'],
              ],
            },
            {
              id: 'ctl-nd-knowledge', name: 'Knowledge file', where: 'Persona → editor', kind: 'select', value: 'None',
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
                ['After it fires', 'The account appears paused in Statistics with the reason beside it and stays out until you resume it by hand.'],
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
            { name: 'Control', holds: 'The run state, the Dry run switch, Start and Stop, and the engine log underneath, collapsed.' },
            { name: 'Reactions Pool', holds: 'Two columns of accounts, the same shape and the same one-module-at-a-time rule as the other pools.' },
            { name: 'Statistics', holds: 'The queue, the totals — attempts, successful, unsuccessful and the rate between them — and one row per account with what it has placed today.' },
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
          ['p', "Statistics holds everything the module reports: accounts, targets, posts queued and reactions queued, then the same four totals as the commenting page — total attempts, successful, unsuccessful and the success rate. Below them, one row per account with what it has placed today."],
          ['p', "The totals count finished jobs. A cancelled job is not an attempt — nothing was tried — so cancelling the fan-out for a deleted post does not dent the success rate."],
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
