# Panduan Lengkap AI: Membuat Proyek Bebas Bug dari Scan Madoss

> **Madoss** — Temukan atau ditemukan.
> Dokumen ini mencakup **117+ skills** hunting dan **10+ tools pentest** yang digunakan Madoss.
> Tujuan: AI membuat kode yang aman dan tidak terdeteksi oleh scanner Madoss.

---

## Daftar Isi

| # | Topik | CWE |
|---|-------|-----|
| 1 | [Gambaran Umum](#1-gambaran-umum) | - |
| 2 | [SQL Injection](#2-sql-injection-cwe-89) | CWE-89 |
| 3 | [NoSQL Injection](#3-nosql-injection-cwe-943) | CWE-943 |
| 4 | [XSS](#4-cross-site-scripting--xss-cwe-79) | CWE-79 |
| 5 | [SSRF](#5-server-side-request-forgery--ssrf-cwe-918) | CWE-918 |
| 6 | [IDOR](#6-insecure-direct-object-reference--idor-cwe-639) | CWE-639 |
| 7 | [SSTI](#7-server-side-template-injection--ssti) | CWE-94 |
| 8 | [XXE](#8-xml-external-entity--xxe-cwe-611) | CWE-611 |
| 9 | [LFI / Path Traversal](#9-local-file-inclusion--path-traversal-cwe-22) | CWE-22 |
| 10 | [RCE / Command Injection](#10-remote-code-execution--rce-cwe-78) | CWE-78 |
| 11 | [Insecure Deserialization](#11-insecure-deserialization-cwe-502) | CWE-502 |
| 12 | [CSRF](#12-cross-site-request-forgery--csrf-cwe-352) | CWE-352 |
| 13 | [CORS Misconfiguration](#13-cors-misconfiguration-cwe-346) | CWE-346 |
| 14 | [Open Redirect](#14-open-redirect-cwe-601) | CWE-601 |
| 15 | [Race Condition](#15-race-condition-cwe-362) | CWE-362 |
| 16 | [File Upload](#16-file-upload-vulnerabilities) | CWE-434 |
| 17 | [Auth Bypass (JWT/SAML/OAuth)](#17-authentication-bypass) | CWE-287 |
| 18 | [Prototype Pollution](#18-prototype-pollution-cwe-1321) | CWE-1321 |
| 19 | [Mass Assignment](#19-mass-assignment-cwe-915) | CWE-915 |
| 20 | [GraphQL](#20-graphql-vulnerabilities) | - |
| 21 | [LDAP Injection](#21-ldap-injection-cwe-90) | CWE-90 |
| 22 | [Header Injection](#22-http-header-injection-cwe-113) | CWE-113 |
| 23 | [HTTP Smuggling](#23-http-request-smuggling-cwe-444) | CWE-444 |
| 24 | [WebSocket](#24-websocket-vulnerabilities) | - |
| 25 | [Security Misconfiguration](#25-security-misconfiguration-cwe-16) | CWE-16 |
| 26 | [Information Disclosure](#26-information-disclosure-cwe-200) | CWE-200 |
| 27 | [Privilege Escalation](#27-privilege-escalation-cwe-269) | CWE-269 |
| 28 | [Framework-Specific](#28-framework-specific-rules) | - |
| 29 | [Security Headers](#29-security-headers-wajib) | - |
| 30 | [Checklist Final](#30-checklist-final) | - |

---

## 1. Gambaran Umum

### Plugin Scanner Madoss (5 Plugin Inti)

| Plugin | CWE | Severity | Deteksi |
|--------|-----|----------|---------|
| `sqli` | CWE-89 | CRITICAL | Error/boolean/time-based SQLi |
| `xss` | CWE-79 | HIGH | Reflected/stored/DOM XSS |
| `ssrf` | CWE-918 | HIGH | 11 teknik bypass IP + cloud metadata |
| `idor` | CWE-639 | HIGH | Parameter ID tanpa auth check |
| `misconfig` | CWE-16 | MEDIUM | Missing headers, debug, exposed files |

### 117+ Skills Hunting

| Kategori | Skills |
|----------|--------|
| Injection | hunt-sqli, hunt-nosql_injection, hunt-ldap, hunt-xss, hunt-ssti, hunt-xxe |
| Access | hunt-idor, hunt-auth-bypass, hunt-authentication_jwt, hunt-oauth, hunt-saml, hunt-mfa-bypass, hunt-ato, hunt-broken_function_level_authorization, hunt-mass_assignment |
| Server | hunt-ssrf, hunt-rce, hunt-deserialization, hunt-lfi, hunt-path_traversal_lfi_rfi, hunt-file-upload, hunt-insecure_file_uploads |
| Protocol | hunt-csrf, hunt-cors, hunt-open-redirect, hunt-header_injection, hunt-http-smuggling, hunt-websocket, hunt-graphql |
| Logic | hunt-race-condition, hunt-business-logic, hunt-brute-force, hunt-cache-poison |
| Infra | hunt-cloud-misconfig, hunt-cicd, hunt-subdomain_takeover, hunt-tls-network, hunt-host-header, hunt-information_disclosure, hunt-source-leak |
| Client | hunt-dom, hunt-prototype_pollution |
| Enterprise | m365-entra-attack, okta-attack, vmware-vcenter-attack, enterprise-vpn-attack, hunt-sharepoint, hunt-aspnet, hunt-ntlm-info |

### Tools Pentest

| Tool | Fungsi |
|------|--------|
| `nmap` | Port scanning, service detection |
| `nuclei` | Template-based vuln scanning |
| `subfinder` | Subdomain enumeration |
| `httpx` | HTTP probing, tech fingerprint |
| `katana` | Web crawling |
| `ffuf` | Directory/parameter fuzzing |
| `sqlmap` | SQL injection automation |
| `semgrep` | Static analysis (SAST) |
| `dalfox` | XSS scanning |
| `interactsh` | OOB interaction server |

---

## 2. SQL Injection (CWE-89)

### Pola Deteksi

**Error patterns:** `SQL syntax.*?near`, `MySQLSyntaxErrorException`, `Unclosed quotation mark`, `ODBC SQL Server Driver`, `sqlite3.OperationalError`, `org.postgresql.util.PSQLException`

**Payload:** `'`, `"`, `' OR '1'='1`, `' OR 1=1--`, `1' ORDER BY 1--`, `1' UNION SELECT NULL--`

**Parameter:** `id`, `user_id`, `uid`, `item`, `product`, `category`, `order`, `page`, `limit`, `offset`, `sort`, `search`, `q`, `query`, `keyword`, `filter`, `where`, `name`, `email`, `username`, `login`, `pass`, `password`

### Pencegahan

```python
# SALAH
query = f"SELECT * FROM users WHERE id = {user_id}"
query = "SELECT * FROM users WHERE name = '" + name + "'"

# BENAR
cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))
```

```javascript
// SALAH
const query = `SELECT * FROM users WHERE id = ${userId}`;

// BENAR
const query = 'SELECT * FROM users WHERE id = $1';
client.query(query, [userId]);
```

```php
// SALAH
$sql = "SELECT * FROM users WHERE id = " . $_GET['id'];

// BENAR
$stmt = $pdo->prepare("SELECT * FROM users WHERE id = :id");
$stmt->execute(['id' => $_GET['id']]);
```

### Aturan

1. WAJIB parameterized queries / prepared statements
2. JANGAN string concatenation di SQL
3. WAJIB gunakan ORM (SQLAlchemy, Prisma, Eloquent)
4. WAJIB validasi tipe data (int untuk ID)
5. WAJIB whitelist untuk ORDER BY / LIMIT
6. JANGAN expose error database ke user
7. WAJIB `debug=false` di production
8. WAJIB handle header sebagai input tidak terpercaya (User-Agent, Referer, X-Forwarded-For)
9. WAJIB `SELECT ... FOR UPDATE` untuk read-then-write
10. JANGAN gunakan `eval()` atau dynamic query

---

## 3. NoSQL Injection (CWE-943)

### Serangan

- MongoDB operator injection (`$gt`, `$ne`, `$regex`, `$where`)
- Bracket notation (`username[$ne]=x` → `{username: {$ne: 'x'}}`)
- Redis/Elasticsearch/DynamoDB/Neo4j command injection

### Pencegahan

```javascript
// SALAH
const user = await User.findOne({ username: req.body.username, password: req.body.password });

// BENAR — validasi tipe
const username = String(req.body.username).trim();
const password = String(req.body.password).trim();
if (typeof username !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: 'Invalid input' });
}
const user = await User.findOne({ username, password: hashPassword(password) });
```

```javascript
// Schema validation dengan Joi
const Joi = require('joi');
const schema = Joi.object({
    username: Joi.string().alphanum().max(30).required(),
    password: Joi.string().min(8).required()
});
const { error } = schema.validate(req.body);
if (error) return res.status(400).json({ error: error.details[0].message });
```

### Aturan

1. WAJIB validasi tipe input sebelum query
2. JANGAN izinkan operator MongoDB (`$gt`, `$ne`, dll) dari user input
3. WAJIB gunakan schema validation
4. JANGAN gunakan `$where` dengan input user
5. WAJIB sanitize bracket notation

---

## 4. Cross-Site Scripting / XSS (CWE-79)

### Pola Deteksi

**Payload HTML:** `<script>alert("XSS")</script>`, `<img src=x onerror=alert("XSS")>`, `<svg onload=alert("XSS")>`

**Payload Attr:** `" onmouseover="alert(1)"`, `javascript:alert(1)`

**Parameter:** `q`, `query`, `search`, `keyword`, `text`, `content`, `message`, `comment`, `name`, `title`, `subject`, `body`, `description`, `input`, `value`, `data`, `redirect`, `return`, `next`, `url`, `callback`, `error`, `success`, `info`, `page`, `ref`

### Encoding Rules

| Context | Encoding |
|---------|----------|
| HTML text | `< > & " '` → `&lt; &gt; &amp; &quot; &#x27;` |
| Attribute | `" ' < > &` + quoted attribute |
| URL | `encodeURIComponent()` + validasi scheme |
| JS string | `JSON.stringify()` |
| CSS | hindari inject ke style |

### Pencegahan

```javascript
// SALAH
element.innerHTML = userInput;
document.write(userInput);
eval(userInput);

// BENAR
element.textContent = userInput;
// Jika perlu HTML:
element.innerHTML = DOMPurify.sanitize(userInput);
```

```html
<!-- SALAH -->
<div th:utext="${userInput}"></div>

<!-- BENAR -->
<div th:text="${userInput}"></div>
```

### Aturan

1. WAJIB auto-escape template engine (Jinja2, Blade, JSX)
2. JANGAN `innerHTML`, `v-html`, `dangerouslySetInnerHTML`, `{!! !!}`, `th:utext`
3. WAJIB Content-Security-Policy header
4. WAJIB validasi URL untuk redirect/return/url
5. JANGAN izinkan `javascript:` scheme
6. WAJIB encode output per context
7. JANGAN `eval()`, `Function()`, `setTimeout(string)`

---

## 5. Server-Side Request Forgery / SSRF (CWE-918)

### 11 Bypass Techniques

```
127.0.0.1, localhost, 0.0.0.0, [::1]
0177.0.0.1 (octal), 0x7f000001 (hex), 2130706433 (decimal)
017700000001, 0x7f.0x0.0x0.0x1, 127.1
spoofed.burpcollaborator.net (DNS rebinding)
```

**Cloud metadata:** `http://169.254.169.254/latest/meta-data/`

**Parameter:** `url`, `uri`, `path`, `src`, `dest`, `redirect`, `feed`, `host`, `server`, `proxy`, `fetch`, `load`, `img`, `image`, `document`, `file`, `reference`, `site`, `html`, `page`, `link`, `href`, `target`, `callback`, `webhook`, `api`, `endpoint`

### Pencegahan

```python
from urllib.parse import urlparse
import ipaddress, socket

ALLOWED_DOMAINS = ['api.trusted.com']

def is_safe_url(url: str) -> bool:
    try:
        parsed = urlparse(url)
        if parsed.scheme not in ('https',): return False
        hostname = parsed.hostname
        if not hostname: return False
        if hostname.lower() in ('localhost', '127.0.0.1', '0.0.0.0', '[::1]'): return False
        try:
            ip = ipaddress.ip_address(hostname)
            if ip.is_private or ip.is_loopback or ip.is_link_local: return False
        except ValueError:
            resolved = socket.gethostbyname(hostname)
            ip = ipaddress.ip_address(resolved)
            if ip.is_private or ip.is_loopback or ip.is_link_local: return False
        if hostname not in ALLOWED_DOMAINS: return False
        return True
    except: return False
```

### Aturan

1. WAJIB blok IP internal (10/8, 172.16/12, 192.168/16, 169.254/16, 127/8)
2. WAJIB blok cloud metadata (169.254.169.254)
3. WAJIB whitelist domain, JANGAN blacklist
4. JANGAN ikuti redirect ke internal IP
5. WAJIB validasi DNS resolution (DNS rebinding)
6. WAJIB timeout untuk outbound request
7. JANGAN izinkan user kontrol port
8. JANGAN izinkan non-HTTP scheme (gopher, file, dict)

---

## 6. Insecure Direct Object Reference / IDOR (CWE-639)

### Parameter

`id`, `user_id`, `uid`, `account_id`, `profile_id`, `order_id`, `invoice_id`, `doc_id`, `file_id`, `item_id`, `customer_id`, `member_id`, `admin_id`, `owner_id`

### Pencegahan

```python
@app.get("/api/orders/{order_id}")
def get_order(order_id: int, current_user: User = Depends(get_current_user)):
    order = db.query(Order).get(order_id)
    if not order: raise HTTPException(404, "Not found")
    if order.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(403, "Forbidden")
    return order
```

### Aturan

1. WAJIB object-level authorization di setiap endpoint
2. JANGAN asumsikan authenticated = authorized
3. WAJIB gunakan UUID dibanding sequential ID
4. WAJIB cek ownership di server-side
5. WAJIB cek di resolver GraphQL juga
6. WAJIB cek batch/bulk operations per item
7. JANGAN trust header `X-User-Id` dari client

---

## 7. Server-Side Template Injection / SSTI

### Engine Probes

| Probe | Result | Engine |
|-------|--------|--------|
| `{{7*7}}` | `49` | Jinja2/Twig/Nunjucks |
| `${7*7}` | `49` | Velocity/Freemarker/SpEL/Thymeleaf |
| `<%= 7*7 %>` | `49` | ERB/EJS |

### Pencegahan

```python
# SALAH
template = Template(user_input)  # SSTI!
return template.render(name="World")

# BENAR — template dari file, user sebagai data
env = Environment(loader=FileSystemLoader('templates'))
template = env.get_template('greeting.html')
return template.render(name=user_input)
```

### Aturan

1. JANGAN pernah user input sebagai template source
2. WAJIB pisahkan template dan data
3. JANGAN `eval()`, `new Function()` dengan input user
4. WAJIB sandbox template engine jika user perlu edit template
5. JANGAN expose template error detail

---

## 8. XML External Entity / XXE (CWE-611)

### Pencegahan

```python
from defusedxml import ElementTree as ET
tree = ET.fromstring(user_xml)  # Aman
```

```java
DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();
dbf.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
dbf.setFeature("http://xml.org/sax/features/external-general-entities", false);
dbf.setFeature("http://xml.org/sax/features/external-parameter-entities", false);
```

### Aturan

1. WAJIB disable DOCTYPE processing
2. WAJIB disable external entity resolution
3. JANGAN parse XML dari user tanpa defusing
4. WAJIB gunakan JSON dibanding XML
5. JANGAN expose XML parser error

---

## 9. Local File Inclusion / Path Traversal (CWE-22)

### Bypass

```
../../../etc/passwd
....//....//etc/passwd (strip bypass)
..%2f..%2fetc%2fpasswd (URL encode)
php://filter/convert.base64-encode/resource=index.php
```

### Pencegahan

```python
from pathlib import Path

def safe_file_path(base_dir: str, user_input: str) -> str:
    base = Path(base_dir).resolve()
    target = (base / user_input).resolve()
    if not str(target).startswith(str(base)):
        raise ValueError("Path traversal detected")
    return str(target)
```

### Aturan

1. WAJIB resolve path dan cek prefix
2. JANGAN izinkan `..` dalam path
3. WAJIB gunakan `basename()` atau equivalent
4. JANGAN izinkan wrapper `php://`, `data://`, `expect://`
5. WAJIB whitelist file yang boleh di-include
6. WAJIB set `open_basedir` (PHP)

---

## 10. Remote Code Execution / RCE (CWE-78)

### Pencegahan

```python
# SALAH
os.system(f"ping {user_input}")
subprocess.call(f"ls {dir}", shell=True)

# BENAR
subprocess.run(["ping", "-c", "1", validated_ip], capture_output=True, timeout=5)
```

```javascript
// SALAH
exec(`ping ${userInput}`);

// BENAR
execFile('ping', ['-c', '1', validatedIp], { timeout: 5000 });
```

### Aturan

1. JANGAN `shell=True` atau `exec()` dengan input user
2. WAJIB list argument, BUKAN string
3. WAJIB validasi input dengan whitelist
4. JANGAN izinkan metacharacters (`;`, `|`, `&`, `$`, `` ` ``)
5. JANGAN `eval()`, `Function()` dengan input user
6. WAJIB timeout untuk subprocess
7. JANGAN deserialize data dari user input

---

## 11. Insecure Deserialization (CWE-502)

### Deteksi

```
Java: AC ED 00 05 / rO0A (base64)
PHP: O:8:"stdClass":0:{}
Python: \x80\x04 (pickle)
Cookie: rememberMe= (Shiro)
```

### Pencegahan

```python
# SALAH — pickle RCE
data = pickle.loads(user_input)

# BENAR — JSON aman
data = json.loads(user_input)
```

```php
// SALAH
$data = unserialize($_COOKIE['data']);

// BENAR
$data = json_decode($_COOKIE['data'], true);
```

### Aturan

1. JANGAN native serialization (pickle, Marshal, BinaryFormatter, unserialize)
2. WAJIB gunakan JSON
3. JIKA harus deserialize, WAJIB class allowlist
4. WAJIB HMAC/signature pada serialized data
5. WAJIB update library (ysoserial gadgets, Log4j)

---

## 12. Cross-Site Request Forgery / CSRF (CWE-352)

### Pencegahan

```python
# Flask
from flask_wtf.csrf import CSRFProtect
csrf = CSRFProtect(app)
```

```javascript
// Express.js
const csrf = require('csurf');
app.use(csrf({ cookie: { httpOnly: true, secure: true, sameSite: 'strict' } }));
```

### Aturan

1. WAJIB anti-CSRF token untuk state-changing requests
2. WAJIB validasi Origin/Referer header
3. WAJIB SameSite=Strict/Lax pada cookie
4. JANGAN GET untuk state-changing operations
5. WAJIB per-request token
6. JANGAN simpan token di URL

---

## 13. CORS Misconfiguration (CWE-346)

### Pencegahan

```javascript
const cors = require('cors');
app.use(cors({
    origin: function(origin, callback) {
        const allowed = ['https://trusted.com'];
        if (!origin || allowed.includes(origin)) callback(null, true);
        else callback(new Error('Not allowed'));
    },
    credentials: true
}));
```

### Aturan

1. JANGAN reflect arbitrary Origin
2. JANGAN izinkan `Origin: null`
3. WAJIB whitelist origin spesifik
4. JANGAN `ACAO: *` + `ACAC: true`
5. WAJIB escaped dot + end anchor `$` di regex
6. JANGAN wildcard subdomain

---

## 14. Open Redirect (CWE-601)

### Bypass

```
https://evil.com, //evil.com, /\\evil.com
https://target.com@evil.com, evil.com%00target.com
javascript:window.location='https://evil.com'
```

**Parameter:** `redirect`, `next`, `url`, `return`, `returnTo`, `continue`, `dest`, `destination`, `go`, `forward`, `location`, `target`, `redir`, `redirect_uri`, `callback`

### Pencegahan

```python
def safe_redirect(url: str) -> str:
    if url.startswith('/') and not url.startswith('//'):
        return url  # Relative OK
    parsed = urlparse(url)
    if parsed.hostname in ALLOWED_HOSTS:
        return url
    return '/'  # Default
```

### Aturan

1. WAJIB whitelist host
2. JANGAN izinkan absolute URL dari user
3. WAJIB validasi scheme (https only)
4. JANGAN izinkan `//` (protocol-relative)
5. JANGAN izinkan `javascript:`, `data:`

---

## 15. Race Condition (CWE-362)

### Serangan

- Coupon double-redemption
- Vote manipulation
- Wallet double-spend
- Rate-limit bypass via concurrent requests

### Pencegahan

```python
# Atomic transaction
with db.begin():
    result = db.execute(
        text("SELECT * FROM coupons WHERE code = :code AND used = false FOR UPDATE"),
        {"code": coupon_code}
    ).first()
    if not result: raise ValueError("Already used")
    db.execute(
        text("UPDATE coupons SET used = true WHERE id = :id"),
        {"id": result.id}
    )
```

```javascript
// Atomic MongoDB
const result = await Coupon.findOneAndUpdate(
    { code: couponCode, used: false },
    { $set: { used: true, usedBy: userId } },
    { returnDocument: 'after' }
);
```

### Aturan

1. WAJIB atomic operations
2. WAJIB `SELECT ... FOR UPDATE` untuk read-then-write
3. JANGAN pisahkan check dan update
4. WAJIB database transactions
5. JANGAN andalkan client-side protection
6. WAJIB unique constraints

---

## 16. File Upload Vulnerabilities

### 10 Bypass Techniques

| Attack | Payload | Prevention |
|--------|---------|------------|
| Extension | `shell.php.jpg` | Allowlist + final ext |
| Null byte | `shell.php%00.jpg` | Sanitize null bytes |
| Double ext | `shell.jpg.php` | Single ext only |
| MIME spoof | Content-Type: image/jpeg + PHP body | Magic bytes |
| Magic prefix | `GIF89a;` + PHP | Parse whole file |
| Polyglot | Valid JPEG + PHP | Image lib validation |
| SVG JS | `<svg onload="...">` | Sanitize/disallow SVG |
| XXE DOCX | Malicious XML | Disable entities |
| ZIP slip | `../../../etc/passwd` | Validate paths |
| Filename inj | `; rm -rf /` | UUID names |

### Pencegahan

```python
ALLOWED_EXT = {'.jpg', '.png', '.gif', '.pdf'}
ALLOWED_MIME = {'image/jpeg', 'image/png', 'image/gif', 'application/pdf'}

def safe_upload(file, upload_dir):
    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXT: raise ValueError("Extension not allowed")
    if file.content_type not in ALLOWED_MIME: raise ValueError("MIME not allowed")
    safe_name = f"{uuid.uuid4().hex}{ext}"
    # Cek path traversal
    safe_path = os.path.join(upload_dir, safe_name)
    if not os.path.abspath(safe_path).startswith(os.path.abspath(upload_dir)):
        raise ValueError("Invalid path")
    file.save(safe_path)
    return safe_name
```

### Aturan

1. WAJIB allowlist extension + MIME
2. JANGAN trust Content-Type header
3. WAJIB UUID filename
4. WAJIB validasi magic bytes
5. JANGAN simpan di executable webroot
6. WAJIB `Content-Disposition: attachment`
7. JANGAN izinkan SVG tanpa sanitization

---

## 17. Authentication Bypass

### Serangan

- JWT `alg: none` / RS256→HS256 confusion
- SAML signature stripping / XSW
- OAuth redirect_uri bypass
- Token audience confusion
- XMLRPC bypass (WordPress)
- Legacy endpoint bypass

### Pencegahan JWT

```javascript
// SALAH — menerima alg:none
const decoded = jwt.verify(token, publicKey);

// BENAR — enforce algorithm
const decoded = jwt.verify(token, publicKey, { algorithms: ['RS256'] });
```

### Pencegahan OAuth

```python
ALLOWED_REDIRECT_URIS = ['https://app.com/callback']
redirect_uri = request.args.get('redirect_uri')
if redirect_uri not in ALLOWED_REDIRECT_URIS:
    redirect_uri = DEFAULT_REDIRECT
```

### Aturan

1. WAJIB enforce JWT algorithm (RS256/ES256), JANGAN `none`
2. WAJIB validasi `aud`, `iss`, `exp` claims
3. WAJIB validasi SAML signature
4. WAJIB whitelist OAuth redirect_uri
5. JANGAN izinkan XMLRPC tanpa rate limiting
6. WAJIB cek legacy auth endpoints
7. JANGAN share session token antar trust level

---

## 18. Prototype Pollution (CWE-1321)

### Payload

```json
{"__proto__": {"isAdmin": true}}
{"constructor": {"prototype": {"isAdmin": true}}}
```

### Pencegahan

```javascript
// SALAH
function deepMerge(target, source) {
    for (const key in source) {
        if (typeof source[key] === 'object') {
            target[key] = deepMerge(target[key] || {}, source[key]);
        } else { target[key] = source[key]; }
    }
    return target;
}

// BENAR
function safeMerge(target, source) {
    const BLOCKED = new Set(['__proto__', 'constructor', 'prototype']);
    for (const key in source) {
        if (BLOCKED.has(key)) continue;
        if (typeof source[key] === 'object' && source[key] !== null) {
            target[key] = safeMerge(target[key] || {}, source[key]);
        } else { target[key] = source[key]; }
    }
    return target;
}
```

### Aturan

1. JANGAN izinkan `__proto__`, `constructor`, `prototype` sebagai key
2. WAJIB filter dangerous keys di merge/extend
3. WAJIB `Object.create(null)` untuk dict dari user
4. JANGAN `lodash.merge`, `jQuery.extend` dengan input tidak terpercaya
5. WAJIB freeze prototype (`Object.freeze(Object.prototype)`)

---

## 19. Mass Assignment (CWE-915)

### Field Berbahaya

`isAdmin`, `role`, `roles[]`, `permissions[]`, `status`, `plan`, `tier`, `premium`, `verified`, `userId`, `ownerId`, `accountId`, `organizationId`, `usageLimit`, `creditBalance`, `price`, `amount`

### Pencegahan

```python
# SALAH
user = User(**request.json)

# BENAR — explicit fields
user = User(name=data['name'], email=data['email'])
```

```php
// SALAH
User::create($request->all());

// BENAR — protected $fillable = ['name', 'email'];
User::create($request->only(['name', 'email']));
```

### Aturan

1. WAJIB whitelist field yang boleh di-assign
2. JANGAN `**kwargs` atau `$request->all()` untuk create/update
3. WAJIB DTO/Schema validation
4. JANGAN expose internal field di API response
5. JANGAN izinkan user set `role`, `isAdmin`, `credits`

---

## 20. GraphQL Vulnerabilities

### Serangan

- Introspection disclosure
- IDOR via node()/GID
- Batching DoS
- Query cost bypass
- Missing field-level authorization

### Pencegahan

```javascript
const server = new ApolloServer({
    schema,
    introspection: process.env.NODE_ENV !== 'production',
    validationRules: [
        depthLimit(10),
        createComplexityLimitRule(1000)
    ]
});
```

### Aturan

1. WAJIB disable introspection di production
2. WAJIB depth limiting (max 10-15)
3. WAJIB query complexity limiting
4. WAJIB field-level authorization di resolver
5. JANGAN trust parent auth untuk children
6. WAJIB rate limiting per query

---

## 21. LDAP Injection (CWE-90)

### Karakter Khusus: `* ( ) \ NUL /`

### Pencegahan

```python
def escape_ldap(value: str) -> str:
    escape_chars = {'\\': r'\5c', '*': r'\2a', '(': r'\28', ')': r'\29', '\x00': r'\00'}
    for char, escaped in escape_chars.items():
        value = value.replace(char, escaped)
    return value

filter_str = f"(uid={escape_ldap(user_input)})"
```

---

## 22. HTTP Header Injection (CWE-113)

### Pencegahan

```python
def safe_header_value(value: str) -> str:
    return value.replace('\r', '').replace('\n', '').strip()
```

### Aturan

1. JANGAN izinkan CR/LF dalam header values
2. WAJIB sanitize header values dari user input
3. JANGAN trust Host header dari client
4. JANGAN reflect User-Agent/Referer tanpa encoding

---

## 23. HTTP Request Smuggling (CWE-444)

### Pola: CL.TE, TE.CL, H2.CL, H2.TE

### Aturan

1. WAJIB normalisasi Content-Length dan Transfer-Encoding
2. JANGAN izinkan kedua header bersamaan
3. WAJIB HTTP/2 end-to-end
4. WAJIB reject ambiguous requests
5. WAJIB gunakan web server ter-patch

---

## 24. WebSocket Vulnerabilities

### Serangan: CSWSH, missing Origin validation, no per-message auth

### Pencegahan

```javascript
const wss = new WebSocket.Server({
    verifyClient: (info, callback) => {
        const origin = info.origin;
        if (!ALLOWED_ORIGINS.includes(origin)) {
            callback(false, 403, 'Origin not allowed');
            return;
        }
        // Autentikasi
        if (!verifyToken(info.req)) {
            callback(false, 401, 'Unauthorized');
            return;
        }
        callback(true);
    }
});

// Per-message authorization
ws.on('message', (data) => {
    const msg = JSON.parse(data);
    if (msg.action === 'deleteUser' && !req.user.isAdmin) {
        ws.send(JSON.stringify({ error: 'Forbidden' }));
        return;
    }
});
```

### Aturan

1. WAJIB validasi Origin di handshake
2. WAJIB autentikasi per-connection
3. WAJIB otorisasi per-message
4. JANGAN trust data dari WebSocket tanpa validasi
5. WAJIB rate limit messages

---

## 25. Security Misconfiguration (CWE-16)

### Exposed Paths

```
/.env, /.git/config, /wp-config.php.bak, /.htaccess
/server-status, /server-info, /.DS_Store
/debug, /trace, /actuator, /actuator/health
/swagger-ui.html, /api-docs
```

### Debug Indicators

```
APP_DEBUG=true, DEBUG=True, stack trace, Traceback, Fatal error:
```

### Aturan

1. WAJIB debug mode OFF di production
2. JANGAN expose stack trace
3. WAJIB set semua security headers
4. WAJIB blok .env, .git, file backup
5. JANGAN expose /debug, /trace, /actuator
6. WAJIB HTTPS enforcement
7. WAJIB Secure + HttpOnly + SameSite pada cookie
8. JANGAN expose server version
9. WAJIB hapus X-Powered-By

---

## 26. Information Disclosure (CWE-200)

### Pencegahan

```python
# SALAH — user enumeration
if not user: return {"error": "User not found"}
if not check_password(): return {"error": "Wrong password"}

# BENAR — generic error
if not user or not check_password():
    return {"error": "Invalid credentials"}
```

### Aturan

1. JANGAN expose perbedaan error
2. WAJIB generic error messages
3. JANGAN return sensitive data di response
4. JANGAN expose debug endpoints
5. WAJIB redact PII di logs
6. JANGAN commit .env, secrets ke repo

---

## 27. Privilege Escalation (CWE-269)

### Pencegahan

```python
def require_permission(permission):
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            if not current_user.has_permission(permission):
                raise Forbidden("Insufficient permissions")
            return f(*args, **kwargs)
        return decorated
    return decorator

@app.delete("/api/users/<user_id>")
@require_permission('admin:delete_user')
def delete_user(user_id): ...
```

### Aturan

1. JANGAN auto-approve permission
2. WAJIB principle of least privilege
3. WAJIB cek permission di server-side
4. JANGAN skip authorization karena "internal"
5. WAJIB cek di setiap endpoint termasuk sibling routes
6. JANGAN trust client-side role check

---

## 28. Framework-Specific Rules

### Django

```python
DEBUG = False
SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY')
# JANGAN mark_safe() dengan user input
# JANGAN |safe filter
# JANGAN raw() tanpa parameterize
```

### Flask

```python
from flask_talisman import Talisman
Talisman(app, force_https=True)
# JANGAN autoescape=False
# JANGAN Markup() dengan user input
```

### Express.js

```javascript
app.use(helmet());
app.use(csrf({ cookie: true }));
app.use(rateLimit({ windowMs: 15*60*1000, max: 100 }));
// JANGAN ejs.render() dengan user template
// JANGAN eval(), new Function()
```

### Laravel

```php
APP_DEBUG=false
// Model: protected $fillable = ['name', 'email'];
// JANGAN: User::create($request->all());
// BENAR: User::create($request->only(['name', 'email']));
```

### FastAPI

```python
from pydantic import BaseModel, validator
class UserCreate(BaseModel):
    name: str
    @validator('name')
    def validate_name(cls, v): return bleach.clean(v)
```

### Next.js

```javascript
// next.config.js: poweredByHeader: false
// JANGAN dangerouslySetInnerHTML dengan user input
// WAJIB validasi di API routes (server-side)
```

---

## 29. Security Headers Wajib

| Header | Value |
|--------|-------|
| `Content-Security-Policy` | `default-src 'self'` |
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `DENY` |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` |
| `X-XSS-Protection` | `1; mode=block` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `geolocation=(), camera=(), microphone=()` |
| `Cache-Control` | `no-store, no-cache, must-revalidate` |
| `Cross-Origin-Embedder-Policy` | `require-corp` |
| `Cross-Origin-Opener-Policy` | `same-origin` |
| `Cross-Origin-Resource-Policy` | `same-origin` |

---

## 30. Checklist Final

### Input
- [ ] Semua input di-validasi server-side
- [ ] Schema validation aktif
- [ ] Tipe data di-validasi
- [ ] Panjang input dibatasi
- [ ] Karakter khusus di-escape

### Database
- [ ] Prepared statements / parameterized queries
- [ ] ORM digunakan benar
- [ ] NoSQL input di-validasi
- [ ] SELECT FOR UPDATE untuk read-then-write
- [ ] Database error tidak expose

### XSS
- [ ] Output di-encode per context
- [ ] Auto-escape aktif
- [ ] Tidak ada innerHTML dengan input user
- [ ] CSP header ter-set

### SSRF
- [ ] URL user di-validasi
- [ ] Internal IP di-blok
- [ ] Cloud metadata di-blok
- [ ] Whitelist domain aktif

### Authorization
- [ ] Object-level auth di setiap endpoint
- [ ] Function-level auth di setiap endpoint
- [ ] Server-side auth check
- [ ] GraphQL resolver auth

### File
- [ ] Allowlist extension + MIME
- [ ] UUID filename
- [ ] Path traversal dicegah
- [ ] Content-Disposition: attachment

### Serialization
- [ ] Tidak ada native deserialization dari user
- [ ] JSON digunakan
- [ ] Class allowlist jika perlu deserialize

### Auth
- [ ] JWT algorithm di-enforce
- [ ] JWT claims divalidasi
- [ ] SAML signature divalidasi
- [ ] OAuth redirect_uri di-whitelist
- [ ] Rate limiting di auth endpoints
- [ ] Generic error messages

### HTTP
- [ ] Semua security headers ter-set
- [ ] HTTPS enforced
- [ ] CORS di-whitelist
- [ ] CSRF protection aktif

### Config
- [ ] Debug mode OFF
- [ ] .env/.git tidak bisa diakses
- [ ] Cookie flags (Secure, HttpOnly, SameSite)
- [ ] Server version tidak diexpose
- [ ] X-Powered-By dihapus

### Code
- [ ] Tidak ada eval()/new Function() dengan input user
- [ ] Tidak ada shell=True dengan input user
- [ ] Tidak ada __proto__ pollution
- [ ] Tidak ada dynamic import tanpa whitelist
- [ ] Template dari file, bukan user input
- [ ] Error handler generic
- [ ] Race condition dicegah (atomic ops)
- [ ] Prototype freeze aktif

---

> *"Temukan atau ditemukan" — Madoss*
> 
> Buat kode yang aman, atau scanner yang akan menemukan kelemahannya.
