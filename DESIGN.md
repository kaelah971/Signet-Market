# DESIGN.md — Research Market
## Proof-of-Research Credibility Platform on Injective

> AI finds claims. Humans validate them. Injective records the credibility trail.

---

## BRAND IDENTITY

**Product name:** Research Market
**Tagline:** Proof-of-Research. On-chain credibility for AI-generated research.
**Positioning:** Not a chatbot. Not a prediction market. A credibility layer where research claims are publicly challenged, validated, and recorded on Injective.
**Personality:** Intelligent. Precise. Atmospheric. Technologically credible. Quietly premium.
**Voice:** Direct. Evidence-first. No hype. Confident without being loud.

**What it must NOT feel like:**
- Startup generic
- Gradient-heavy
- Dashboard-cluttered
- AI slop
- Gambling or prediction betting
- Another AI wrapper

**What it MUST feel like:**
- A mission-critical research terminal
- Cinematic and intelligent
- Premium but purposeful
- Like something serious people use to separate truth from noise

---

## COLOR SYSTEM

```css
:root {
  /* Backgrounds */
  --bg-void:        #000000;       /* Page background */
  --bg-surface:     #0A0A0A;       /* Card surfaces */
  --bg-elevated:    #111111;       /* Elevated cards, modals */
  --bg-hover:       #161616;       /* Hover states on surfaces */

  /* Text */
  --text-primary:   #FFFFFF;       /* Headlines, primary labels */
  --text-secondary: #8A8A8A;       /* Body, supporting text */
  --text-muted:     #444444;       /* Timestamps, metadata */
  --text-disabled:  #2A2A2A;       /* Inactive states */

  /* Accent — used ONLY for CTAs, active states, key metrics */
  --accent:         #FBDE37;       /* Primary accent — electric yellow */
  --accent-dim:     rgba(251,222,55,0.08);  /* Accent tint on surfaces */
  --accent-border:  rgba(251,222,55,0.20);  /* Accent-tinted borders */
  --accent-hover:   #FFE55C;       /* Accent hover lightened */

  /* Validation States — used exclusively for claim outcomes */
  --state-accurate:      #2DD4A0;  /* Accurate — bioluminescent green */
  --state-false:         #FF4D6A;  /* False — hot coral */
  --state-misleading:    #F59E0B;  /* Misleading — amber */
  --state-unverifiable:  #6B7280;  /* Unverifiable — gray */

  /* Semantic */
  --success:        #2DD4A0;
  --warning:        #F59E0B;
  --error:          #FF4D6A;
  --info:           #4A8FBF;

  /* Borders */
  --border:         rgba(255,255,255,0.08);   /* Default border */
  --border-subtle:  rgba(255,255,255,0.04);   /* Barely-there border */
  --border-accent:  rgba(251,222,55,0.20);    /* Accent-tinted border */

  /* Special */
  --glass:          rgba(255,255,255,0.03);   /* Glassmorphism surface */
  --glass-border:   rgba(255,255,255,0.06);   /* Glassmorphism border */
  --glow-accent:    rgba(251,222,55,0.12);    /* Accent glow on hover */
}
```

**Color usage rules:**
- `--accent` (#FBDE37) is used for: primary CTA buttons, active nav items, open market badges, user's own vote highlight, and key accuracy metrics. Nowhere else.
- Validation state colors are ONLY used for claim outcomes: the four labels (Accurate, False, Misleading, Unverifiable), vote bars, and resolution banners.
- Background is pure black (#000000). This is non-negotiable. No off-blacks or dark grays on the page background.
- Never use more than one accent color per section. The yellow accent is the only warm element in the system.

---

## TYPOGRAPHY

```css
/* Import */
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500;700&display=swap');

:root {
  /* Families */
  --font-display:  'Space Grotesk', sans-serif;
  --font-body:     'Space Grotesk', sans-serif;
  --font-serif:    'Instrument Serif', serif;   /* Limited: hero statements, market titles */
  --font-mono:     'JetBrains Mono', monospace; /* All data, addresses, hashes, scores */

  /* Scale */
  --text-xs:   11px;   /* Timestamps, metadata labels */
  --text-sm:   13px;   /* Secondary labels, tags */
  --text-base: 15px;   /* Body text */
  --text-md:   17px;   /* Card headlines */
  --text-lg:   22px;   /* Section headers */
  --text-xl:   30px;   /* Page titles */
  --text-2xl:  42px;   /* Hero sub-headline */
  --text-3xl:  64px;   /* Hero headline */

  /* Line heights */
  --leading-tight:   1.1;   /* Display headings */
  --leading-snug:    1.3;   /* Card headlines */
  --leading-normal:  1.5;   /* Body text */
  --leading-relaxed: 1.7;   /* Long-form evidence text */

  /* Tracking */
  --tracking-tight:   -0.03em;  /* Large headings */
  --tracking-normal:   0;
  --tracking-wide:     0.04em;  /* Labels, small caps */
  --tracking-widest:   0.12em;  /* Status badges, tags */
}
```

**Typography rules:**
- `Instrument Serif italic` is reserved for: the product hero headline and individual market claim titles. These are the moments that need weight. Use it sparingly — max 2 instances per page.
- `JetBrains Mono` is used for: wallet addresses (truncated), on-chain hashes, accuracy percentages, vote counts, timestamps, points balances, reputation scores, and all numerical data. Data is data — it gets a data font.
- `Space Grotesk` handles everything else: nav, body, labels, buttons, cards.
- Never use more than 3 font sizes in a single card component.
- Labels above data (e.g., "MARKETS VOTED") use: `--text-xs`, `--tracking-widest`, uppercase, `--text-muted` color.
- Numbers being highlighted use: `--font-mono`, `--accent` color, larger size than surrounding text.

---

## SPACING SYSTEM

```css
:root {
  --space-1:   4px;
  --space-2:   8px;
  --space-3:   12px;
  --space-4:   16px;
  --space-5:   20px;
  --space-6:   24px;
  --space-8:   32px;
  --space-10:  40px;
  --space-12:  48px;
  --space-16:  64px;
  --space-20:  80px;
  --space-24:  96px;
  --space-32: 128px;
}

/* Layout containers */
--content-max:    1120px;   /* Main content max-width */
--content-narrow:  720px;   /* Readable text max-width */
--content-wide:   1400px;   /* Full-bleed sections */

/* Section padding */
--section-hero:    120px;   /* Hero vertical padding */
--section-page:     80px;   /* Standard section vertical padding */
--section-dense:    48px;   /* Dense sections */
--card-padding:     24px;   /* Standard card inner padding */
--card-padding-sm:  16px;   /* Compact card inner padding */
```

---

## BORDER & RADIUS SYSTEM

```css
:root {
  /* Radius */
  --radius-sm:   6px;    /* Badges, tags, chips */
  --radius-md:  10px;    /* Cards, inputs */
  --radius-lg:  16px;    /* Large cards, modals */
  --radius-xl:  24px;    /* Panels */
  --radius-pill: 999px;  /* Full-pill buttons, status indicators */

  /* Borders */
  --border-width: 1px;
  --border-default: 1px solid var(--border);
  --border-subtle: 1px solid var(--border-subtle);
  --border-accent: 1px solid var(--border-accent);
}
```

**Border rules:**
- Default card border: `1px solid rgba(255,255,255,0.08)` — barely visible, structural, not decorative.
- On hover: border transitions to `rgba(255,255,255,0.14)`.
- Active/selected states: border transitions to `var(--border-accent)` — yellow at 20% opacity.
- No pure white borders anywhere.
- The `--radius-md` (10px) is the default for almost everything. Nothing is sharp (0px) and nothing is excessively rounded in the app UI.

---

## COMPONENT LIBRARY

### Buttons

```css
/* PRIMARY — Main CTA, vote submission, connect wallet */
.btn-primary {
  background: var(--accent);
  color: #000000;
  font-family: var(--font-display);
  font-weight: 600;
  font-size: var(--text-sm);
  letter-spacing: 0.01em;
  padding: 10px 24px;
  border-radius: var(--radius-pill);
  border: none;
  cursor: pointer;
  transition: background 150ms ease, transform 100ms ease, box-shadow 150ms ease;
  box-shadow: 0 0 0 0 var(--glow-accent);
}
.btn-primary:hover {
  background: var(--accent-hover);
  box-shadow: 0 0 20px var(--glow-accent);
  transform: translateY(-1px);
}
.btn-primary:active {
  transform: translateY(0);
  box-shadow: none;
}

/* SECONDARY — Less prominent actions */
.btn-secondary {
  background: transparent;
  color: var(--text-primary);
  border: var(--border-default);
  font-family: var(--font-display);
  font-weight: 500;
  font-size: var(--text-sm);
  padding: 10px 24px;
  border-radius: var(--radius-pill);
  cursor: pointer;
  transition: border-color 150ms ease, background 150ms ease;
}
.btn-secondary:hover {
  border-color: rgba(255,255,255,0.20);
  background: var(--bg-hover);
}

/* GHOST — Text-level actions, nav links */
.btn-ghost {
  background: transparent;
  color: var(--text-secondary);
  border: none;
  font-family: var(--font-display);
  font-weight: 400;
  font-size: var(--text-sm);
  padding: 8px 12px;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: color 150ms ease, background 150ms ease;
}
.btn-ghost:hover {
  color: var(--text-primary);
  background: var(--bg-elevated);
}

/* VOTE OPTION — The four validation buttons on a market */
/* Each gets its own state color as the active/selected style */
.btn-vote {
  background: var(--bg-elevated);
  color: var(--text-secondary);
  border: var(--border-default);
  font-family: var(--font-display);
  font-weight: 500;
  font-size: var(--text-sm);
  padding: 12px 20px;
  border-radius: var(--radius-md);
  width: 100%;
  cursor: pointer;
  transition: all 150ms ease;
  text-align: left;
}
.btn-vote:hover {
  background: var(--bg-hover);
  border-color: rgba(255,255,255,0.14);
  color: var(--text-primary);
}
.btn-vote.selected-accurate  { border-color: var(--state-accurate);     color: var(--state-accurate);     background: rgba(45,212,160,0.06); }
.btn-vote.selected-false      { border-color: var(--state-false);        color: var(--state-false);        background: rgba(255,77,106,0.06); }
.btn-vote.selected-misleading { border-color: var(--state-misleading);   color: var(--state-misleading);   background: rgba(245,158,11,0.06); }
.btn-vote.selected-unverif    { border-color: var(--state-unverifiable); color: var(--text-secondary);     background: rgba(107,114,128,0.06); }
```

### Cards

```css
/* BASE CARD — All market cards, stat cards, evidence cards */
.card {
  background: var(--bg-surface);
  border: var(--border-default);
  border-radius: var(--radius-md);
  padding: var(--card-padding);
  transition: border-color 200ms ease, background 200ms ease;
}
.card:hover {
  border-color: rgba(255,255,255,0.12);
  background: var(--bg-elevated);
}

/* MARKET CARD — Open validation market */
.card-market {
  background: var(--bg-surface);
  border: var(--border-default);
  border-radius: var(--radius-md);
  padding: var(--card-padding);
  position: relative;
  cursor: pointer;
  transition: border-color 200ms ease, transform 200ms ease;
}
.card-market:hover {
  border-color: rgba(255,255,255,0.14);
  transform: translateY(-2px);
}
/* Left accent bar — color indicates market status */
.card-market::before {
  content: '';
  position: absolute;
  left: 0; top: 16px; bottom: 16px;
  width: 3px;
  border-radius: 0 2px 2px 0;
  background: var(--accent);          /* Open = yellow */
}
.card-market.resolved::before  { background: var(--state-accurate); }   /* resolved */
.card-market.closed::before    { background: var(--text-muted); }       /* closed/pending */

/* STAT CARD — For reputation dashboard */
.card-stat {
  background: var(--bg-surface);
  border: var(--border-default);
  border-radius: var(--radius-md);
  padding: var(--card-padding);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}
.card-stat .stat-label {
  font-size: var(--text-xs);
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
  color: var(--text-muted);
  font-family: var(--font-mono);
}
.card-stat .stat-value {
  font-size: var(--text-xl);
  font-family: var(--font-mono);
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1;
}
.card-stat .stat-delta {
  font-size: var(--text-sm);
  font-family: var(--font-mono);
  color: var(--state-accurate);    /* positive deltas */
}
```

### Badges & Tags

```css
/* STATUS BADGE — Market status indicator */
.badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: 3px 10px;
  border-radius: var(--radius-pill);
  font-size: var(--text-xs);
  font-family: var(--font-mono);
  font-weight: 500;
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
}
.badge-open {
  background: rgba(251,222,55,0.10);
  color: var(--accent);
  border: 1px solid rgba(251,222,55,0.20);
}
.badge-open::before {
  content: '';
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--accent);
  animation: pulse 2s infinite;
}
.badge-closed {
  background: rgba(255,255,255,0.04);
  color: var(--text-muted);
  border: var(--border-subtle);
}
.badge-resolved {
  background: rgba(45,212,160,0.08);
  color: var(--state-accurate);
  border: 1px solid rgba(45,212,160,0.20);
}

/* OUTCOME BADGE — Final market result */
.outcome-accurate      { background: rgba(45,212,160,0.10);  color: var(--state-accurate);     border: 1px solid rgba(45,212,160,0.25); }
.outcome-false         { background: rgba(255,77,106,0.10);  color: var(--state-false);         border: 1px solid rgba(255,77,106,0.25); }
.outcome-misleading    { background: rgba(245,158,11,0.10);  color: var(--state-misleading);    border: 1px solid rgba(245,158,11,0.25); }
.outcome-unverifiable  { background: rgba(107,114,128,0.10); color: var(--state-unverifiable);  border: 1px solid rgba(107,114,128,0.25); }

/* REPUTATION TIER BADGE */
.tier-badge {
  font-size: var(--text-xs);
  font-family: var(--font-mono);
  font-weight: 700;
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
  padding: 4px 12px;
  border-radius: var(--radius-pill);
}
.tier-newcomer    { background: rgba(255,255,255,0.05); color: var(--text-muted); }
.tier-rising      { background: rgba(251,222,55,0.08);  color: var(--accent); border: 1px solid var(--border-accent); }
.tier-verified    { background: rgba(45,212,160,0.08);  color: var(--state-accurate); border: 1px solid rgba(45,212,160,0.20); }
.tier-elite       { background: rgba(251,222,55,0.15);  color: var(--accent); border: 1px solid rgba(251,222,55,0.40); }
.tier-resolver    { background: rgba(251,222,55,0.20);  color: var(--accent); border: 1px solid var(--accent); box-shadow: 0 0 12px rgba(251,222,55,0.10); }
```

### Inputs & Forms

```css
/* TEXT INPUT */
.input {
  background: var(--bg-elevated);
  border: var(--border-default);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-family: var(--font-body);
  font-size: var(--text-base);
  padding: 12px 16px;
  width: 100%;
  transition: border-color 150ms ease, box-shadow 150ms ease;
  outline: none;
}
.input::placeholder { color: var(--text-muted); }
.input:focus {
  border-color: var(--border-accent);
  box-shadow: 0 0 0 3px var(--accent-dim);
}

/* VOTE STAKE INPUT — For mainnet stake amount */
.input-stake {
  background: var(--bg-elevated);
  border: var(--border-default);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-family: var(--font-mono);
  font-size: var(--text-lg);
  font-weight: 700;
  padding: 16px 20px;
  text-align: right;
  outline: none;
  transition: border-color 150ms ease;
}
.input-stake:focus { border-color: var(--border-accent); }
```

### Navigation

```css
/* TOP NAV */
.nav {
  position: fixed;
  top: 0; left: 0; right: 0;
  height: 60px;
  background: rgba(0,0,0,0.80);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: var(--border-subtle);
  z-index: 100;
  display: flex;
  align-items: center;
  padding: 0 var(--space-8);
  gap: var(--space-8);
}

/* NAV LOGO — Product name mark */
.nav-logo {
  font-family: var(--font-serif);   /* Instrument Serif italic — this is the 2nd allowed use */
  font-style: italic;
  font-size: 18px;
  color: var(--text-primary);
  letter-spacing: -0.01em;
  text-decoration: none;
}
.nav-logo span { color: var(--accent); }

/* NAV LINKS */
.nav-link {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  text-decoration: none;
  transition: color 150ms ease;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-sm);
}
.nav-link:hover  { color: var(--text-primary); }
.nav-link.active {
  color: var(--accent);
  background: var(--accent-dim);
}

/* WALLET CONNECT BUTTON — Special nav element */
.nav-wallet {
  margin-left: auto;
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  padding: 7px 16px;
  border-radius: var(--radius-pill);
  border: var(--border-default);
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 150ms ease;
}
.nav-wallet:hover { border-color: var(--border-accent); color: var(--accent); }
.nav-wallet.connected {
  border-color: rgba(45,212,160,0.30);
  color: var(--state-accurate);
  background: rgba(45,212,160,0.06);
}
```

---

## PAGE LAYOUTS

### Dashboard / Market List

```
┌─────────────────────────────────────────────────────────────────┐
│ NAV  — logo · markets · leaderboard · profile · [wallet]        │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  HEADER                                                           │
│  Today's Research Markets                                         │
│  [Open: 5]  [Closed: 2]  [Resolved: 14]   [Agent Log]           │
│                                                                   │
│  ┌──────────────────────┐  ┌──────────────────────┐             │
│  │ MARKET CARD          │  │ MARKET CARD           │             │
│  │ ● OPEN  24h left     │  │ ● OPEN  8h left      │             │
│  │                      │  │                       │             │
│  │ Claim title...       │  │ Claim title...        │             │
│  │                      │  │                       │             │
│  │ AI conf: 78%  3 src  │  │ AI conf: 91%  5 src  │             │
│  │ ████░░░░  18 votes   │  │ ████████░  34 votes  │             │
│  └──────────────────────┘  └──────────────────────┘             │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ AGENT ACTIVITY LOG (collapsible)                          │   │
│  │ 09:07 — created 5 validation markets                     │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### Market Detail Page

```
┌─────────────────────────────────────────────────────────────────┐
│ NAV                                                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ← Back to Markets           ● OPEN  •  Closes in 18h 42m       │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ CLAIM TITLE                                               │   │
│  │ "Project X announced a new Injective integration          │   │
│  │  within the last 24 hours."                               │   │
│  │                                                           │   │
│  │  Market #047  ·  Research Validation  ·  24h window      │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌────────────────────────┐  ┌──────────────────────────────┐  │
│  │ EVIDENCE PANEL         │  │ VOTE PANEL                   │  │
│  │                        │  │                              │  │
│  │ AI Summary             │  │ Cast your validation         │  │
│  │ AI Confidence: 78%     │  │                              │  │
│  │                        │  │ [✓ ACCURATE            ]    │  │
│  │ Sources (3)            │  │ [✗ FALSE               ]    │  │
│  │ › source 1             │  │ [⚠ MISLEADING          ]    │  │
│  │ › source 2             │  │ [? UNVERIFIABLE        ]    │  │
│  │ › source 3             │  │                              │  │
│  │                        │  │ Stake: [  50  ] pts          │  │
│  │                        │  │                              │  │
│  │                        │  │ [  SUBMIT VALIDATION  ]      │  │
│  └────────────────────────┘  └──────────────────────────────┘  │
│                                                                   │
│  VOTE DISTRIBUTION                                                │
│  Accurate   ████████████░░░░ 62%  (19 votes)                    │
│  False      ██░░░░░░░░░░░░░░ 12%  (4 votes)                     │
│  Misleading ████░░░░░░░░░░░░ 18%  (6 votes)                     │
│  Unverif.   ██░░░░░░░░░░░░░░  8%  (3 votes)                     │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### Validator Profile / Reputation Dashboard

```
┌─────────────────────────────────────────────────────────────────┐
│ NAV                                                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  inj1abc...xyz          [RISING VALIDATOR]                       │
│                                                                   │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌──────────┐  │
│  │ ACCURACY   │  │ MARKETS    │  │ STREAK     │  │ POINTS   │  │
│  │ 75%        │  │ VOTED      │  │            │  │          │  │
│  │            │  │ 4          │  │ 2          │  │ 340      │  │
│  └────────────┘  └────────────┘  └────────────┘  └──────────┘  │
│                                                                   │
│  RECENT VALIDATIONS                                               │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Market #047   Voted: ACCURATE   Result: ✓ ACCURATE        │   │
│  │ Market #044   Voted: ACCURATE   Result: ✓ ACCURATE        │   │
│  │ Market #041   Voted: FALSE      Result: ✗ MISLEADING      │   │
│  │ Market #039   Voted: ACCURATE   Result: ✓ ACCURATE        │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## SPECIFIC COMPONENT PATTERNS

### Vote Distribution Bar

The distribution bar shows how the crowd is voting. Each segment uses its outcome color.

```css
.vote-bar-container {
  display: flex;
  gap: 2px;
  height: 6px;
  border-radius: 3px;
  overflow: hidden;
}
.vote-bar-accurate      { background: var(--state-accurate);     }
.vote-bar-false         { background: var(--state-false);        }
.vote-bar-misleading    { background: var(--state-misleading);   }
.vote-bar-unverifiable  { background: rgba(107,114,128,0.40);   }
/* Width set dynamically by vote percentage */
```

### AI Confidence Indicator

```css
.confidence-ring {
  /* SVG arc showing AI confidence 0-100% */
  /* Arc fills with --accent at the confidence %, remainder in --border */
  /* The number inside is --font-mono --accent */
}
.confidence-label {
  font-size: var(--text-xs);
  font-family: var(--font-mono);
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: var(--tracking-widest);
}
```

### Countdown Timer

```css
.timer {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: var(--space-2);
}
.timer.urgent {  /* < 2h remaining */
  color: var(--state-false);
  animation: timerPulse 2s ease infinite;
}
@keyframes timerPulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.6; }
}
```

### Agent Activity Log

```css
.agent-log {
  background: var(--bg-surface);
  border: var(--border-subtle);
  border-radius: var(--radius-md);
  padding: var(--card-padding-sm);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  color: var(--text-muted);
}
.agent-log-entry {
  display: flex;
  gap: var(--space-4);
  padding: var(--space-2) 0;
  border-bottom: var(--border-subtle);
  line-height: var(--leading-snug);
}
.agent-log-time  { color: var(--accent); min-width: 48px; }
.agent-log-event { color: var(--text-secondary); }
/* Typing cursor animation on the latest log entry */
.agent-log-entry.latest .agent-log-event::after {
  content: '▌';
  animation: blink 1s step-end infinite;
}
@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
```

### On-Chain Transaction Reference

```css
.tx-reference {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  color: var(--text-muted);
  padding: var(--space-2) var(--space-3);
  background: var(--bg-elevated);
  border: var(--border-subtle);
  border-radius: var(--radius-sm);
}
.tx-reference .tx-hash { color: var(--state-accurate); }  /* The hash in green = confirmed */
.tx-reference .tx-hash:hover { text-decoration: underline; cursor: pointer; }
```

### Leaderboard Row

```css
.leaderboard-row {
  display: grid;
  grid-template-columns: 40px 1fr auto auto auto;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4) var(--space-5);
  border-bottom: var(--border-subtle);
  transition: background 150ms ease;
}
.leaderboard-row:hover { background: var(--bg-elevated); }
.leaderboard-row.top-3 .rank {
  font-family: var(--font-mono);
  font-weight: 700;
  color: var(--accent);
}
.leaderboard-rank  { font-family: var(--font-mono); color: var(--text-muted); font-size: var(--text-sm); }
.leaderboard-addr  { font-family: var(--font-mono); font-size: var(--text-sm); color: var(--text-secondary); }
.leaderboard-score { font-family: var(--font-mono); font-weight: 700; font-size: var(--text-base); color: var(--text-primary); }
.leaderboard-pct   { font-family: var(--font-mono); font-size: var(--text-sm); color: var(--state-accurate); }
```

---

## MOTION SYSTEM

All animation follows one principle: **slow, atmospheric, intelligent.** Nothing bounces. Nothing is playful.

```css
/* Base transitions */
--transition-fast:   100ms ease;
--transition-base:   200ms ease;
--transition-slow:   400ms ease;
--transition-crawl:  600ms cubic-bezier(0.16, 1, 0.3, 1);

/* Entrance animations */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes slideInRight {
  from { opacity: 0; transform: translateX(20px); }
  to   { opacity: 1; transform: translateX(0); }
}

/* Usage: staggered market cards on dashboard load */
.market-card:nth-child(1) { animation: fadeUp 500ms var(--transition-crawl) both; animation-delay: 0ms; }
.market-card:nth-child(2) { animation: fadeUp 500ms var(--transition-crawl) both; animation-delay: 80ms; }
.market-card:nth-child(3) { animation: fadeUp 500ms var(--transition-crawl) both; animation-delay: 160ms; }
.market-card:nth-child(4) { animation: fadeUp 500ms var(--transition-crawl) both; animation-delay: 240ms; }
.market-card:nth-child(5) { animation: fadeUp 500ms var(--transition-crawl) both; animation-delay: 320ms; }

/* Accent pulse — used on open market indicators */
@keyframes pulse {
  0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(251,222,55,0.4); }
  50%       { opacity: 0.7; box-shadow: 0 0 0 4px rgba(251,222,55,0); }
}

/* Number count-up — used when profile stats load */
/* Implement via JS: requestAnimationFrame counter from 0 → value over 800ms */
```

**Motion rules:**
- No `bounce` easing curves anywhere.
- Page transitions: opacity fade only, 250ms.
- Cards entering viewport: `fadeUp` with stagger, never slide from sides.
- Vote submission: brief scale(0.97) → scale(1) confirm on button, 150ms.
- Resolution reveal: outcome badge fades in over 400ms after the verdict.
- Loading states: skeleton screens with a slow shimmer sweep, not spinners.

---

## HERO SECTION

The hero is a cinematic stage, not a banner. It exists to communicate the product thesis immediately.

```
[HERO STRUCTURE]

Background: #000000
Subtle procedural: SVG noise texture at 0.03 opacity across the full viewport

Layout: centered, 60% viewport height minimum

EYEBROW (above headline):
  Font: --font-mono, --text-xs, --text-muted, uppercase, letter-spacing 0.12em
  Text: "PROOF-OF-RESEARCH · INJECTIVE TESTNET"

HEADLINE:
  Font: Instrument Serif italic, 56-80px, --leading-tight, --tracking-tight
  Color: --text-primary
  Text: "Research claims deserve
         a verdict."

SUB-HEADLINE:
  Font: Space Grotesk 400, --text-lg, --text-secondary, --leading-relaxed, max-width 520px
  Text: "AI surfaces the claims. You validate them.
         Every outcome is recorded on Injective."

CTA ROW:
  Primary:   "Explore Markets →"  [--btn-primary]
  Secondary: "How it works"       [--btn-ghost]

SOCIAL PROOF / ACTIVITY STRIP:
  Font: --font-mono, --text-xs, --text-muted
  Elements: "14 markets validated · 3 open now · 89 validators"
  Live indicator: pulsing yellow dot with "LIVE"
```

---

## VISUAL TEXTURE SYSTEM

A thin layer of atmosphere applied to the base black. Do not overdo this. Restraint is the point.

```css
/* PAGE NOISE OVERLAY */
/* Applied via a full-viewport-fixed pseudo-element or inline SVG */
/* feTurbulence baseFrequency="0.9" numOctaves="4" at 0.03 opacity */
/* Eliminates the flat digital void feel of pure black */
body::after {
  content: '';
  position: fixed;
  inset: 0;
  background-image: url("data:image/svg+xml,..."); /* SVG noise */
  opacity: 0.03;
  pointer-events: none;
  z-index: 9999;
}

/* SUBTLE GRID PATTERN — used on hero section only */
/* 1px lines at 80px intervals, rgba(255,255,255,0.03) */
.hero-grid-bg {
  background-image:
    linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
  background-size: 80px 80px;
}

/* SCANLINE EFFECT — used on AI agent activity log card only */
/* Thin repeating horizontal lines at 1.5% opacity */
/* Suggests a terminal/CRT display — appropriate for the agent log */
.agent-log::before {
  content: '';
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent 0px,
    transparent 2px,
    rgba(255,255,255,0.015) 2px,
    rgba(255,255,255,0.015) 3px
  );
  pointer-events: none;
  border-radius: inherit;
}
```

---

## SKELETON / LOADING STATES

```css
.skeleton {
  background: linear-gradient(
    90deg,
    var(--bg-elevated)       25%,
    rgba(255,255,255,0.04)   50%,
    var(--bg-elevated)       75%
  );
  background-size: 200% 100%;
  animation: shimmer 2s infinite linear;
  border-radius: var(--radius-sm);
}
@keyframes shimmer {
  from { background-position: 200% center; }
  to   { background-position: -200% center; }
}
/* Example skeleton market card: two lines at 60% and 40% width */
.skeleton-line-lg { height: 16px; width: 60%; margin-bottom: 8px; }
.skeleton-line-sm { height: 12px; width: 40%; }
```

---

## RESPONSIVE BREAKPOINTS

```css
/* Mobile first */
--bp-sm:   480px;  /* Large phones */
--bp-md:   768px;  /* Tablets */
--bp-lg:  1024px;  /* Small desktops */
--bp-xl:  1280px;  /* Full desktop */

/* Market card grid */
/* Mobile: 1 column */
/* Tablet (768px+): 2 columns */
/* Desktop (1024px+): 2-3 columns depending on page */

.market-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-4);
}
@media (min-width: 768px) {
  .market-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (min-width: 1200px) {
  .market-grid { grid-template-columns: repeat(3, 1fr); }
}
```

---

## ACCESSIBILITY

- All text meets WCAG AA contrast against `#000000` / `#0A0A0A` backgrounds.
- `--accent` (#FBDE37) on `#000000` passes AA at all sizes.
- `--state-accurate` (#2DD4A0) on `#000000` passes AA.
- `--state-false` (#FF4D6A) on `#000000` passes AA.
- Focus ring: `outline: 2px solid var(--accent); outline-offset: 3px;` on all interactive elements.
- Never rely solely on color to communicate vote state — always pair with a text label.
- Timer countdown includes `aria-live="polite"` for assistive technology.
- Wallet address always shown truncated with full address in `title` attribute.

---

## TAILWIND CONFIG (if using Tailwind CSS)

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'void':       '#000000',
        'surface':    '#0A0A0A',
        'elevated':   '#111111',
        'accent':     '#FBDE37',
        'accurate':   '#2DD4A0',
        'false':      '#FF4D6A',
        'misleading': '#F59E0B',
        'unverif':    '#6B7280',
      },
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        body:    ['Space Grotesk', 'sans-serif'],
        serif:   ['Instrument Serif', 'serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      borderColor: {
        DEFAULT: 'rgba(255,255,255,0.08)',
      },
    },
  },
}
```

---

## DESIGN RULES (THE NON-NEGOTIABLES)

1. **Background is always #000000.** Never a dark gray, never a navy. Black.
2. **Accent (#FBDE37) is used sparingly.** One dominant use per section. It should feel earned.
3. **All data is set in JetBrains Mono.** Wallet addresses, scores, vote counts, hashes, timestamps — every number that represents a system value.
4. **Instrument Serif italic appears twice per page maximum.** The hero headline, and one market claim title. It signals weight and credibility. Overuse kills it.
5. **The four validation outcomes always use their assigned colors.** Accurate = green. False = red/coral. Misleading = amber. Unverifiable = gray. These are semantic, not decorative.
6. **Borders are barely visible.** `rgba(255,255,255,0.08)` is the default. The structure comes from spacing and alignment, not heavy borders.
7. **No gradients on backgrounds.** The noise overlay and grid provide atmosphere. Background sections stay solid black or near-black.
8. **Motion is slow and purposeful.** If an animation lasts less than 100ms, question whether it should exist. If it's faster than 150ms, it should have a very good reason.
9. **The agent log must look like a terminal.** Monospace, scanline texture, blinking cursor. It's the product's heartbeat — it needs to feel alive.
10. **Wallet addresses are always truncated** to `inj1abc...xyz` format in JetBrains Mono. Full addresses only in tooltips or copy-on-click states.

---

## PAGE INVENTORY

| Page | Route | Primary purpose |
|------|-------|-----------------|
| Dashboard | `/` | Today's open markets, agent log, quick stats |
| Market Detail | `/market/[id]` | Claim, evidence, vote panel, distribution |
| Profile | `/profile/[address]` | Reputation stats, validation history |
| Leaderboard | `/leaderboard` | Ranked validators, accuracy scores |
| Resolved | `/resolved` | Closed markets with final outcomes |
| Admin (hidden) | `/admin` | Demo fast-forward, manual resolution |

---

*Research Market — Injective Hackathon Submission*
*Design system version 1.0*
