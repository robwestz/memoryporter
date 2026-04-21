# localhost RFC Behavior — Reference
> Last updated: 2026-04-21

Covers the standards basis and browser behavior for `*.localhost` subdomains, secure contexts,
and Web API availability on `https://ecc.localhost`. No `/etc/hosts` hacks needed.

---

## Standards Basis

### RFC 6761 — Special-Use Domain Names (2013)
Section 6.3 reserves `.localhost` as a special-use TLD:
- All DNS resolvers MUST resolve `localhost` and any `*.localhost` subdomain to the loopback address
- No DNS lookup is sent to the network — the OS handles it locally
- Implication: `ecc.localhost` resolves to `127.0.0.1` on all standards-compliant systems without any `/etc/hosts` entry

### RFC 2606 — Reserved Top Level DNS Names (1999)
Reserves `localhost` as a top-level domain name that must not be delegated in global DNS.
RFC 6761 supersedes and extends RFC 2606's reservation.

### W3C Secure Contexts (https://www.w3.org/TR/secure-contexts/)
Defines which origins are "potentially trustworthy." Loopback addresses (`127.0.0.1`, `::1`)
and `localhost` (and its subdomains) are **always trustworthy** regardless of scheme.
This is the normative basis for browser secure context treatment of `.localhost`.

---

## Browser Behavior: `http://ecc.localhost` vs `https://ecc.localhost`

| Feature | `http://ecc.localhost` | `https://ecc.localhost` (mkcert cert) |
|---------|------------------------|---------------------------------------|
| Secure context | Yes (loopback exemption) | Yes |
| Service Workers | Yes | Yes |
| Clipboard API | Yes | Yes |
| getUserMedia | Yes | Yes |
| localStorage / sessionStorage | Yes | Yes |
| IndexedDB | Yes | Yes |
| Web Crypto API | Yes | Yes |
| ES modules (type="module") | Yes | Yes |
| `fetch()` same-origin | Yes | Yes |
| Mixed content blocked | N/A | Yes (HTTPS enforced) |
| HTTP/2 | No | Yes (Caddy default) |

**Recommendation for wapt:** use `https://ecc.localhost` — HTTP/2, stricter security model,
and matches production behavior more closely.

---

## Chrome (Chromium)

Chrome has treated `http://localhost` as a secure context since **Chrome 43 (2015)**.
Subdomains of `.localhost` are included per the W3C Secure Contexts spec.

### Chrome 2026 behavior for `ecc.localhost`
- `ecc.localhost` resolves to `127.0.0.1` via the OS resolver — no DNS query issued
- `http://ecc.localhost` is a secure context (loopback exemption)
- `https://ecc.localhost` with a valid mkcert cert: full green padlock, no warnings
- No `--ignore-certificate-errors` flag needed with a properly installed mkcert CA
- Service Workers: register and activate normally
- `fetch()` to `https://ecc.localhost`: succeeds without CORS issues when same-origin

### Chromium flags (dev use only, NOT needed with mkcert)
```
# Only needed if using a raw self-signed cert without mkcert CA install:
chrome --ignore-certificate-errors --unsafely-treat-insecure-origin-as-secure=https://ecc.localhost
# With mkcert -install: these flags are NOT needed
```

---

## Edge (Chromium-based)

Edge is built on the same Chromium engine and shares identical behavior:
- Same loopback secure context exemption
- Same `.localhost` subdomain resolution
- Same trust store (Windows system certificates — reads mkcert CA automatically after `mkcert -install`)
- No additional configuration needed

---

## Firefox

Firefox has supported `.localhost` subdomains as trustworthy origins since **Firefox 84 (December 2020)**.

### Firefox 2026 behavior for `ecc.localhost`
- `ecc.localhost` resolves to `127.0.0.1` — built into the OS resolver, Firefox does not query DNS
- `http://ecc.localhost` is treated as a secure context
- `https://ecc.localhost` with a mkcert cert: trusted if `mkcert -install` was run (installs to NSS)
- Firefox does NOT read the Windows system cert store — it uses its own NSS database
- Service Workers: fully supported on `https://ecc.localhost`

### Firefox: `network.dns.localDomains` (not needed)
Some old guides suggest adding `ecc.localhost` to `network.dns.localDomains` in `about:config`.
This is **not needed** on Firefox 84+ — `.localhost` subdomain resolution is built in.

---

## Service Workers on `https://ecc.localhost`

Service Workers require a secure context. Both `http://localhost` (loopback exemption) and
`https://ecc.localhost` (valid TLS) qualify.

```javascript
// Registration works on https://ecc.localhost
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').then(reg => {
    console.log('SW registered:', reg.scope);
  });
}
```

Caveats:
- Service Worker scope is origin-scoped: `https://ecc.localhost` is a distinct origin from `https://localhost`
- Use DevTools > Application > Service Workers to inspect and unregister during development

---

## `fetch()` and Cross-Origin Behavior

### Same-origin fetch (most common case)
```javascript
// Frontend at https://ecc.localhost fetching its own API:
const res = await fetch('/api/data');   // same-origin, no CORS needed
```

### Cross-origin fetch from `https://ecc.localhost`
If the API is on a different origin (e.g., `http://localhost:3000`), CORS applies normally.
The server must include `Access-Control-Allow-Origin: https://ecc.localhost`.

```json
// Caddy JSON config snippet to add CORS header for a local API route:
{
  "handle": [
    {
      "handler": "headers",
      "response": {
        "set": {
          "Access-Control-Allow-Origin": ["https://ecc.localhost"]
        }
      }
    }
  ]
}
```

---

## Web APIs Under `https://ecc.localhost`

All of the following work without any flags or workarounds when using `https://ecc.localhost`
with a valid mkcert certificate:

### Storage APIs
```javascript
// localStorage — works, origin-scoped to https://ecc.localhost
localStorage.setItem('key', 'value');

// sessionStorage — works
sessionStorage.setItem('key', 'value');

// IndexedDB — works
const db = await indexedDB.open('mydb', 1);

// Cache API (for Service Workers) — works
const cache = await caches.open('v1');
```

### Security APIs
```javascript
// Web Crypto — works
const key = await crypto.subtle.generateKey(
  { name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']
);

// Clipboard API — works (requires user gesture or explicit permission)
await navigator.clipboard.writeText('hello');

// Permissions API — works
const perm = await navigator.permissions.query({ name: 'clipboard-read' });
```

### ES Modules
```html
<!-- type="module" works fully on https://ecc.localhost -->
<script type="module" src="/main.js"></script>
```

---

## Loopback Address Resolution on Windows

Windows resolves `.localhost` via the built-in DNS stub resolver:
- `localhost` resolves to `127.0.0.1` (IPv4) and `::1` (IPv6)
- `ecc.localhost` resolves to `127.0.0.1` — no hosts file entry needed
- `anything.localhost` resolves to `127.0.0.1`

Verify with:
```bash
ping ecc.localhost         # should reply from 127.0.0.1
nslookup ecc.localhost     # may show NXDOMAIN from upstream DNS — that is fine; OS handles it
```

The OS resolver intercepts `.localhost` before any DNS query is sent upstream.

### Python verification
```python
import socket


def resolve_localhost_subdomain(hostname: str) -> str:
    """
    Resolve a *.localhost hostname. Should always return 127.0.0.1 on Windows.
    Raises socket.gaierror if resolution fails (should not happen on a standards-compliant OS).
    """
    addr = socket.gethostbyname(hostname)
    if addr != "127.0.0.1":
        raise RuntimeError(f"{hostname} resolved to {addr}, expected 127.0.0.1")
    return addr


# Usage:
resolve_localhost_subdomain("ecc.localhost")  # returns "127.0.0.1"
```

---

## Windows Gotchas

### `nslookup ecc.localhost` shows NXDOMAIN
This is expected and correct. `nslookup` bypasses the OS stub resolver and queries a real
DNS server directly, which returns NXDOMAIN for `.localhost` as it should. Browsers and
socket APIs use the OS resolver — `ecc.localhost` resolves correctly in all real usage.

### IPv6 (`::1`) vs IPv4 (`127.0.0.1`)
On some Windows configs, `localhost` resolves to `::1` first. Caddy listens on both by default
when configured with `"listen": [":443"]`. If you see connection refused, confirm Caddy is
bound to the right interface family.

### Windows DNS Client service
On rare corporate setups, the DNS Client service may be configured to not honor RFC 6761.
Test with `ping ecc.localhost`. If it fails, add a manual hosts entry as a fallback:
```
# C:\Windows\System32\drivers\etc\hosts
127.0.0.1  ecc.localhost
```
This should not be needed on a standard Windows 11 install.

---

## Best Practices

- Use `https://ecc.localhost` (not `http://`) to match production behavior and get HTTP/2
- No `/etc/hosts` modification is needed — RFC 6761 guarantees loopback resolution
- No browser flags needed — `mkcert -install` plus a valid cert equals full browser trust
- Test Service Worker behavior explicitly; scope isolation (`https://ecc.localhost` vs `https://localhost`) can surprise first-time users
- For cross-origin dev scenarios, configure explicit CORS headers in Caddy config rather than using browser flags

---

## External Links

- [RFC 6761 — Special-Use Domain Names](https://datatracker.ietf.org/doc/html/rfc6761)
- [RFC 2606 — Reserved Top Level DNS Names](https://datatracker.ietf.org/doc/html/rfc2606)
- [W3C Secure Contexts](https://www.w3.org/TR/secure-contexts/)
- [MDN: Secure Contexts](https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Secure_Contexts)
- [Chrome Platform Status: Treat localhost as secure](https://chromestatus.com/feature/6269417340010496)
- [Chrome Intent: Treat http://localhost as secure context](https://groups.google.com/a/chromium.org/g/blink-dev/c/RC9dSw-O3fE/m/E3_0XaT0BAAJ)
- [Lobsters: .localhost domains discussion](https://lobste.rs/s/j10cbv/localhost_domains)
