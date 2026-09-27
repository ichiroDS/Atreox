/* The one published research article, kept at its own public address
   (/blog/telegram-account-aging-claims-tested) and rendered by the Guides
   reader. It is deliberately NOT in any guide folder: its practical
   conclusions live in the Buying accounts guide. Keep public section IDs
   stable: existing deep links depend on them.

   The second article (telegram-session-killed-by-ip-change) was folded
   into Account Protection; vercel.json 301s its old addresses there. */
const RESEARCH_GUIDES = [
  {
    slug: 'telegram-account-aging-claims-tested',
    category: 'accounts-and-proxies',
    title: 'Telegram account aging: does the seller\u2019s claim predict survival?',
    short: 'Aging claims, tested',
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
];
Object.assign(window, { RESEARCH_GUIDES });
