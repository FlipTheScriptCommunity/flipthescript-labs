// Bilingual content for the guided walkthrough. Each step spotlights one
// section of the launch page (matched by DOM id) and explains it in plain
// language, in both Hebrew (default — this is a Hebrew-language course) and
// English.
//
// The underlying lab UI (Cloudscape/AWS console) intentionally stays in
// English — see App.jsx — so the Hebrew copy below still needs to quote or
// reference English field names, button labels, and technical terms
// (EC2, AMI, t2.micro, "Free tier eligible", ...) so students can match what
// they read here to what they see on screen.
//
// en(s) marks such a term with ... delimiters (plain
// non-printing control characters that can't appear in real content).
// TutorialOverlay's renderBidi() helper splits on these markers at render
// time and wraps each one in a real <bdi dir="ltr"> element — the HTML5
// element built exactly for isolating embedded text of foreign
// directionality — instead of just concatenating it into the Hebrew string.
// Without this, multi-word English phrases, numbers, and punctuation
// embedded in an RTL sentence can visually reorder in unpredictable ways.
const MARK_START = '';
const MARK_END = '';
const en = (s) => `${MARK_START}${s}${MARK_END}`;

export const TUTORIAL_CONTENT = {
  he: {
    dir: 'rtl',
    welcome: {
      title: `הפעילו את מכונת ה-${en('EC2')} הראשונה שלכם`,
      body:
        `ההדרכה הזו מדגישה כל חלק בעמוד "${en('Launch an instance')}" ומסבירה מה הוא עושה, ` +
        'לפי הסדר שבו בדרך כלל ממלאים אותו — 8 שלבים בסך הכול. השתמשו ב״הבא״ ו״הקודם״ כדי ' +
        'לנווט בין השלבים, או צאו מההדרכה בכל שלב שתרצו.',
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
        targetId: 'section-name-and-tags',
        title: 'שם ותגיות',
        description:
          `תנו למכונה שם תיאורי, למשל "${en('my-first-server')}". AWS מציג את זה כתגית ה-${en('Name')} ` +
          'של המכונה לאורך כל הקונסולה, מה שמקל למצוא אותה מאוחר יותר. תגיות נוספות הן זוגות ' +
          'מפתח/ערך אופציונליים שאפשר להוסיף לצורכי ארגון או חיוב.',
      },
      {
        targetId: 'section-ami',
        title: `בחירת מערכת הפעלה (${en('AMI')})`,
        description:
          `${en('AMI')} (${en('Amazon Machine Image')}) היא תבנית מערכת ההפעלה שממנה עולה המכונה שלכם — ` +
          `בדיוק כמו לבחור אילו מערכת הפעלה להתקין. לצורכי לימוד, מומלץ לבחור ${en('Amazon Linux')} או ${en('Ubuntu')}.`,
        tip: `טיפ: שלבו ${en('AMI')} שמסומן "${en('Free tier eligible')}" עם סוג מכונה שגם הוא זכאי ל-${en('Free Tier')}, כדי להימנע מחיובים לא צפויים.`,
      },
      {
        targetId: 'section-instance-type',
        title: `בחירת סוג מכונה (${en('Instance Type')})`,
        description:
          'סוג המכונה קובע כמה כוח מעבד וזיכרון יהיו לשרת הווירטואלי שלכם. ' +
          `${en('t2.micro')} / ${en('t3.micro')} (${en('1–2 vCPU')}, ${en('1 GiB')} זיכרון) זכאים ל-${en('Free Tier')} ` +
          `ומספיקים בהחלט לתרגול. סוגים גדולים יותר כמו ${en('m5')} או ${en('c5')} עולים יותר לשעה ומיועדים לעומסי עבודה אמיתיים.`,
      },
      {
        targetId: 'section-key-pair',
        title: `מפתח התחברות (${en('Key Pair')})`,
        description:
          `מפתח ההתחברות הוא האמצעי המאובטח שדרכו תתחברו למכונה שלכם באמצעות ${en('SSH')}. ל-AWS שמור ` +
          `החצי הציבורי; אתם מורידים את החצי הפרטי (קובץ ${en('.pem')}) פעם אחת בלבד, והוא לא יוצג שוב ` +
          'לעולם — לכן שמרו אותו במקום בטוח. אם תאבדו אותו, אין דרך לשחזר אותו עבור המכונה הזאת.',
        tip: `פעם ראשונה? בחרו "${en('Create new key pair')}" ושמרו את הקובץ שהורדתם — תזדקקו לו כדי להתחבר.`,
      },
      {
        targetId: 'section-network-settings',
        title: 'הגדרות רשת',
        description:
          `כאן קובעים היכן המכונה שלכם "יושבת" ברשת ואיזו תעבורה מותר שתגיע אליה. קבוצת האבטחה ` +
          `(${en('Security Group')}) היא חומת אש וירטואלית — כברירת מחדל היא פותחת רק את פורט ${en('22')} ` +
          `(${en('SSH')}) מ-"${en('My IP')}", כך שרק אתם יכולים להתחבר.`,
        tip: `הימנעו מפתיחת פורטים ל-"${en('Anywhere (0.0.0.0/0)')}" אלא אם אתם באמת זקוקים לגישה פומבית — כך אתם חושפים את המכונה לכל האינטרנט.`,
      },
      {
        targetId: 'section-storage',
        title: 'הגדרת אחסון',
        description:
          `זהו כונן ה-${en('EBS')} הראשי (${en('root volume')}) — הדיסק הווירטואלי שעליו יושבים מערכת ` +
          `ההפעלה והקבצים שלכם. ברירת המחדל, ${en('8 GiB')} מסוג ${en('gp3')}, זכאית ל-${en('Free Tier')} ` +
          'ומספיקה לרוב תרגילי הקורס. אפשר להוסיף כרכים נוספים בהמשך אם פרויקט מסוים דורש יותר מקום.',
      },
      {
        targetId: 'section-advanced-details',
        title: 'הגדרות מתקדמות (אופציונלי)',
        description:
          `רוב המתחילים יכולים להשאיר את הסעיף הזה סגור. הוא כולל הגדרות אופציונליות: תפקיד ` +
          `${en('IAM')} (הרשאות גישה לשירותי AWS אחרים), מה קורה בכיבוי, הגנת מחיקה (${en('Termination protection')}), ` +
          `ו-"${en('User data')}" — סקריפט שרץ אוטומטית בהפעלה הראשונה של המכונה.`,
      },
      {
        targetId: 'section-summary',
        title: 'בדיקה והפעלה',
        description:
          `לוח ה-${en('Summary')} מציג תצוגה חיה של כל מה שהגדרתם, כולל האם המכונה זכאית ל-${en('Free Tier')}. ` +
          `קבעו כמה מכונות להפעיל, בדקו שוב את הבחירות שלכם, ולבסוף לחצו על ${en('Launch instance')}.`,
        tip: 'זכרו: AWS מחייבת אתכם על מכונות פעילות לפי שנייה. עצרו או סגרו מכונות שאינכם צריכים, כדי לא להשאיר אותן פועלות לריק.',
      },
    ],
  },
  en: {
    dir: 'ltr',
    welcome: {
      title: 'Launch your first EC2 instance',
      body:
        'This guided walkthrough highlights each part of the "Launch an instance" page and explains ' +
        "what it does, in the order you'd normally fill it out — 8 steps in total. Use Next and Back " +
        'to move through them, or exit at any time.',
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
        targetId: 'section-name-and-tags',
        title: 'Name and tags',
        description:
          'Give your instance a descriptive name, like "my-first-server". AWS shows this as the ' +
          "instance's Name tag throughout the console, which makes it much easier to find later. " +
          'Additional tags are optional key/value labels you can add for your own organization or billing.',
      },
      {
        targetId: 'section-ami',
        title: 'Choose an OS image (AMI)',
        description:
          'An AMI (Amazon Machine Image) is the operating system template your instance boots from — ' +
          'think of it as choosing which OS to install. For learning, pick Amazon Linux or Ubuntu.',
        tip: 'Tip: pair a "Free tier eligible" AMI with a "Free tier eligible" instance type to avoid unexpected charges.',
      },
      {
        targetId: 'section-instance-type',
        title: 'Pick an instance type',
        description:
          'The instance type sets how much CPU and memory your virtual server gets. t2.micro / t3.micro ' +
          '(1–2 vCPUs, 1 GiB memory) are free-tier eligible and plenty for coursework. Larger types like ' +
          'm5 or c5 cost more per hour and are meant for real workloads.',
      },
      {
        targetId: 'section-key-pair',
        title: 'Key pair (login)',
        description:
          "A key pair is how you'll securely connect to your instance over SSH. AWS keeps the public " +
          "half; you download the private half (a .pem file) once, and it's never shown again — so save " +
          "it somewhere safe. If you lose it, there's no way to recover it for that instance.",
        tip: 'First time? Choose "Create new key pair" and keep the downloaded file — you\'ll need it to connect.',
      },
      {
        targetId: 'section-network-settings',
        title: 'Network settings',
        description:
          'This controls where your instance lives on the network and what traffic can reach it. The ' +
          'security group is a virtual firewall — by default it only opens port 22 (SSH) from "My IP," ' +
          'so only you can connect.',
        tip: 'Avoid opening ports to "Anywhere (0.0.0.0/0)" unless you specifically need public access — it exposes the instance to the whole internet.',
      },
      {
        targetId: 'section-storage',
        title: 'Configure storage',
        description:
          'This is the root EBS volume — the virtual hard disk your OS and files live on. The default, ' +
          '8 GiB of gp3 storage, is free-tier eligible and enough for most classroom exercises. You can ' +
          'add more volumes later if a project needs extra space.',
      },
      {
        targetId: 'section-advanced-details',
        title: 'Advanced details (optional)',
        description:
          'Most beginners can leave this section collapsed. It holds optional settings: an IAM role ' +
          '(permissions to reach other AWS services), what happens on shutdown, termination protection, ' +
          'and "User data" — a startup script that runs automatically the first time the instance boots.',
      },
      {
        targetId: 'section-summary',
        title: 'Review & launch',
        description:
          "The Summary panel is a live preview of everything you've configured, including whether it " +
          'qualifies for the Free Tier. Set how many instances to launch, double-check your choices, then ' +
          'click Launch instance.',
        tip: "Remember: AWS bills running instances by the second. Stop or terminate instances you're done with so you don't leave them running unnecessarily.",
      },
    ],
  },
};
