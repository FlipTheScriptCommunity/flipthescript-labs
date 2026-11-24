// Bilingual content for the guided walkthrough. Each step spotlights one
// section of the "Create database" page (matched by DOM id) and explains it
// in plain language, in Hebrew (default — this is a Hebrew-language course)
// and English. Like EC2 and VPC, this lab is a single screen, so there's one
// step list.
//
// The lab UI itself stays in English, like the real console, so the Hebrew
// copy quotes English field names and terms (RDS, Multi-AZ, button labels).
// en(s) marks such a term with invisible \u0001...\u0002 markers;
// TutorialOverlay's renderBidi() turns each one into a <bdi dir="ltr">, so
// English words, numbers and punctuation don't scramble the RTL sentence.
const MARK_START = '\u0001';
const MARK_END = '\u0002';
const en = (s) => `${MARK_START}${s}${MARK_END}`;

export const TUTORIAL_CONTENT = {
  he: {
    dir: 'rtl',
    welcome: {
      title: `צרו את מסד הנתונים הראשון שלכם ב-${en('RDS')}`,
      body:
        `${en('RDS')} מריץ בשבילכם מסד נתונים רלציוני מנוהל — ${en('AWS')} דואג לשרת, לגיבויים ולעדכונים, ` +
        `ואתם רק מתחברים ועובדים. ההדרכה הזו עוברת על כל חלק בעמוד "${en('Create database')}" לפי הסדר — ` +
        '11 שלבים בסך הכול. השתמשו ב״הבא״ ו״הקודם״, או צאו בכל שלב.',
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
        targetId: 'section-creation-method',
        title: 'שיטת יצירה',
        description:
          `${en('Standard create')} מציג את כל ההגדרות, כדי שתבינו כל אחת מהן. ` +
          `${en('Easy create')} בוחר ברירות מחדל בשבילכם — נוח, אבל מלמד פחות.`,
      },
      {
        targetId: 'section-engine',
        title: `מנוע מסד הנתונים (${en('Engine')})`,
        description:
          `התוכנה שתרוץ: ${en('MySQL')}, ${en('MariaDB')} או ${en('PostgreSQL')}. ` +
          'כולם מסדי נתונים רלציוניים מבוססי טבלאות ו-SQL, וכולם בקוד פתוח. בחרו את מה שהאפליקציה שלכם מכירה.',
        tip: `שימו לב שהחלפת מנוע משנה גם את הפורט (${en('3306')} או ${en('5432')}) ואת שם המשתמש הראשי.`,
      },
      {
        targetId: 'section-templates',
        title: `תבנית (${en('Template')})`,
        description:
          'התבנית ממלאת ברירות מחדל לפי שימוש: ' +
          `${en('Production')} — זמינות גבוהה וביצועים; ${en('Dev/Test')} — לפיתוח; ` +
          `${en('Free tier')} — המכונה הקטנה ביותר, לתרגול.`,
        tip: 'החליפו תבנית וראו איך הסיכום והעלות בצד ימין משתנים.',
      },
      {
        targetId: 'section-availability',
        title: `זמינות (${en('Multi-AZ')})`,
        description:
          `${en('Multi-AZ')} מקים עותק המתנה (${en('Standby')}) באזור זמינות אחר. אם הראשי נופל, ` +
          `${en('RDS')} עובר אליו אוטומטית. זה מכפיל את המחיר — ולכן לא זמין בתבנית ${en('Free tier')}.`,
      },
      {
        targetId: 'section-settings',
        title: 'שם ופרטי התחברות',
        description:
          `${en('DB instance identifier')} הוא השם של המכונה בחשבון. המשתמש הראשי (${en('Master username')}) ` +
          'הוא המשתמש עם ההרשאות המלאות בתוך מסד הנתונים.',
        tip:
          `${en('Secrets Manager')} שומר ומחליף את הסיסמה בשבילכם — הכי מאובטח. ` +
          `ב-${en('Self managed')} הסיסמה באחריותכם.`,
      },
      {
        targetId: 'section-instance-class',
        title: `גודל המכונה (${en('DB instance class')})`,
        description:
          `כמה מעבדים (${en('vCPU')}) וזיכרון יהיו למסד הנתונים. ` +
          `מחלקות ${en('t')} (${en('Burstable')}) זולות ומתאימות לעומס קל, ` +
          `${en('m')} מאוזנות, ו-${en('r')} עם הרבה זיכרון.`,
      },
      {
        targetId: 'section-storage',
        title: 'אחסון',
        description:
          `כמה ${en('GiB')} לשמור לנתונים, ואיזה סוג דיסק. ${en('gp3')} מתאים כמעט לכל דבר. ` +
          `${en('Storage autoscaling')} מגדיל את הדיסק אוטומטית כשהוא מתמלא, עד הסף שתקבעו.`,
      },
      {
        targetId: 'section-connectivity',
        title: 'רשת וגישה',
        description:
          `מסד הנתונים נוצר בתוך ${en('VPC')}. ${en('Public access')} קובע אם אפשר להגיע אליו מהאינטרנט — ` +
          `כמעט תמיד משאירים ${en('No')}, ומתחברים רק משרתים בתוך ה-${en('VPC')}. ` +
          `${en('Security group')} הוא חומת האש שקובעת מי מורשה להתחבר.`,
      },
      {
        targetId: 'section-authentication',
        title: 'אימות',
        description:
          'איך משתמשים מתחברים למסד הנתונים: בסיסמה בלבד, או גם עם זהות ' +
          `${en('IAM')} — בלי לשמור סיסמאות בקוד.`,
      },
      {
        targetId: 'section-additional',
        title: 'הגדרות נוספות',
        description:
          `${en('Initial database name')} יוצר מסד נתונים ריק מוכן לעבודה. גיבויים אוטומטיים מאפשרים ` +
          `לשחזר לכל נקודת זמן בתקופת השמירה. ${en('Deletion protection')} מונע מחיקה בטעות.`,
      },
      {
        targetId: 'section-summary',
        title: 'סיכום, עלות ויצירה',
        description:
          'כאן רואים את עיקרי ההגדרות והערכה גסה של העלות החודשית. כשהכול נראה טוב, ' +
          `לחצו ${en('Create database')} — ואחרי היצירה חפשו את ה-${en('Endpoint')}, הכתובת שאליה מתחברים.`,
      },
    ],
  },
  en: {
    dir: 'ltr',
    welcome: {
      title: 'Create your first RDS database',
      body:
        'RDS runs a managed relational database for you — AWS takes care of the server, backups and ' +
        'patching, and you just connect and use it. This walkthrough goes through each part of the ' +
        '"Create database" page in order — 11 steps in total. Use Next and Back, or exit at any time.',
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
        targetId: 'section-creation-method',
        title: 'Creation method',
        description:
          'Standard create shows every setting, so you learn what each one does. Easy create picks ' +
          'defaults for you — convenient, but you learn less.',
      },
      {
        targetId: 'section-engine',
        title: 'Database engine',
        description:
          'The software that will run: MySQL, MariaDB or PostgreSQL. All are open-source relational ' +
          'databases built on tables and SQL. Pick the one your application expects.',
        tip: 'Switching engine also changes the port (3306 or 5432) and the master username.',
      },
      {
        targetId: 'section-templates',
        title: 'Template',
        description:
          'A template fills in defaults for a use case: Production — high availability and performance; ' +
          'Dev/Test — for development; Free tier — the smallest instance, for practice.',
        tip: 'Switch templates and watch the summary and cost on the right change.',
      },
      {
        targetId: 'section-availability',
        title: 'Availability (Multi-AZ)',
        description:
          'Multi-AZ keeps a standby copy in another Availability Zone. If the primary fails, RDS fails ' +
          "over to it automatically. It doubles the cost — which is why the Free tier template doesn't allow it.",
      },
      {
        targetId: 'section-settings',
        title: 'Name and credentials',
        description:
          "The DB instance identifier is the instance's name in your account. The master username is the " +
          'user with full privileges inside the database.',
        tip: 'Secrets Manager stores and rotates the password for you — the most secure option. With Self managed, the password is your responsibility.',
      },
      {
        targetId: 'section-instance-class',
        title: 'Instance size (DB instance class)',
        description:
          'How many CPUs (vCPUs) and how much memory the database gets. t (burstable) classes are cheap ' +
          'and fit light workloads, m classes are balanced, and r classes have lots of memory.',
      },
      {
        targetId: 'section-storage',
        title: 'Storage',
        description:
          'How many GiB to reserve for data, and what kind of disk. gp3 fits almost everything. Storage ' +
          'autoscaling grows the disk automatically as it fills up, up to the threshold you set.',
      },
      {
        targetId: 'section-connectivity',
        title: 'Network and access',
        description:
          'The database is created inside a VPC. Public access decides whether it can be reached from the ' +
          'internet — you almost always leave it at No and connect only from servers inside the VPC. The ' +
          'security group is the firewall that decides who may connect.',
      },
      {
        targetId: 'section-authentication',
        title: 'Authentication',
        description:
          'How users connect to the database: with a password only, or also with an IAM identity — ' +
          'without storing passwords in code.',
      },
      {
        targetId: 'section-additional',
        title: 'Additional configuration',
        description:
          'Initial database name creates an empty database ready to use. Automated backups let you restore ' +
          'to any point in time within the retention period. Deletion protection prevents accidental deletes.',
      },
      {
        targetId: 'section-summary',
        title: 'Summary, cost and create',
        description:
          'The key settings and a rough monthly cost estimate. When everything looks right, click Create ' +
          "database — then look for the endpoint, the address you'll connect to.",
      },
    ],
  },
};
