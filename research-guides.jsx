/* Original published research, preserved in full in the Guides reader.
   Keep public section IDs stable: existing deep links depend on them. */
const RESEARCH_GUIDES = [
  {
    slug: 'telegram-account-aging-claims-tested',
    category: 'accounts-and-proxies',
    title: 'Telegram account aging: does the seller\u2019s claim predict survival?',
    summary:
      'We bought two Argentine batches on the same day from different sellers. '
      + 'One advertised thirty days of aging, the other claimed nothing we '
      + 'recorded. Seven days later the aged batch was the dead one.',
    seoTitle: 'Telegram account aging tested \u2014 does the seller\u2019s claim predict survival?',
    seoDescription:
      'Two Argentine Telegram account batches, same day, different sellers, one '
      + 'claiming 30 days of aging. Day-7 survival counts, sellers named, and '
      + 'what the numbers do not prove.',
    published: '2026-09-14',
    body: [
      {
        id: 'what-we-measured',
        title: 'What we measured, and why it is a question at all',
        blocks: [
          ['p', "Aging is the main thing a Telegram account seller charges for. The listing says the accounts sat untouched for two weeks, or thirty days, or three months, and the price moves with that number. It is the one variable buyers are trained to compare, and the one nobody publishes a result for."],
          ['p', "We could not find a single seller, reseller or marketplace that had put a rest-time claim next to a measured survival figure. Not a favourable one, not an unfavourable one. So we bought two batches specifically to see whether the claim predicts anything, and we are publishing what came back, with the sellers named."],
          ['p', "The short version is at the top of the table below: it predicted nothing. In our two batches it pointed the wrong way."],
        ],
      },
      {
        id: 'method',
        title: 'How this was set up, before the numbers',
        blocks: [
          ['p', "Two Argentine batches, bought on the same day from two sellers. Same country, same import day, same proxy provider and the same sticky-session configuration on both, same warmup settings. The one variable we deliberately did not hold constant is the one being tested: what the seller told us about rest time."],
          ['p', "theblja recorded thirty days of aging against both of its imports. AbonTg recorded nothing on two of its three imports and the literal word \u201cno\u201d on the third. Both are seller claims. We have never verified an aging figure and are not claiming to have verified one here \u2014 what this separates is what we were told, not what is true."],
          ['p', "A third batch, Uzbek stock from a different seller on a different day, is included because it is the other purchase we had running on the same measurement. It is context, not a control."],
          ['callout', [
            'What counts as survived',
            'An account survived if it passes a capability check on the measurement day: it resolves a known-good public username, reads that channel\u2019s history, searches it, and is not marked frozen, write-banned or unable to resolve. The check is the same one the engine runs before it will use an account for anything, so the bar is \u201cusable\u201d, not \u201cexists\u201d.',
            'A verdict older than seven days is not counted as a survival or as a death. It goes in its own column and the batch is reported as having no current answer for that account, which is why the columns below do not always add to the batch size in the way you would expect.',
          ]],
        ],
      },
      {
        id: 'results',
        title: 'Day 7, with the sellers named',
        blocks: [
          ['table', {
            head: ['Batch', 'Seller', 'Aging claimed', 'Can still post', 'Dead', 'No answer'],
            rows: [
              ['Argentina', 'AbonTg', 'none recorded', '49 of 50', '0 of 50', '1 of 50'],
              ['Argentina', 'theblja', '30 days', '2 of 30', '28 of 30', '0 of 30'],
              ['Uzbekistan', '\u041B\u0423\u0427\u0428\u0418\u0415_\u0410\u041A\u041A\u0410\u0423\u041D\u0422\u042B', 'none recorded', '20 of 20', '0 of 20', '0 of 20'],
            ],
          }],
          ['p', "All 28 of 30 dead accounts in the theblja batch came back with the same verdict from our check: frozen. Not write-restricted, not slow, not unreachable \u2014 frozen, which is Telegram\u2019s own account-level restriction and the end of the account for our purposes."],
          ['p', "Counts, not percentages, on purpose. Thirty accounts rendered as a percentage reads like a statistic and invites being compared against somebody\u2019s thousand. It is thirty accounts. The fraction says so and a percentage hides it."],
          ['note', "The one AbonTg account in the \u201cno answer\u201d column is ours, not the seller\u2019s: its check did not complete, so we have no current verdict for it. It is counted in the batch of 50 rather than dropped, because dropping the accounts you could not measure is how a survival figure flatters itself."],
          ['note', "Seller names are reproduced exactly as they appear on the marketplace listing, including the Uzbek seller\u2019s Cyrillic one. Transliterating it would make the name our rendering of the listing rather than the listing, and a reader checking our results against the marketplace needs the string that is actually there."],
        ],
      },
      {
        id: 'why-not-coincidence',
        title: 'Why this is not simply two batches differing',
        blocks: [
          ['p', "The two Argentine batches were bought on the same day, in the same country, put behind the same kind of proxy with the same sticky-session setting, and given the same warmup configuration. If rest time were the variable that decides survival, the batch with thirty days behind it should have been the one still standing."],
          ['p', "It was the other way round, and not marginally. Of the batch with no aging claim we could still post from 49 of 50 accounts, having lost none at all to Telegram. Of the batch sold on thirty days of rest, 28 of 30 were frozen inside the week and we could post from 2 of 30."],
          ['p', "There is one difference between the two batches beyond the aging claim, and it is worth naming because it runs against the conclusion rather than for it. 20 of the 50 AbonTg accounts had a profile change applied to them three days before the measurement \u2014 a write Telegram sees, and the kind of action that surfaces a flagged account. None of the theblja accounts was ever asked to do anything at all. The batch that was handled more is the batch that survived; the batch that was left completely alone is the one that froze."],
        ],
      },
      {
        id: 'what-this-does-not-prove',
        title: 'What these numbers do not prove',
        blocks: [
          ['p', "This is survival at rest, and that is a weaker thing than it sounds. A pre-flagged account does not announce itself while it sits; it surfaces when it is used. At the moment these verdicts were taken, no account in any of the three batches had posted a comment. Surviving a week untouched means not yet disproven. It does not mean good."],
          ['p', "So the AbonTg half of this is the weaker half. Our 49 of 50 still alive is a batch that has not failed yet, measured before it was really asked to do anything. We would not buy on that number and we are not asking anybody else to."],
          ['p', "The theblja half is the stronger half, and it is stronger for a reason worth stating plainly: those accounts froze having done nothing whatsoever. No comments, no profile changes, no joins. They were not worn out by use, because there was no use. Whatever was wrong with them arrived with them."],
          ['p', "That asymmetry is the actual finding. A good result at rest tells you very little. A bad result at rest tells you a great deal, because nothing else can be blamed for it."],
          ['note', "Since these verdicts were taken, the AbonTg accounts have started posting. That activity is not in the numbers above \u2014 every verdict in the table predates the first comment \u2014 and it means the two Argentine batches are no longer under identical conditions going forward. We will say so again at day 30 rather than quietly compare them as though nothing changed."],
        ],
      },
      {
        id: 'sample',
        title: 'How small this sample is',
        blocks: [
          ['p', "One import day. Two sellers. Batches of 50, 30 and 20 accounts. Two of the three batches come from a single purchase each, so a batch-level problem and a seller-level problem are indistinguishable here \u2014 one bad batch from a normally decent seller would look exactly like this."],
          ['p', "Nothing in this article supports a statement of the form \u201caged accounts survive X% less\u201d. It supports one narrower statement: in this test, on these batches, the rest-time claim did not predict the outcome, and the direction it got wrong was the expensive one."],
          ['p', "We are publishing it at this size because the alternative is publishing nothing until we have a sample nobody in this market ever gathers, while the claim we are testing keeps being sold at a premium in the meantime."],
        ],
      },
      {
        id: 'what-happens-next',
        title: 'What happens next, and when',
        blocks: [
          ['p', "The same three batches get measured again at day 30: 3 October for the Uzbek batch and 4 October for both Argentine ones. This article is updated on those dates with the new counts, whatever they say. If the AbonTg batch collapses in week three, that will appear here."],
          ['p', "There is no interim feed to subscribe to. The numbers on this page are the numbers, and they change on the two dates above."],
          ['p', "If you have a batch in hand right now, the useful move is not to take our numbers for it. Run the same check against your own accounts before you spend anything else on them \u2014 the account checker below is free, needs no signup, and answers the same question this article was built on: can this account still do the thing it was bought for?"],
          ['toolcta', {
            tool: 'account-checker',
            angle: 'You have just read that the seller\u2019s claim did not predict survival. The next question is what your own batch actually does.',
          }],
        ],
      },
    ],
  },
  {
    /* Every fraction below comes from (engine) python -m
       scripts.session_death_evidence, run 2026-09-14, and is listed with
       that source in scripts/verify-survival-claims.mjs. The exit-address
       measurement comes from src/proxy_pinning.py's docstring, measured
       2026-09-12 on the same login. Re-run before changing a number. */
    slug: 'telegram-session-killed-by-ip-change',
    category: 'accounts-and-proxies',
    title: 'Your Telegram account is not banned. Its session was killed by a moving IP.',
    summary:
      'A Telegram session can die with the account behind it untouched: the proxy\u2019s exit '
      + 'address changes under a live connection, Telegram reads that as a stolen key and '
      + 'revokes it, and most tools then call the account dead.',
    seoTitle: 'Telegram AUTH_KEY_DUPLICATED: why sessions die on a rotating proxy',
    seoDescription:
      'AUTH_KEY_DUPLICATED revokes a session, not the account: a proxy exit that moved. '
      + 'One traced case, the setting that prevents it, and what we could not prove.',
    published: '2026-09-14',
    body: [
      {
        id: 'what-you-see',
        title: 'What it looks like from the outside',
        blocks: [
          ['p', "An account that worked yesterday stops connecting. The tool you run it in marks it dead, disabled or banned, and the obvious conclusion is that the seller sold you something that was already on its way out."],
          ['p', "Sometimes that is exactly what happened. But there is a second way for an account to stop working that looks identical on a dashboard and has nothing to do with Telegram judging the account at all. The account is fine. The thing that died is the session \u2014 the login your tool was holding \u2014 and it died because of the proxy in front of it."],
          ['p', "The difference matters for money. A banned account is a loss. A killed session is a login you can redo, on a proxy setting you can fix, and an account you would otherwise throw away or dispute with a seller who did nothing wrong."],
        ],
      },
      {
        id: 'the-error',
        title: 'The error, word for word',
        blocks: [
          ['callout', [
            'The authorization key (session file) was used under two different IP addresses simultaneously, and can no longer be used. Use the same session exclusively, or use different sessions.',
            'In Telegram\u2019s API this is AUTH_KEY_DUPLICATED; Telethon raises it as AuthKeyDuplicatedError.',
          ]],
          ['p', "The authorization key is what a session file actually contains. It is created once, when the account logs in on a device, and every later connection proves who it is by holding that key. Nothing else identifies the login."],
          ['p', "So when Telegram sees one key in use from two addresses at the same moment, it has one reasonable explanation: the session file has been copied, and somebody else is using it. It does the safe thing and revokes that key. It does not, by this alone, restrict the account. A fresh login creates a fresh key and the account carries on \u2014 which is also why the error says to use a different session rather than telling you the account is gone."],
          ['note', "We have not logged the account in the case below back in, so we cannot show a recovery on it. The statement above is what the error and Telegram\u2019s key model imply, not something we have demonstrated on that account."],
        ],
      },
      {
        id: 'two-causes',
        title: 'Two different ways to get there',
        blocks: [
          ['p', "The error needs two addresses at once for one key. There are two ordinary ways to produce that, and they call for different fixes."],
          ['bullets', [
            'The exit moved under a live connection. Residential and mobile proxy gateways hand out an exit address from a pool. If the login does not ask the provider to hold one address, the pool can move you to another one while your client is still connected. Telegram then sees the same key arrive from a new address while the old connection is still registered.',
            'Two connections to the same session from two places. A second tool opened the same session file, a copy of it exists somewhere else, or one piece of software opened two connections to one account. Behind an exit that holds still, both connections come from one address and Telegram has nothing to object to. Behind an exit that moves, the second one arrives from somewhere else.',
          ]],
          ['p', "The second cause is not hypothetical for us. On 13 September we found our own engine connecting accounts that a run had not been given, alongside connections other parts of the software already held. We changed it so that a run only connects the accounts assigned to it. A moving exit turns that kind of overlap from harmless into fatal, which is why the two causes so often show up together."],
        ],
      },
      {
        id: 'one-case',
        title: 'One case, traced end to end',
        blocks: [
          ['p', "We have seen this error on more than one account. This is the one we can follow from the proxy setting to the moment the session died, so it is the one we describe."],
          ['steps', [
            'The account ran through DataImpulse on a sticky port, 10005, with a login that asked for a country and nothing else. No hold time.',
            'On 10 September at 20:08 UTC its connection dropped and the reconnect failed with the error above. The engine tried five times; the last attempt failed at 20:11 UTC and it stopped.',
            'Two days later we sampled the exit address of that same login, once every two minutes. Within 23 minutes it came out of three different addresses belonging to two different carriers.',
            'Our own panel labelled the account banned. That label was wrong, and we renamed it on 12 September: a session that died this way now counts under Invalid, not as a banned account.',
          ]],
          ['p', "The last step is the one worth dwelling on. We build the tooling and know what this error means, and our interface still told us the account was banned. Anyone running the same account through a tool that does not distinguish the two would have written it off and blamed the seller, and there would have been nothing on the screen to suggest otherwise."],
        ],
      },
      {
        id: 'the-fix',
        title: 'The setting that holds the exit',
        blocks: [
          ['p', "On DataImpulse the sticky session is selected by the port \u2014 their sticky range runs from 10000 to 20000 \u2014 and how long that session keeps one exit address is set in the login, with a parameter called sessttl, in minutes."],
          ['callout', [
            'yourlogin__cr.us;sessttl.1440',
            'The country stays as it is; the hold time is appended after a semicolon, with a dot between the name and the number. 1440 minutes is the longest hold DataImpulse support quoted to us.',
          ]],
          ['p', "Their documentation does show the parameter, with a dot, in an example. What it does not say is that the port is what holds the session, or how long a hold can be. Both of those came from their support, and without the first one the parameter looks optional rather than the difference between a session that lasts a day and one that can be killed inside half an hour."],
          ['note', "We got the spelling wrong ourselves before we got it right. Our panel suggested sessttl-1440, with a dash, and our own validator accepted it. No account in our fleet had that form and nothing documents it. It was fixed on 13 September; if you copied a login from us before then, check the separator."],
          ['plink', [
            'For countries DataImpulse does not carry we use ',
            { text: 'FloppyData', href: '/go/floppydata', rel: 'sponsored' },
            '. Its logins name a fixed session and switch rotation off with rotation-0, so the exit is held by the login itself rather than by a port. That link is an affiliate link \u2014 we receive a share of what you spend there \u2014 and it is not the reason it is here: it is the provider our own Argentine accounts run through.',
          ]],
          ['linkout', { href: '/guides/proxies-for-telegram-accounts', label: 'Guide: choosing and connecting proxies' }],
        ],
      },
      {
        id: 'if-it-happened',
        title: 'If it has already happened',
        blocks: [
          ['bullets', [
            'Do not reconnect the same session file. The key is revoked; every further attempt fails the same way, which is all five of ours did.',
            'Fix the proxy before the new login, not after it. A fresh session on the same moving exit is exposed to exactly the same failure.',
            'Log in again from what you were sold. Most sellers ship tdata, which can produce a new session; a bare session file with no tdata or phone behind it cannot be recovered this way.',
            'Run each account in one place at a time. Two tools on one session is the other half of this error, whatever the proxy.',
          ]],
        ],
      },
      {
        id: 'not-proven',
        title: 'What we tested and could not prove',
        blocks: [
          ['p', "Once we had a dead session traced to a missing hold time, the next question wrote itself: does the same setting also get accounts banned from posting? It would be a stronger and more useful claim, and one fleet appeared to support it. So we checked three."],
          ['table', {
            head: ['Fleet', 'Exit not held: write-banned now', 'Exit held: write-banned now'],
            rows: [
              ['Our fleet', '0 of 52', '0 of 60'],
              ['Client fleet A', '25 of 25', '0 of 45'],
              ['Client fleet B', '0 of 13', '3 of 62'],
            ],
          }],
          ['p', "Client fleet A reads like proof. It is not. The write-banned accounts came from five purchases in which every account had been set up without a hold time and every account ended up write-banned, and the accounts with a held exit came from other purchases. The seller and the proxy setup changed together, so on that fleet there is no way to tell which of the two did it. The one purchase that was split between both setups contributed two accounts to each side, which decides nothing."],
          ['p', "Our fleet points the other way: 52 accounts without a hold time and not one of them write-banned, two of them 65 days after import. Client fleet B has its only write-bans on held proxies."],
          ['p', "So this article makes no claim that a missing hold time leads to a write ban. We looked, and on these fleets the evidence does not separate the proxy from the seller. What would answer it is one purchase split in half on the same day \u2014 half with a hold time, half without \u2014 and rechecked for several weeks. We have not run that yet, and until someone does, anyone telling you the setting causes bans is guessing."],
          ['note', "\u201cWrite-banned now\u201d counts an account only if its capability check is at most seven days old. An older verdict is treated as no answer rather than as a ban."],
        ],
      },
      {
        id: 'check-yours',
        title: 'Check your own proxies',
        blocks: [
          ['p', "A proxy that passes a connection test can still move its exit an hour later \u2014 one check samples the address once, and this failure happens between samples. The free proxy checker now reads the login and port as well and says whether the exit is held, so the setting in this article is something you can confirm before an account depends on it."],
          ['toolcta', {
            tool: 'proxy-checker',
            angle: 'Paste the login you run your accounts through. It tells you whether the exit is held, not just whether the proxy connects.',
          }],
        ],
      },
    ],
  },
];
Object.assign(window, { RESEARCH_GUIDES });
