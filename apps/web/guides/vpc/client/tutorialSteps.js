// Bilingual content for the guided walkthrough. Each step spotlights one
// section of the "Create VPC" page (matched by DOM id) and explains it in
// plain language, in both Hebrew (default — this is a Hebrew-language
// course) and English. Unlike the S3 lab, this one is a single screen (like
// EC2), so there's only one step list — no per-section TUTORIAL_CONTENT
// keying needed here.
//
// The underlying lab UI (Cloudscape/AWS console) intentionally stays in
// English — see App.jsx — so the Hebrew copy below still needs to quote or
// reference English field names, button labels, and technical terms (VPC,
// CIDR, NAT gateway, "Internet gateway", ...) so students can match what
// they read here to what they see on screen.
//
// en(s) marks such a term with ... delimiters (plain
// non-printing control characters that can't appear in real content).
// TutorialOverlay's renderBidi() helper splits on these markers at render
// time and wraps each one in a real <bdi dir="ltr"> element — the HTML5
// element built exactly for isolating embedded text of foreign
// directionality — instead of just concatenating it into the Hebrew string.
// Without this, multi-word English phrases, numbers, and punctuation
// embedded in an RTL sentence can visually reorder in unpredictable ways.
const MARK_START = '';
const MARK_END = '';
const en = (s) => `${MARK_START}${s}${MARK_END}`;

export const TUTORIAL_CONTENT = {
  he: {
    dir: 'rtl',
    welcome: {
      title: `צרו את ה-${en('VPC')} הראשון שלכם`,
      body:
        `ההדרכה הזו מדגישה כל חלק בעמוד "${en('Create VPC')}" ומסבירה מה הוא עושה, לפי הסדר שבו ` +
        'בדרך כלל ממלאים אותו — 9 שלבים בסך הכול. השתמשו ב״הבא״ ו״הקודם״ כדי לנווט בין השלבים, ' +
        'או צאו מההדרכה בכל שלב שתרצו.',
      skip: 'דלגו, אני אסתדר לבד',
      start: 'התחילו בהדרכה',
    },
    ui: {
      stepLabel: (index, total) => `שלב ${index} מתוך ${total}`,
      exit: 'יציאה מההדרכה',
      back: 'הקודם',
      next: 'הבא',
      finish: 'סיום',
    },
    steps: [
      {
        targetId: 'section-name-tag',
        title: 'שם בסיס לכל המשאבים',
        description:
          `הערך שתזינו כאן ישמש כקידומת לשמות כל המשאבים שייווצרו — ה-${en('VPC')} עצמו, ה-${en('Subnets')}, ` +
          `טבלאות הניתוב ועוד — בדיוק כמו שהקונסולה האמיתית של ${en('AWS')} עושה אוטומטית.`,
      },
      {
        targetId: 'section-ipv4-cidr',
        title: `טווח כתובות ${en('IPv4')} (${en('CIDR')})`,
        description:
          `כל ${en('VPC')} מקבל טווח כתובות ${en('IP')} פרטי משלו, בסימון ${en('CIDR')} (למשל ${en('10.0.0.0/16')}) — ` +
          `כ-65,536 כתובות אפשריות. מכאן יחולקו טווחי המשנה (${en('Subnets')}) שתגדירו בהמשך.`,
      },
      {
        targetId: 'section-ipv6-cidr',
        title: `כתובות ${en('IPv6')} — אופציונלי`,
        description: `רוב התרגילים לא זקוקים לכך; אפשר פשוט להשאיר על "${en('No IPv6 CIDR block')}".`,
      },
      {
        targetId: 'section-tenancy',
        title: `מודל חומרה (${en('Tenancy')})`,
        description: `"${en('Default')}" (ברירת המחדל) מריץ את המכונות שלכם על חומרה משותפת — זול ומתאים כמעט תמיד.`,
      },
      {
        targetId: 'section-az-subnets',
        title: `אזורי זמינות ו-${en('Subnets')}`,
        description:
          `כל אזור זמינות (${en('Availability Zone')}) הוא מרכז נתונים נפרד פיזית. פיזור ${en('Subnets')} על פני כמה ` +
          `אזורים הוא מה שהופך מערכת לזמינה גבוה — אם אזור אחד נופל, האחרים ממשיכים לעבוד. ${en('Subnet')} ` +
          `"${en('Public')}" מחובר לאינטרנט; ${en('Subnet')} "${en('Private')}" לא.`,
      },
      {
        targetId: 'section-nat-gateways',
        title: `שערי ${en('NAT')} ($)`,
        description:
          `שער ${en('NAT')} מאפשר למשאבים ברשת הפרטית לגשת החוצה לאינטרנט (למשל לעדכוני תוכנה), מבלי שיהיה ` +
          'ניתן לגשת אליהם מבחוץ. יש עלות שעתית לכל שער — זהו המרכיב היקר ביותר בתרגיל הזה.',
        tip: `"${en('None')}" הזול ביותר, אך אומר שמכונות ברשת הפרטית לא יוכלו לגשת לאינטרנט כלל.`,
      },
      {
        targetId: 'section-vpc-endpoints',
        title: `נקודות קצה (${en('VPC Endpoints')})`,
        description:
          `נקודת קצה מסוג ${en('S3 Gateway')} מאפשרת גישה ל-${en('S3')} ישירות מתוך ה-${en('VPC')}, בלי לעבור ` +
          `דרך האינטרנט הציבורי או שער ${en('NAT')} — גם מהיר יותר וגם זול יותר.`,
      },
      {
        targetId: 'section-dns-options',
        title: 'הגדרות DNS',
        description:
          'שתי ההגדרות האלה כמעט תמיד נשארות מופעלות — הן נדרשות עבור רוב השירותים התלויים ב-DNS בתוך ה-VPC.',
      },
      {
        targetId: 'section-summary',
        title: 'תצוגה מקדימה ויצירה',
        description:
          `לוח התצוגה המקדימה מציג מפה חיה של כל המשאבים שעומדים להיווצר — בדיוק כמו בקונסולה האמיתית. ` +
          `בדקו שוב, ולבסוף לחצו על ${en('Create VPC')}.`,
      },
    ],
  },
  en: {
    dir: 'ltr',
    welcome: {
      title: 'Create your first VPC',
      body:
        'This guided walkthrough highlights each part of the "Create VPC" page and explains what it does, ' +
        "in the order you'd normally fill it out — 9 steps in total. Use Next and Back to move through " +
        'them, or exit at any time.',
      skip: "Skip, I'll explore on my own",
      start: 'Start walkthrough',
    },
    ui: {
      stepLabel: (index, total) => `Step ${index} of ${total}`,
      exit: 'Exit walkthrough',
      back: 'Back',
      next: 'Next',
      finish: 'Finish',
    },
    steps: [
      {
        targetId: 'section-name-tag',
        title: 'Base name for all resources',
        description:
          'What you enter here is used as a prefix for every resource that gets created — the VPC itself, ' +
          "subnets, route tables, and more — exactly like AWS's real console does automatically.",
      },
      {
        targetId: 'section-ipv4-cidr',
        title: 'IPv4 address range (CIDR)',
        description:
          'Every VPC gets its own private IP address range, in CIDR notation (e.g. 10.0.0.0/16) — about ' +
          '65,536 possible addresses. The subnets you define next are carved out of this range.',
      },
      {
        targetId: 'section-ipv6-cidr',
        title: 'IPv6 CIDR — optional',
        description:
          'Most exercises don\'t need this; it\'s fine to leave it on "No IPv6 CIDR block".',
      },
      {
        targetId: 'section-tenancy',
        title: 'Tenancy',
        description:
          '"Default" (the default) runs your instances on shared hardware — cheap, and almost always the right choice.',
      },
      {
        targetId: 'section-az-subnets',
        title: 'Availability Zones and subnets',
        description:
          'Each Availability Zone is a physically separate data center. Spreading subnets across more than ' +
          'one AZ is what makes a system highly available — if one AZ goes down, the others keep running. A ' +
          '"Public" subnet is connected to the internet; a "Private" subnet is not.',
      },
      {
        targetId: 'section-nat-gateways',
        title: 'NAT gateways ($)',
        description:
          'A NAT gateway lets resources in a private subnet reach out to the internet (e.g. for software ' +
          "updates) without being reachable from it. There's an hourly cost per gateway — the single most " +
          'expensive part of this exercise.',
        tip: '"None" is cheapest, but means instances in private subnets get no internet access at all.',
      },
      {
        targetId: 'section-vpc-endpoints',
        title: 'VPC endpoints',
        description:
          'An S3 Gateway endpoint lets resources reach S3 directly from inside the VPC, without going over ' +
          'the public internet or through a NAT gateway — both faster and cheaper.',
      },
      {
        targetId: 'section-dns-options',
        title: 'DNS options',
        description:
          'These two settings almost always stay enabled — most VPC-internal services depend on DNS working.',
      },
      {
        targetId: 'section-summary',
        title: 'Preview & create',
        description:
          'The preview panel shows a live map of everything about to be created — exactly like the real ' +
          'console. Double-check it, then click Create VPC.',
      },
    ],
  },
};
