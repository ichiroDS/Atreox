/* ══════════════════════════════════════════════════════════════════
   tool-next-steps.jsx — what a checker says AFTER a bad verdict.

   WHY. A visitor got a verdict and left. The moment a proxy turns out not
   to hold its exit, or an account comes back frozen, is the one moment
   somebody is ready to hear what to do next - and the page said nothing.
   This is that next step, per verdict: what it means, what people do about
   it, the page that explains it, and the tool that checks the rest.

   WHAT IT IS NOT. Not "buy a subscription". The limit screen is where the
   panel is offered, because that is where somebody has volume. After a bad
   verdict the honest continuation is the explanation.

   PLAIN JAVASCRIPT, NO JSX, on purpose: scripts/verify-tool-next-steps.mjs
   runs this file in a sandbox and checks every entry - that each bad
   verdict has a next step, that every link is a page we build, and that
   the handoff payload cannot carry a proxy address, a login or a session.
══════════════════════════════════════════════════════════════════ */

const TOOL_NEXT_STEPS = {
  proxy: {
    tcp_failed: {
      title: 'Nothing answered at that address',
      means: 'The check could not open a connection to the proxy at all, so Telegram was never asked. That is almost always the address, the port or the credentials - or the provider only accepts connections from whitelisted IPs.',
      doing: [
        'Copy the line again from the provider rather than retyping it; a swapped host and port is the commonest cause.',
        'If the provider uses an IP whitelist, the check runs from our server, which is not on it. Test from your own machine too.',
        'Confirm the protocol: Telegram automation needs SOCKS5, and an HTTP-only proxy fails here.',
      ],
      links: [
        { href: '/guides/proxies-for-telegram-accounts', label: 'Guide: choosing and connecting proxies' },
      ],
    },
    telegram_failed: {
      title: 'The proxy works, but Telegram refused it',
      means: 'We reached the proxy and it accepted the connection, but the connection to Telegram through it failed. Some providers block Telegram, and some exits are addresses Telegram does not accept connections from.',
      doing: [
        'Ask the provider whether Telegram traffic is allowed on what you bought - some residential pools block it.',
        'Try a different exit from the same provider before writing the whole list off.',
        'Do not connect accounts through it in the meantime: a proxy that fails the check fails the account the same way.',
      ],
      links: [
        { href: '/guides/proxies-for-telegram-accounts', label: 'Guide: choosing and connecting proxies' },
      ],
    },
    exit_not_held: {
      title: 'It connects, but it does not hold its exit address',
      means: 'This proxy passed, and it can still move to a different exit while an account is connected. Telegram reads an address that changes under a live session as a stolen session key and revokes that login. This alone does not ban the account, but that login is gone and has to be redone - and most tools show the account as dead.',
      doing: [
        'On DataImpulse, keep the sticky port and add a hold time to the login: yourlogin__cr.us;sessttl.1440, with a dot.',
        'On other providers, ask for a sticky session that holds one exit for the length of the session, not a country-only login.',
        'Re-check the new login here before connecting an account through it.',
      ],
      links: [
        { href: '/guides/telegram-session-killed-by-ip-change', label: 'Why a moving exit kills sessions: one case, traced' },
        { href: '/guides/proxies-for-telegram-accounts', label: 'Guide: choosing and connecting proxies' },
      ],
    },
  },

  account: {
    session_not_usable: {
      title: 'This session cannot log in',
      means: 'The session file no longer authorises the account. That can be a ban, but it is not always one: a session is also revoked when the same file is used from two addresses at once, which a proxy that moves its exit produces on its own. The account behind it may be fine.',
      doing: [
        'Check the proxy the account was running on with the proxy checker - if it does not hold its exit, fix that first.',
        'Log the account in again from its tdata or phone, and do not reuse this session file.',
        'Only after that, if the fresh login also fails, treat it as the seller’s problem.',
      ],
      links: [
        { href: '/guides/telegram-session-killed-by-ip-change', label: 'A dead session is not a banned account' },
        { href: '/tools/proxy-checker', label: 'Check the proxy it ran on' },
      ],
    },
    frozen: {
      title: 'Telegram has frozen this account',
      means: 'Frozen is Telegram’s own account-level restriction: the account cannot search or post, and it does not come back by waiting. It is a verdict about the account, not about your setup.',
      doing: [
        'Check the rest of the purchase before spending anything else on it - one frozen account in a batch is a warning, several is the batch.',
        'Raise it with the seller while the purchase is fresh; most replacement windows are short.',
        'Do not move it to a different proxy hoping it recovers.',
      ],
      links: [
        { href: '/blog/telegram-account-aging-claims-tested', label: 'What a frozen batch looked like in our own test' },
        { href: '/guides/buying-telegram-accounts', label: 'Guide: buying Telegram accounts' },
      ],
    },
    write_forbidden: {
      title: 'It can read, but it cannot post',
      means: 'Telegram refuses this account’s messages. It still resolves channels, reads history and searches normally, so it is not dead - it is a reader, not a commenter.',
      doing: [
        'Keep it for reading work - parsing channels and groups does not post anything.',
        'Do not put it in anything that comments or replies; it will fail there every time.',
        'If the whole purchase came back this way, raise it with the seller.',
      ],
      links: [
        { href: '/guides/buying-telegram-accounts', label: 'Guide: buying Telegram accounts' },
      ],
    },
    cannot_resolve: {
      title: 'It cannot find public channels',
      means: 'The account could not turn a public username into a channel. Telegram does this to low-trust accounts, and an account that cannot find anything cannot do any work.',
      doing: [
        'Check it once more later before deciding - one failed lookup is a single sample.',
        'If it keeps failing, treat it like a restricted account and raise it with the seller.',
      ],
      links: [
        { href: '/guides/buying-telegram-accounts', label: 'Guide: buying Telegram accounts' },
      ],
    },
  },
};

/* The key for a proxy result, or null when there is nothing to add. Order:
   a proxy that does not work at all is the first problem; one that works
   but moves its exit is the next. */
function proxyNextStepKey(r) {
  if (!r) return null;
  if (r.result === 'tcp_failed' || r.result === 'telegram_failed') return r.result;
  if (r.exit_held === 'not_pinned') return 'exit_not_held';
  return null;
}

function accountNextStepKey(r) {
  if (!r) return null;
  if (!r.authorized) return 'session_not_usable';
  if (TOOL_NEXT_STEPS.account[r.write_status]) return r.write_status;
  return null;
}

/* What the handoff form sends besides the @username: which tool and which
   verdict, and for a proxy the country Telegram reported. Nothing else - not
   the host, not the port, not a login, not a file. Built here so the check
   can assert that. */
function handoffContext(tool, key, r) {
  const ctx = { tool: tool === 'account' ? 'account' : 'proxy', verdict: String(key || '') };
  if (tool === 'proxy' && r && r.telegram && typeof r.telegram.country === 'string') {
    ctx.country = r.telegram.country.slice(0, 2);
  }
  return ctx;
}

Object.assign(window, { TOOL_NEXT_STEPS, proxyNextStepKey, accountNextStepKey, handoffContext });
