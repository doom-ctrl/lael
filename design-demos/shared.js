// Lael Design System — Direction B: Warm Editorial
// Shared tokens & components for all pages
// Wrapped in IIFE so const/let declarations don't pollute global scope
// (avoids SyntaxError when loaded alongside inline <script type="text/babel"> blocks)

(function() {
'use strict';

// ─── Color Palette ────────────────────────────────────────────────────────────
const PALETTE = {
  bg: '#FBF8F3',
  bgWarm: '#F5F0E8',
  surface: '#FFFEFA',
  surfaceAlt: '#F5F0E8',
  border: '#E2DAD0',
  borderLight: '#EDE6DC',
  textPrimary: '#1C1917',
  textSecondary: '#78716C',
  textTertiary: '#A8A29E',
  accent: '#166534',
  accentHover: '#14532D',
  accentLight: '#F0FDF4',
  accentBorder: '#BBF7D0',
  success: '#15803D',
  successLight: '#F0FDF4',
  warning: '#B45309',
  warningLight: '#FFFBEB',
  warningBorder: '#FDE68A',
  danger: '#B91C1C',
  dangerLight: '#FEF2F2',
  dangerBorder: '#FECACA',
  info: '#1D4ED8',
  infoLight: '#EFF6FF',
  infoBorder: '#BFDBFE',
  purple: '#7C3AED',
  purpleLight: '#FAF5FF',
  purpleBorder: '#E9D5FF',
  navbarBg: 'rgba(251,248,243,0.88)',
  navbarBgSolid: 'rgba(251,248,243,0.96)',
  shadow: '0 1px 4px rgba(28,25,23,0.05)',
  shadowMd: '0 4px 16px rgba(28,25,23,0.08)',
  shadowLg: '0 12px 40px rgba(28,25,23,0.10)',
  shadowXl: '0 20px 60px rgba(28,25,23,0.12)',
};

const TYPOGRAPHY = {
  display: "'Newsreader', Georgia, serif",
  body: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  mono: "'JetBrains Mono', 'SF Mono', Consolas, monospace",
};

// ─── Assessment Data ───────────────────────────────────────────────────────────
const ASSESSMENTS = [
  { id: 1, title: 'Calculus II — Midterm Exam', type: 'exam', dueDate: '2026-06-15', priority: 'high', status: 'pending', subject: 'Mathematics', description: 'Chapters 5-8, focus on integration techniques and series convergence.' },
  { id: 2, title: 'Organic Chemistry Quiz 4', type: 'quiz', dueDate: '2026-06-16', priority: 'medium', status: 'pending', subject: 'Chemistry', description: 'Aromatic compounds, electrophilic substitution reactions.' },
  { id: 3, title: 'Data Structures Assignment', type: 'assignment', dueDate: '2026-06-17', priority: 'low', status: 'in_progress', subject: 'Computer Science', description: 'Implement balanced BST with insert, delete, traverse operations.' },
  { id: 4, title: 'Thermodynamics Project', type: 'project', dueDate: '2026-06-18', priority: 'high', status: 'pending', subject: 'Physics', description: 'Group project on heat engine efficiency analysis with simulation.' },
  { id: 5, title: 'Machine Learning Essay', type: 'assignment', dueDate: '2026-06-19', priority: 'medium', status: 'pending', subject: 'Computer Science', description: '3000-word essay on transformer architectures and attention mechanisms.' },
  { id: 6, title: 'Linear Algebra Final Exam', type: 'exam', dueDate: '2026-06-20', priority: 'urgent', status: 'pending', subject: 'Mathematics', description: 'Comprehensive final covering eigenvalues, vector spaces, linear maps.' },
  { id: 7, title: 'Physics Lab Report', type: 'assignment', dueDate: '2026-06-14', priority: 'medium', status: 'completed', subject: 'Physics', description: 'Pendulum period vs. amplitude investigation report.' },
  { id: 8, title: 'Biochemistry Quiz 3', type: 'quiz', dueDate: '2026-06-13', priority: 'low', status: 'completed', subject: 'Chemistry', description: 'Enzyme kinetics and Michaelis-Menten parameters.' },
  { id: 9, title: 'Statistics Problem Set', type: 'assignment', dueDate: '2026-06-21', priority: 'medium', status: 'pending', subject: 'Mathematics', description: 'Hypothesis testing, p-values, confidence intervals.' },
  { id: 10, title: 'Quantum Mechanics Quiz', type: 'quiz', dueDate: '2026-06-22', priority: 'high', status: 'pending', subject: 'Physics', description: 'Schrödinger equation, particle in a box, quantum tunneling.' },
];

const STATS = [
  { label: 'Due Today', value: 1, color: PALETTE.warning, bg: PALETTE.warningLight, accent: PALETTE.warningBorder },
  { label: 'Due This Week', value: 6, color: PALETTE.info, bg: PALETTE.infoLight, accent: PALETTE.infoBorder },
  { label: 'Completed', value: 2, color: PALETTE.success, bg: PALETTE.successLight, accent: PALETTE.accentBorder },
  { label: 'Overdue', value: 0, color: PALETTE.danger, bg: PALETTE.dangerLight, accent: PALETTE.dangerBorder },
];

const TYPE_LABELS = { exam: 'Exam', quiz: 'Quiz', assignment: 'Assignment', project: 'Project', other: 'Other' };
const TYPE_COLORS = {
  exam: { bg: PALETTE.dangerLight, color: PALETTE.danger, border: PALETTE.dangerBorder },
  quiz: { bg: PALETTE.warningLight, color: PALETTE.warning, border: PALETTE.warningBorder },
  assignment: { bg: PALETTE.infoLight, color: PALETTE.info, border: PALETTE.infoBorder },
  project: { bg: PALETTE.purpleLight, color: PALETTE.purple, border: PALETTE.purpleBorder },
  other: { bg: PALETTE.bgWarm, color: PALETTE.textSecondary, border: PALETTE.border },
};

const PRIORITY_CONFIG = {
  low: { label: 'Low', color: PALETTE.info, bg: PALETTE.infoLight },
  medium: { label: 'Medium', color: PALETTE.warning, bg: PALETTE.warningLight },
  high: { label: 'High', color: PALETTE.danger, bg: PALETTE.dangerLight },
  urgent: { label: 'Urgent', color: PALETTE.purple, bg: PALETTE.purpleLight },
};

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: PALETTE.textSecondary, bg: PALETTE.bgWarm, border: PALETTE.border },
  in_progress: { label: 'In Progress', color: PALETTE.info, bg: PALETTE.infoLight, border: PALETTE.infoBorder },
  completed: { label: 'Completed', color: PALETTE.success, bg: PALETTE.successLight, border: PALETTE.accentBorder },
  overdue: { label: 'Overdue', color: PALETTE.danger, bg: PALETTE.dangerLight, border: PALETTE.dangerBorder },
};

// ─── Utility: format date ──────────────────────────────────────────────────────
function formatDateBadge(dueDateStr) {
  const d = new Date(dueDateStr);
  const month = d.toLocaleString('en', { month: 'short' });
  const day = d.getDate();
  return { month: month.toUpperCase(), day };
}

function daysUntil(dueDateStr) {
  const today = new Date('2026-06-14');
  const due = new Date(dueDateStr);
  const diff = Math.floor((due - today) / (1000 * 60 * 60 * 24));
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff === -1) return 'Yesterday';
  if (diff < 0) return `${Math.abs(diff)} days ago`;
  if (diff < 7) return `In ${diff} days`;
  if (diff < 14) return `In 1 week`;
  return `In ${Math.floor(diff / 7)} weeks`;
}

function isOverdue(item) {
  if (item.status === 'overdue') return true;
  if (item.status === 'completed') return false;
  return new Date(item.dueDate) < new Date('2026-06-14');
}

// ─── Top Floating Navbar ───────────────────────────────────────────────────────
function Navbar({ activePage, onAddClick }) {
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navItems = [
    { label: 'Dashboard', href: 'dashboard.html', key: 'dashboard' },
    { label: 'Assessments', href: 'assessments.html', key: 'assessments' },
    { label: 'Calendar', href: 'calendar.html', key: 'calendar' },
    { label: 'Settings', href: 'settings.html', key: 'settings' },
  ];

  return React.createElement('nav', {
    style: {
      position: 'sticky', top: 0, zIndex: 100,
      background: scrolled ? PALETTE.navbarBg : PALETTE.navbarBgSolid,
      backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
      borderBottom: `1px solid ${scrolled ? PALETTE.border : 'transparent'}`,
      boxShadow: scrolled ? PALETTE.shadow : 'none',
      transition: 'all 0.3s ease',
    },
  }, React.createElement('div', {
    style: { maxWidth: 1180, margin: '0 auto', padding: '0 36px', height: 64, display: 'flex', alignItems: 'center' },
  }, [
    // Logo
    React.createElement('a', {
      key: 'logo', href: 'index.html',
      style: { display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 },
    }, [
      React.createElement('div', {
        key: 'logobox',
        style: { width: 32, height: 32, background: PALETTE.accent, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' },
      }, React.createElement('svg', { key: 'logosvg', width: 16, height: 16, viewBox: '0 0 16 16', fill: 'none' },
        React.createElement('path', { d: 'M3 4h10M3 8h7M3 12h5', stroke: 'white', strokeWidth: 1.6, strokeLinecap: 'round' })
      )),
      React.createElement('span', {
        key: 'logotext',
        style: { fontFamily: TYPOGRAPHY.display, fontSize: 20, fontWeight: 400, color: PALETTE.textPrimary, letterSpacing: '-0.02em', fontStyle: 'italic' },
      }, 'Lael'),
    ]),

    // Nav links
    React.createElement('div', {
      key: 'navlinks', style: { display: 'flex', alignItems: 'center', gap: 4, marginLeft: 40 },
    }, navItems.map(item =>
      React.createElement('a', {
        key: item.key, href: item.href,
        style: {
          padding: '7px 16px', borderRadius: 8,
          fontFamily: TYPOGRAPHY.body, fontSize: 13.5, fontWeight: activePage === item.key ? 500 : 400,
          color: activePage === item.key ? PALETTE.accent : PALETTE.textSecondary,
          background: activePage === item.key ? PALETTE.accentLight : 'transparent',
          textDecoration: 'none', transition: 'all 0.15s ease',
        },
      }, item.label)
    )),

    // Right side
    React.createElement('div', {
      key: 'right', style: { marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 },
    }, [
      // Search button
      React.createElement('button', {
        key: 'search',
        style: {
          width: 36, height: 36, borderRadius: 8, border: `1px solid ${PALETTE.border}`,
          background: PALETTE.surface, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        },
        title: 'Search (⌘K)',
      }, React.createElement('svg', { width: 14, height: 14, viewBox: '0 0 14 14', fill: 'none' },
        React.createElement('circle', { cx: 6, cy: 6, r: 4.5, stroke: PALETTE.textSecondary, strokeWidth: 1.4 }),
        React.createElement('path', { d: 'M9.5 9.5L13 13', stroke: PALETTE.textSecondary, strokeWidth: 1.4, strokeLinecap: 'round' })
      )),

      // Add Assessment CTA — opens modal
      React.createElement('button', {
        key: 'add',
        onClick: onAddClick,
        style: {
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '9px 18px', borderRadius: 8, border: 'none', cursor: 'pointer',
          fontFamily: TYPOGRAPHY.body, fontSize: 13, fontWeight: 500,
          color: '#fff', background: PALETTE.accent,
          boxShadow: '0 2px 8px rgba(22,101,52,0.25)',
          transition: 'all 0.15s ease',
        },
      }, [
        React.createElement('svg', { key: 'plus', width: 13, height: 13, viewBox: '0 0 13 13', fill: 'none' },
          React.createElement('path', { d: 'M6.5 1v11M1 6.5h11', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' })
        ),
        React.createElement('span', { key: 'addtext' }, 'Add Assessment'),
      ]),

      // Avatar
      React.createElement('a', {
        key: 'avatar', href: 'settings.html',
        style: { width: 36, height: 36, borderRadius: '50%', background: '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', textDecoration: 'none', border: `1px solid ${PALETTE.accentBorder}` },
        title: 'Account',
      }, React.createElement('span', { style: { fontSize: 13, fontWeight: 600, color: PALETTE.accent, fontFamily: TYPOGRAPHY.display, fontStyle: 'italic' } }, (USER_NAME || 'L').charAt(0))),
    ])
  ]));
}

// ─── Page Container ────────────────────────────────────────────────────────────
function PageContainer({ children, maxWidth = 1180 }) {
  return React.createElement('div', {
    style: { maxWidth, margin: '0 auto', padding: '40px 36px 80px' },
  }, children);
}

// ─── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ stat }) {
  return React.createElement('div', {
    style: {
      background: PALETTE.surface, borderRadius: 12,
      border: `1px solid ${PALETTE.border}`, boxShadow: PALETTE.shadow,
      padding: '22px 24px', flex: 1, minWidth: 160, position: 'relative', overflow: 'hidden',
    },
  }, [
    React.createElement('div', {
      key: 'accent', style: { position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: stat.color },
    }),
    React.createElement('div', {
      key: 'label', style: { fontSize: 11.5, fontWeight: 500, color: PALETTE.textTertiary, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12, marginTop: 4 },
    }, stat.label),
    React.createElement('div', {
      key: 'value', style: { fontFamily: TYPOGRAPHY.display, fontSize: 40, fontWeight: 400, color: stat.color, lineHeight: 1, marginBottom: 8 },
    }, stat.value),
    React.createElement('div', {
      key: 'desc', style: { fontSize: 12, color: PALETTE.textSecondary },
    }, [
      React.createElement('span', { key: 'v', style: { color: stat.color, fontWeight: 500 } }, stat.value),
      React.createElement('span', { key: 'w', style: { color: PALETTE.textTertiary } }, ' items'),
    ]),
  ]);
}

// ─── Assessment Row (list view) ────────────────────────────────────────────────
function AssessmentRow({ item }) {
  const [hovered, setHovered] = React.useState(false);
  const [checked, setChecked] = React.useState(item.status === 'completed');
  const dateBadge = formatDateBadge(item.dueDate);
  const overdue = isOverdue(item);
  const completed = item.status === 'completed';
  const typeStyle = TYPE_COLORS[item.type];
  const priorityStyle = PRIORITY_CONFIG[item.priority];
  const statusStyle = STATUS_CONFIG[overdue ? 'overdue' : item.status];

  return React.createElement('div', {
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
    style: {
      display: 'flex', alignItems: 'center', gap: 16,
      background: hovered ? PALETTE.surfaceAlt : PALETTE.surface,
      border: `1px solid ${hovered ? PALETTE.border : PALETTE.borderLight}`,
      borderRadius: 12, padding: '16px 20px',
      boxShadow: hovered ? PALETTE.shadow : 'none',
      transition: 'all 0.2s ease', cursor: 'pointer',
      opacity: completed ? 0.65 : 1,
    },
  }, [
    // Checkbox
    React.createElement('button', {
      key: 'check',
      onClick: (e) => { e.stopPropagation(); setChecked(!checked); },
      style: {
        width: 22, height: 22, borderRadius: 6, flexShrink: 0,
        border: `1.5px solid ${checked ? PALETTE.accent : PALETTE.border}`,
        background: checked ? PALETTE.accent : 'transparent',
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.15s ease',
      },
    }, checked ? React.createElement('svg', { width: 12, height: 12, viewBox: '0 0 12 12', fill: 'none' },
      React.createElement('path', { d: 'M2 6.5l2.5 2.5L10 3.5', stroke: 'white', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' })
    ) : null),

    // Date badge
    React.createElement('div', {
      key: 'date',
      style: {
        width: 48, height: 48, borderRadius: 10, flexShrink: 0,
        background: completed ? PALETTE.successLight : (overdue ? PALETTE.dangerLight : PALETTE.accentLight),
        border: `1px solid ${completed ? PALETTE.accentBorder : (overdue ? PALETTE.dangerBorder : PALETTE.accentBorder)}`,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      },
    }, [
      React.createElement('span', {
        key: 'month', style: { fontSize: 9, fontWeight: 700, color: completed ? PALETTE.success : (overdue ? PALETTE.danger : PALETTE.accent), textTransform: 'uppercase', letterSpacing: '0.08em', lineHeight: 1.2 },
      }, dateBadge.month),
      React.createElement('span', {
        key: 'day', style: { fontSize: 20, fontWeight: 400, color: completed ? PALETTE.success : (overdue ? PALETTE.danger : PALETTE.accent), lineHeight: 1.1, fontFamily: TYPOGRAPHY.display },
      }, dateBadge.day),
    ]),

    // Content
    React.createElement('div', { key: 'content', style: { flex: 1, minWidth: 0 } }, [
      React.createElement('div', { key: 'title-row', style: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5, flexWrap: 'wrap' } }, [
        React.createElement('span', {
          key: 'title', style: { fontSize: 14.5, fontWeight: 400, color: PALETTE.textPrimary, fontFamily: TYPOGRAPHY.display, fontStyle: 'italic', textDecoration: completed ? 'line-through' : 'none', opacity: completed ? 0.5 : 1 },
        }, item.title),
        React.createElement('span', {
          key: 'priority', style: {
            fontSize: 9.5, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
            background: priorityStyle.bg, color: priorityStyle.color,
            textTransform: 'uppercase', letterSpacing: '0.06em',
          },
        }, priorityStyle.label),
      ]),
      React.createElement('div', { key: 'meta', style: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: PALETTE.textTertiary } }, [
        React.createElement('span', { key: 'subject' }, item.subject),
        React.createElement('span', { key: 'dot1', style: { color: PALETTE.border } }, '·'),
        React.createElement('span', { key: 'type', style: {
          fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
          background: typeStyle.bg, color: typeStyle.color, textTransform: 'uppercase', letterSpacing: '0.05em',
        } }, TYPE_LABELS[item.type]),
        React.createElement('span', { key: 'dot2', style: { color: PALETTE.border } }, '·'),
        React.createElement('span', { key: 'due', style: { color: overdue ? PALETTE.danger : PALETTE.textTertiary, fontWeight: overdue ? 500 : 400 } }, daysUntil(item.dueDate)),
      ]),
    ]),

    // Status badge
    React.createElement('div', { key: 'status', style: { display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 } }, [
      React.createElement('span', {
        key: 'badge', style: {
          fontSize: 11, fontWeight: 500, padding: '4px 12px', borderRadius: 20,
          background: statusStyle.bg, color: statusStyle.color,
          border: `1px solid ${statusStyle.border}`,
        },
      }, statusStyle.label),
      React.createElement('button', {
        key: 'menu', title: 'More actions',
        style: {
          width: 28, height: 28, borderRadius: 6, border: 'none', background: 'transparent',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: hovered ? 1 : 0, transition: 'opacity 0.15s ease',
        },
      }, React.createElement('svg', { width: 16, height: 16, viewBox: '0 0 16 16', fill: PALETTE.textTertiary },
        React.createElement('circle', { cx: 3, cy: 8, r: 1.3 }),
        React.createElement('circle', { cx: 8, cy: 8, r: 1.3 }),
        React.createElement('circle', { cx: 13, cy: 8, r: 1.3 }),
      )),
    ]),
  ]);
}

// ─── Empty State ───────────────────────────────────────────────────────────────
function EmptyState({ icon, title, description, action }) {
  return React.createElement('div', {
    style: {
      background: PALETTE.surface, borderRadius: 14, border: `1.5px dashed ${PALETTE.border}`,
      padding: '60px 32px', textAlign: 'center',
    },
  }, [
    React.createElement('div', { key: 'icon', style: { fontSize: 48, marginBottom: 16, opacity: 0.5 } }, icon),
    React.createElement('h3', {
      key: 'title', style: { fontFamily: TYPOGRAPHY.display, fontSize: 20, fontWeight: 400, color: PALETTE.textPrimary, fontStyle: 'italic', marginBottom: 8, letterSpacing: '-0.01em' },
    }, title),
    React.createElement('p', {
      key: 'desc', style: { fontSize: 13.5, color: PALETTE.textSecondary, marginBottom: 24, maxWidth: 400, margin: '0 auto 24px' },
    }, description),
    action ? React.createElement('button', {
      key: 'action', onClick: action,
      style: {
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '10px 20px', borderRadius: 8, border: 'none',
        fontFamily: TYPOGRAPHY.body, fontSize: 13, fontWeight: 500,
        color: '#fff', background: PALETTE.accent, cursor: 'pointer',
        boxShadow: '0 2px 8px rgba(22,101,52,0.25)',
      },
    }, [
      React.createElement('svg', { key: 'plus', width: 13, height: 13, viewBox: '0 0 13 13', fill: 'none' },
        React.createElement('path', { d: 'M6.5 1v11M1 6.5h11', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' })
      ),
      React.createElement('span', { key: 'text' }, 'Add Assessment'),
    ]) : null,
  ]);
}

// ─── User (placeholder) ────────────────────────────────────────────────────────
const USER_NAME = 'Léo';
const USER_EMAIL = 'leo@lael.app';

// ─── Generic Modal Component ───────────────────────────────────────────────────
function Modal({ open, onClose, title, kicker, children, maxWidth = 520, footer }) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return React.createElement('div', {
    onClick: onClose,
    style: {
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(28, 25, 23, 0.5)',
      backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px',
      animation: 'modalFadeIn 0.18s ease',
    },
  }, [
    React.createElement('style', { key: 'anim' }, `
      @keyframes modalFadeIn { from { opacity: 0; } to { opacity: 1; } }
      @keyframes modalSlideIn { from { opacity: 0; transform: translateY(16px) scale(0.96); } to { opacity: 1; transform: translateY(0) scale(1); } }
    `),
    React.createElement('div', {
      key: 'card',
      onClick: (e) => e.stopPropagation(),
      style: {
        width: '100%', maxWidth,
        background: PALETTE.surface,
        borderRadius: 12,
        boxShadow: '0 32px 100px -20px rgba(28,25,23,0.4), 0 0 0 1px rgba(28,25,23,0.06)',
        display: 'flex', flexDirection: 'column',
        maxHeight: 'calc(100vh - 48px)',
        animation: 'modalSlideIn 0.24s cubic-bezier(0.16, 1, 0.3, 1)',
        overflow: 'hidden',
      },
    }, [
      // Header
      React.createElement('div', {
        key: 'header',
        style: {
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: `1px solid ${PALETTE.borderLight}`,
          background: PALETTE.surface,
        },
      }, [
        React.createElement('div', { key: 'titles' }, [
          React.createElement('h2', {
            key: 'title', style: {
              fontFamily: TYPOGRAPHY.display, fontSize: 18, fontWeight: 500,
              color: PALETTE.textPrimary, fontStyle: 'italic',
              letterSpacing: '-0.015em', margin: 0, lineHeight: 1.3,
            },
          }, title),
        ]),
        React.createElement('button', {
          key: 'close',
          onClick: onClose,
          'aria-label': 'Close',
          style: {
            width: 28, height: 28, borderRadius: 7, border: 'none',
            background: 'transparent', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: PALETTE.textSecondary, flexShrink: 0,
            transition: 'all 0.15s ease',
          },
          onMouseEnter: (e) => e.currentTarget.style.background = PALETTE.bgWarm,
          onMouseLeave: (e) => e.currentTarget.style.background = 'transparent',
        }, React.createElement('svg', { width: 12, height: 12, viewBox: '0 0 12 12', fill: 'none' },
          React.createElement('path', { d: 'M2 2l8 8M10 2l-8 8', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round' })
        )),
      ]),
      // Body
      React.createElement('div', {
        key: 'body', style: { padding: '18px 20px', overflowY: 'auto', flex: 1 },
      }, children),
      // Footer (if provided)
      footer ? React.createElement('div', {
        key: 'footer',
        style: {
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
          gap: 8,
          padding: '12px 20px',
          borderTop: `1px solid ${PALETTE.borderLight}`,
          background: PALETTE.surface,
        },
      }, footer) : null,
    ]),
  ]);
}

// ─── Add Assessment Modal (form contents) ──────────────────────────────────────
function AddAssessmentForm({ onCancel, onSaved }) {
  const [type, setType] = React.useState('exam');
  const [priority, setPriority] = React.useState('medium');
  const [status, setStatus] = React.useState('pending');
  const [title, setTitle] = React.useState('');
  const [subject, setSubject] = React.useState('');
  const [dueDate, setDueDate] = React.useState('2026-06-20');
  const [description, setDescription] = React.useState('');

  const inputBase = {
    width: '100%', padding: '8px 11px',
    borderRadius: 7, border: `1px solid ${PALETTE.border}`,
    background: PALETTE.surface, color: PALETTE.textPrimary,
    fontSize: 13, outline: 'none', fontFamily: TYPOGRAPHY.body,
    transition: 'border-color 0.15s ease, box-shadow 0.15s ease', boxSizing: 'border-box',
  };

  const Field = ({ label, required, hint, children, fullWidth }) =>
    React.createElement('div', {
      style: { gridColumn: fullWidth ? '1 / -1' : 'auto', marginBottom: 12 },
    }, [
      React.createElement('label', {
        key: 'l', style: { display: 'block', fontSize: 11.5, fontWeight: 500, color: PALETTE.textPrimary, marginBottom: 4, letterSpacing: '0.01em' },
      }, [
        label,
        required ? React.createElement('span', { key: 'r', style: { color: PALETTE.danger, marginLeft: 2 } }, '*') : null,
      ]),
      children,
    ]);

  return React.createElement('form', {
    id: 'add-assessment-form',
    onSubmit: (e) => { e.preventDefault(); onSaved && onSaved(); },
    style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 12px' },
  }, [
    // Title (full width)
    React.createElement(Field, { key: 't', label: 'Title', required: true, fullWidth: true },
      React.createElement('input', {
        className: 'form-input',
        type: 'text', value: title, onChange: (e) => setTitle(e.target.value),
        placeholder: 'e.g., Calculus II — Midterm Exam',
        style: inputBase, autoFocus: true,
      })
    ),

    // Subject (full width)
    React.createElement(Field, { key: 's', label: 'Subject / Course', fullWidth: true },
      React.createElement('input', {
        className: 'form-input',
        type: 'text', value: subject, onChange: (e) => setSubject(e.target.value),
        placeholder: 'e.g., Mathematics',
        style: inputBase,
      })
    ),

    // Type (full width)
    React.createElement(Field, { key: 'ty', label: 'Type', required: true, fullWidth: true },
      React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 5 } },
        ['exam', 'quiz', 'assignment', 'project', 'other'].map(t => {
          const style = TYPE_COLORS[t];
          const isSelected = type === t;
          return React.createElement('button', {
            key: t, type: 'button',
            onClick: () => setType(t),
            className: `type-option ${isSelected ? 'selected' : ''}`,
            style: {
              padding: '7px 4px', borderRadius: 6,
              border: `1.5px solid ${isSelected ? PALETTE.accent : PALETTE.border}`,
              background: isSelected ? PALETTE.accentLight : PALETTE.surface,
              cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s ease',
            },
          }, [
            React.createElement('div', { key: 'l', style: {
              fontSize: 9.5, fontWeight: 600, color: isSelected ? PALETTE.accent : style.color,
              textTransform: 'uppercase', letterSpacing: '0.04em',
            } }, TYPE_LABELS[t]),
          ]);
        })
      )
    ),

    // Due Date
    React.createElement(Field, { key: 'd', label: 'Due Date', required: true },
      React.createElement('input', {
        className: 'form-input',
        type: 'date', value: dueDate, onChange: (e) => setDueDate(e.target.value),
        style: inputBase,
      })
    ),

    // Priority
    React.createElement(Field, { key: 'p', label: 'Priority', required: true },
      React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 5 } },
        Object.entries(PRIORITY_CONFIG).map(([key, p]) => {
          const isSelected = priority === key;
          return React.createElement('button', {
            key, type: 'button',
            onClick: () => setPriority(key),
            style: {
              padding: '7px 8px', borderRadius: 6, cursor: 'pointer',
              border: `1.5px solid ${isSelected ? p.color : PALETTE.border}`,
              background: isSelected ? p.bg : PALETTE.surface,
              transition: 'all 0.15s ease',
              display: 'flex', alignItems: 'center', gap: 5, justifyContent: 'center',
            },
          }, [
            React.createElement('span', { key: 'd', style: { width: 6, height: 6, borderRadius: '50%', background: p.color } }),
            React.createElement('span', { key: 'l', style: {
              fontSize: 11.5, fontWeight: 500, color: isSelected ? p.color : PALETTE.textSecondary,
            } }, p.label),
          ]);
        })
      )
    ),

    // Status (full width, dropdown)
    React.createElement(Field, { key: 'st', label: 'Status', fullWidth: true },
      React.createElement('select', {
        className: 'form-input',
        value: status, onChange: (e) => setStatus(e.target.value),
        style: { ...inputBase, cursor: 'pointer' },
      }, [
        React.createElement('option', { key: 'p', value: 'pending' }, 'Pending'),
        React.createElement('option', { key: 'i', value: 'in_progress' }, 'In Progress'),
        React.createElement('option', { key: 'c', value: 'completed' }, 'Completed'),
      ])
    ),

    // Notes (full width)
    React.createElement(Field, { key: 'n', label: 'Notes', fullWidth: true },
      React.createElement('textarea', {
        className: 'form-input',
        value: description, onChange: (e) => setDescription(e.target.value),
        placeholder: 'Optional notes — chapters, requirements, anything to remember',
        rows: 2,
        style: { ...inputBase, resize: 'none', lineHeight: 1.5 },
      })
    ),
  ]);
}

// ─── Page Header (trimmed version) ─────────────────────────────────────────────
function PageHeader({ title, subtitle, actions }) {
  return React.createElement('div', {
    style: {
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      marginBottom: 16, gap: 20, flexWrap: 'wrap',
    },
  }, [
    React.createElement('div', { key: 'l', style: { display: 'flex', alignItems: 'baseline', gap: 12, minWidth: 0 } }, [
      React.createElement('h1', {
        key: 't', style: {
          fontFamily: TYPOGRAPHY.display, fontSize: 30, fontWeight: 400,
          color: PALETTE.textPrimary, fontStyle: 'italic',
          letterSpacing: '-0.02em', lineHeight: 1.1, margin: 0,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        },
      }, title),
      subtitle ? React.createElement('span', {
        key: 's', style: { fontSize: 13, color: PALETTE.textSecondary, paddingTop: 3 },
      }, subtitle) : null,
    ]),
    actions ? React.createElement('div', { key: 'r', style: { display: 'flex', alignItems: 'center', gap: 10 } }, actions) : null,
  ]);
}

// ─── Global Styles Injector ────────────────────────────────────────────────────
const GLOBAL_STYLES = `
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
body {
  font-family: ${TYPOGRAPHY.body};
  background: ${PALETTE.bg};
  color: ${PALETTE.textPrimary};
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  min-height: 100vh;
  line-height: 1.5;
}
button { font-family: inherit; }
input, textarea, select { font-family: inherit; }
a { color: inherit; }
::selection { background: ${PALETTE.accentLight}; color: ${PALETTE.accent}; }
::-webkit-scrollbar { width: 8px; height: 8px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: ${PALETTE.border}; border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: ${PALETTE.textTertiary}; }
.form-input:focus { border-color: ${PALETTE.accent} !important; box-shadow: 0 0 0 3px rgba(22,101,52,0.10); }
.type-option:hover { border-color: ${PALETTE.accent} !important; }
`;

// Expose to window for use in inline scripts
if (typeof window !== 'undefined') {
  window.Lael = {
    PALETTE, TYPOGRAPHY, ASSESSMENTS, STATS, TYPE_LABELS, TYPE_COLORS,
    PRIORITY_CONFIG, STATUS_CONFIG,
    formatDateBadge, daysUntil, isOverdue,
    USER_NAME, USER_EMAIL,
    Navbar, PageContainer, PageHeader, StatCard, AssessmentRow, EmptyState,
    Modal, AddAssessmentForm,
    GLOBAL_STYLES,
  };
}

})();
