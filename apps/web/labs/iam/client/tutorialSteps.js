// Bilingual content for the guided walkthrough, one step list per screen:
// the three steps of the "Create user" wizard ('details', 'permissions',
// 'review'), then the new user's page ('user'). Each step spotlights a
// section of the screen (matched by DOM id) and explains it in plain
// language, in Hebrew (default — this is a Hebrew-language course) and
// English. Screens reached in the middle of the wizard have no `welcome`, so
// their walkthrough starts straight at the first spotlight.
//
// The lab UI itself stays in English, like the real console, so the Hebrew
// copy quotes English field names and terms (IAM, policy names, button
// labels). en(s) marks such a term with invisible \u0001...\u0002 markers;
// TutorialOverlay's renderBidi() turns each one into a <bdi dir="ltr">, so
// English words, numbers and punctuation don't scramble the RTL sentence.
const MARK_START = '\u0001';
const MARK_END = '\u0002';
const en = (s) => `${MARK_START}${s}${MARK_END}`;

const HE_UI = {
  stepLabel: (index, total) => `שלב ${index} מתוך ${total}`,
  exit: 'יציאה מההדרכה',
  back: 'הקודם',
  next: 'הבא',
  finish: 'סיום',
};

const EN_UI = {
  stepLabel: (index, total) => `Step ${index} of ${total}`,
  exit: 'Exit walkthrough',
  back: 'Back',
  next: 'Next',
  finish: 'Finish',
};

export const TUTORIAL_CONTENT = {
  details: {
    he: {
      dir: 'rtl',
      welcome: {
        title: `צרו את משתמש ה-${en('IAM')} הראשון שלכם`,
        body:
          `${en('IAM')} קובע מי יכול להיכנס לחשבון ה-${en('AWS')} ומה מותר לו לעשות בו. ` +
          `במעבדה הזו תיצרו משתמש חדש באשף בן שלושה שלבים — פרטי המשתמש, הרשאות, ` +
          `ובדיקה לפני יצירה — ואז תבדקו בעזרת ${en('Policy simulator')} מה המשתמש באמת יכול לעשות. ` +
          'בכל מסך תקבלו הדרכה קצרה משלו.',
        skip: 'דלגו, אני אסתדר לבד',
        start: 'התחילו בהדרכה',
      },
      ui: HE_UI,
      steps: [
        {
          targetId: 'section-user-name',
          title: 'שם המשתמש',
          description:
            `שם ייחודי למשתמש בתוך החשבון. הוא מופיע בכל מקום שבו המשתמש מוזכר, ` +
            `וגם בתוך ה-${en('ARN')} שלו — המזהה המלא של המשתמש ב-${en('AWS')}.`,
          tip: `נסו שם שכבר קיים, כמו ${en('admin')}, ותראו את הודעת השגיאה.`,
        },
        {
          targetId: 'section-console-access',
          title: 'גישה לקונסולה',
          description:
            `סמנו את התיבה אם המשתמש צריך להתחבר לקונסולה עם סיסמה. ` +
            `גישה מתוכנתת (${en('Access keys')}) ליצירה מקוד או מה-${en('CLI')} מוסיפים אחרי שהמשתמש נוצר. ` +
            'אם תבחרו בחירת סיסמה ידנית, היא חייבת לעמוד במדיניות הסיסמאות של החשבון.',
          tip:
            `כשמחייבים סיסמה חדשה בכניסה הראשונה, ${en('AWS')} מצמיד למשתמש אוטומטית את ` +
            `${en('IAMUserChangePassword')} כדי שיוכל להחליף אותה. לחצו ${en('Next')} כשתסיימו.`,
        },
      ],
    },
    en: {
      dir: 'ltr',
      welcome: {
        title: 'Create your first IAM user',
        body:
          'IAM controls who can sign in to your AWS account and what they are allowed to do. In this lab ' +
          "you'll create a new user with a three-step wizard — user details, permissions, and review — then " +
          'use the Policy simulator to check what the user can actually do. Each screen has its own short ' +
          'walkthrough.',
        skip: "Skip, I'll explore on my own",
        start: 'Start walkthrough',
      },
      ui: EN_UI,
      steps: [
        {
          targetId: 'section-user-name',
          title: 'User name',
          description:
            "A unique name for the user within the account. It shows up everywhere the user is referenced, including in the user's ARN — its full identifier in AWS.",
          tip: 'Try a name that already exists, like admin, to see the error.',
        },
        {
          targetId: 'section-console-access',
          title: 'Console access',
          description:
            'Check this if the user needs to sign in to the console with a password. Programmatic access ' +
            '(access keys, for code or the CLI) is added after the user is created. A custom password must meet ' +
            "the account's password policy.",
          tip: 'If you require a new password at first sign-in, AWS automatically attaches IAMUserChangePassword so the user can change it. Click Next when you are done.',
        },
      ],
    },
  },

  permissions: {
    he: {
      dir: 'rtl',
      ui: HE_UI,
      steps: [
        {
          targetId: 'section-permissions-options',
          title: 'שלוש דרכים לתת הרשאות',
          description:
            `${en('Add user to group')} — הוספה לקבוצה שכבר יש לה הרשאות. ${en('Copy permissions')} — ` +
            `העתקת ההרשאות של משתמש קיים. ${en('Attach policies directly')} — הצמדת מדיניות (${en('Policy')}) ` +
            'ישירות למשתמש.',
          tip: 'הדרך המומלצת היא קבוצות: משנים הרשאות לקבוצה אחת, וכל החברים בה מתעדכנים יחד.',
        },
        {
          targetId: 'section-permissions-list',
          title: 'בחרו מה המשתמש יקבל',
          description:
            `כל ${en('Policy')} הוא מסמך שמפרט אילו פעולות מותרות. ${en('AdministratorAccess')} מאפשר הכול, ` +
            `ואילו ${en('AmazonS3ReadOnlyAccess')} מאפשר רק לקרוא מ-${en('S3')}. ` +
            'אפשר גם לא לבחור כלום — המשתמש ייווצר, אבל לא יוכל לעשות שום דבר.',
          tip:
            'עקרון ההרשאה המינימלית (Least privilege): תנו רק את מה שהמשתמש באמת צריך. ' +
            `לחצו ${en('Next')} כשתסיימו.`,
        },
      ],
    },
    en: {
      dir: 'ltr',
      ui: EN_UI,
      steps: [
        {
          targetId: 'section-permissions-options',
          title: 'Three ways to grant permissions',
          description:
            'Add user to group — join a group that already has permissions. Copy permissions — copy an ' +
            "existing user's permissions. Attach policies directly — attach policies to the user itself.",
          tip: 'Groups are the recommended way: change permissions on one group, and every member gets the change.',
        },
        {
          targetId: 'section-permissions-list',
          title: 'Choose what the user gets',
          description:
            'A policy is a document listing which actions are allowed. AdministratorAccess allows everything, ' +
            'while AmazonS3ReadOnlyAccess only allows reading from S3. You can also choose nothing — the user ' +
            "is created, but can't do anything.",
          tip: 'Least privilege: grant only what the user actually needs. Click Next when you are done.',
        },
      ],
    },
  },

  review: {
    he: {
      dir: 'rtl',
      ui: HE_UI,
      steps: [
        {
          targetId: 'section-review',
          title: 'בדקו לפני שיוצרים',
          description:
            'כאן מופיע סיכום של כל מה שבחרתם: פרטי המשתמש, והרשאות שיקבל — מקבוצות ומ-' +
            `${en('Policies')} שהוצמדו ישירות. אפשר לחזור לכל שלב עם ${en('Previous')}.`,
        },
        {
          targetId: 'section-tags',
          title: `תגיות (${en('Tags')})`,
          description: `תגיות הן צמדי מפתח-ערך, כמו ${en('team = data')}, שעוזרים לארגן ולחפש משאבים. הן לא משפיעות על ההרשאות.`,
          tip: `כשהכול נראה טוב, לחצו ${en('Create user')}.`,
        },
      ],
    },
    en: {
      dir: 'ltr',
      ui: EN_UI,
      steps: [
        {
          targetId: 'section-review',
          title: 'Review before you create',
          description:
            'A summary of everything you chose: the user details, and the permissions the user will get — ' +
            'from groups and from directly attached policies. Use Previous to go back to any step.',
        },
        {
          targetId: 'section-tags',
          title: 'Tags',
          description:
            'Tags are key-value pairs, like team = data, that help you organize and find resources. They don’t affect permissions.',
          tip: 'When everything looks right, click Create user.',
        },
      ],
    },
  },

  user: {
    he: {
      dir: 'rtl',
      welcome: {
        title: 'המשתמש נוצר!',
        body:
          'עכשיו נכיר את עמוד המשתמש: פרטי הכניסה לקונסולה, ההרשאות שיש לו בפועל, ' +
          `וה-${en('Policy simulator')} — כלי שבודק אם פעולה מסוימת מותרת למשתמש או לא.`,
        skip: 'דלגו, אני אסתדר לבד',
        start: 'התחילו בהדרכה',
      },
      ui: HE_UI,
      steps: [
        {
          targetId: 'section-sign-in',
          title: 'פרטי כניסה לקונסולה',
          description:
            `כתובת הכניסה כוללת את מספר החשבון (${en('Account ID')}). את הסיסמה רואים רק עכשיו — ` +
            'אם היא תאבד, תצטרכו לאפס אותה. שלחו את הפרטים למשתמש בערוץ מאובטח.',
        },
        {
          targetId: 'section-user-permissions',
          title: 'ההרשאות בפועל',
          description:
            `כל ה-${en('Policies')} שחלים על המשתמש — גם אלה שהוצמדו ישירות וגם אלה שהגיעו מקבוצה ` +
            `(העמודה ${en('Attached via')}). אפשר להוסיף עם ${en('Add permissions')} או להסיר עם ${en('Remove')}.`,
        },
        {
          targetId: 'section-simulator',
          title: 'בדקו מה מותר',
          description:
            `בחרו פעולות ולחצו ${en('Run simulation')}. פעולה מותרת רק אם יש ${en('Policy')} שמתיר אותה — ` +
            `אחרת היא נדחית אוטומטית (${en('implicit deny')}).`,
          tip: 'נסו להוסיף או להסיר הרשאה למעלה, ואז להריץ שוב ולראות איך התוצאה משתנה.',
        },
      ],
    },
    en: {
      dir: 'ltr',
      welcome: {
        title: 'Your user is ready!',
        body:
          "Now let's tour the user page: the console sign-in details, the permissions the user actually " +
          'has, and the Policy simulator — a tool that checks whether an action is allowed for the user.',
        skip: "Skip, I'll explore on my own",
        start: 'Start walkthrough',
      },
      ui: EN_UI,
      steps: [
        {
          targetId: 'section-sign-in',
          title: 'Console sign-in details',
          description:
            'The sign-in URL includes your account ID. You can only see the password now — if it gets lost, ' +
            "you'll have to reset it. Send these details to the user through a secure channel.",
        },
        {
          targetId: 'section-user-permissions',
          title: 'Effective permissions',
          description:
            'Every policy that applies to the user — attached directly or inherited from a group (see the ' +
            'Attached via column). Use Add permissions to add more, or Remove to take some away.',
        },
        {
          targetId: 'section-simulator',
          title: "Check what's allowed",
          description:
            'Choose actions and click Run simulation. An action is allowed only if some policy allows it — ' +
            'otherwise it is denied automatically (an implicit deny).',
          tip: 'Try adding or removing a permission above, then run the simulation again and watch the result change.',
        },
      ],
    },
  },
};
