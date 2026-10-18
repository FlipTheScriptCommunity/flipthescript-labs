// Bilingual content for the guided walkthrough. Each step spotlights one
// section of the current screen (matched by DOM id) and explains it in
// plain language, in both Hebrew (default — this is a Hebrew-language
// course) and English.
//
// Unlike the EC2 lab (a single long form), this lab has two separate
// screens — "Create bucket" and "Upload" — so TUTORIAL_CONTENT is keyed by
// section ("create" / "upload") and TutorialOverlay is told which one to
// show via its `section` prop. Each walkthrough auto-opens the first time
// its screen is shown.
//
// The underlying lab UI (Cloudscape/AWS console) intentionally stays in
// English — see App.jsx — so the Hebrew copy below still needs to quote or
// reference English field names, button labels, and technical terms (S3,
// ACL, SSE-KMS, "Block all public access", ...) so students can match what
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
  create: {
    he: {
      dir: 'rtl',
      welcome: {
        title: `צרו את דלי ה-${en('S3')} הראשון שלכם`,
        body:
          `ההדרכה הזו מדגישה כל חלק בעמוד "${en('Create bucket')}" ומסבירה מה הוא עושה, לפי הסדר ` +
          'שבו בדרך כלל ממלאים אותו — 7 שלבים בסך הכול. השתמשו ב״הבא״ ו״הקודם״ כדי לנווט בין השלבים, ' +
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
          targetId: 'section-general-configuration',
          title: 'שם הדלי ואזור',
          description:
            `שם ה-${en('bucket')} חייב להיות ייחודי גלובלית בכל ${en('AWS')} — לא רק בחשבון שלכם — ולכן מוסכמה ` +
            `נפוצה היא לצרף אליו מספרים או מזהה אקראי. השם חייב להיות באותיות קטנות בלבד, ללא רווחים. בחרו גם ` +
            `את ${en('AWS Region')} שבו יישמרו הנתונים בפועל — בדרך כלל האזור הקרוב ביותר למשתמשים שלכם.`,
        },
        {
          targetId: 'section-object-ownership',
          title: `בעלות על אובייקטים (${en('Object Ownership')})`,
          description:
            `"${en('ACLs disabled')}" (ברירת המחדל וההמלצה) אומר שהבעלות על כל קובץ בדלי שייכת תמיד לחשבון שלכם, ` +
            `ושליטה בגישה נעשית אך ורק דרך ${en('policies')} — פשוט יותר ובטוח יותר מרשימות הרשאה ישנות (${en('ACLs')}).`,
        },
        {
          targetId: 'section-block-public-access',
          title: `חסימת גישה ציבורית (${en('Block Public Access')})`,
          description:
            `ברירת המחדל של ${en('AWS')} חוסמת כל גישה ציבורית לדלי ולתכולתו — ארבע הגדרות נפרדות, כולן מופעלות ` +
            `כברירת מחדל. זהו רשת הביטחון הכי חשובה נגד חשיפה בטעות של קבצים לאינטרנט.`,
          tip: `השאירו את "${en('Block all public access')}" מופעל אלא אם אתם בונים, למשל, אתר סטטי ציבורי ויודעים בדיוק מה אתם עושים.`,
        },
        {
          targetId: 'section-bucket-versioning',
          title: `ניהול גרסאות (${en('Bucket Versioning')})`,
          description:
            `כשמופעל, ${en('S3')} שומר כל גרסה קודמת של קובץ שנדרס או נמחק, במקום להחליף אותה סופית. מאפשר ` +
            'לשחזר בטעויות, אך גם מגדיל את עלות האחסון כי כל הגרסאות נשמרות.',
        },
        {
          targetId: 'section-default-encryption',
          title: 'הצפנת ברירת מחדל',
          description:
            `כל קובץ חדש בדלי מוצפן אוטומטית. ${en('SSE-S3')} (מפתחות בניהול ${en('AWS')}) הוא הפשוט והמהיר ביותר; ` +
            `${en('SSE-KMS')} נותן שליטה עדינה יותר על המפתח — כולל מי רשאי להשתמש בו — דרך שירות ${en('AWS KMS')}.`,
        },
        {
          targetId: 'section-advanced-settings',
          title: `נעילת אובייקטים (${en('Object Lock')}) — אופציונלי`,
          description:
            `מונע מחיקה או שינוי של קבצים לפרק זמן קבוע, או לצמיתות — שימושי לדרישות רגולטוריות. ניתן להפעיל ` +
            'רק ברגע יצירת הדלי, ודורש שניהול הגרסאות יהיה מופעל. רוב המתרגלים יכולים להשאיר את זה כבוי.',
        },
        {
          targetId: 'section-summary',
          title: 'בדיקה ויצירה',
          description:
            `לוח ה-${en('Summary')} מציג תצוגה חיה של כל מה שהגדרתם. בדקו שוב את הבחירות שלכם, ולבסוף לחצו על ` +
            `${en('Create bucket')}. מיד לאחר מכן תועברו למסך האובייקטים של הדלי החדש, שם תוכלו להעלות אליו קובץ ראשון.`,
        },
      ],
    },
    en: {
      dir: 'ltr',
      welcome: {
        title: 'Create your first S3 bucket',
        body:
          'This guided walkthrough highlights each part of the "Create bucket" page and explains what it does, ' +
          "in the order you'd normally fill it out — 7 steps in total. Use Next and Back to move through them, " +
          'or exit at any time.',
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
          targetId: 'section-general-configuration',
          title: 'Bucket name and Region',
          description:
            "A bucket's name must be globally unique across all of AWS — not just your account — so it's common " +
            'to append numbers or a random id. Names must be lowercase, with no spaces. Also pick the AWS Region ' +
            'where the data actually lives — usually whichever is closest to your users.',
        },
        {
          targetId: 'section-object-ownership',
          title: 'Object Ownership',
          description:
            '"ACLs disabled" (the default and recommended setting) means every object in the bucket is always ' +
            'owned by your account, and access is controlled only through policies — simpler and safer than the ' +
            'older ACL permission model.',
        },
        {
          targetId: 'section-block-public-access',
          title: 'Block Public Access settings',
          description:
            "AWS's default blocks all public access to the bucket and its contents — four separate settings, " +
            'all on by default. This is the single most important safeguard against accidentally exposing files ' +
            'to the internet.',
          tip: 'Leave "Block all public access" on unless you\'re building something like a public static website and know exactly what you\'re doing.',
        },
        {
          targetId: 'section-bucket-versioning',
          title: 'Bucket Versioning',
          description:
            'When enabled, S3 keeps every previous version of an object that gets overwritten or deleted, instead ' +
            'of replacing it for good. Lets you recover from mistakes, but also increases storage cost since every ' +
            'version is retained.',
        },
        {
          targetId: 'section-default-encryption',
          title: 'Default encryption',
          description:
            'Every new object in the bucket is automatically encrypted. SSE-S3 (AWS-managed keys) is the simplest ' +
            'and fastest; SSE-KMS gives finer control over the key — including who may use it — via the AWS KMS ' +
            'service.',
        },
        {
          targetId: 'section-advanced-settings',
          title: 'Object Lock (optional)',
          description:
            'Prevents objects from being deleted or changed for a fixed period, or indefinitely — useful for ' +
            'regulatory requirements. It can only be turned on at bucket creation, and requires Bucket Versioning ' +
            'to be enabled. Most learners can leave this off.',
        },
        {
          targetId: 'section-summary',
          title: 'Review & create',
          description:
            "The Summary panel is a live preview of everything you've configured. Double-check your choices, then " +
            "click Create bucket. You'll land straight on the new bucket's objects screen, where you can upload a " +
            'first file.',
        },
      ],
    },
  },
  upload: {
    he: {
      dir: 'rtl',
      welcome: {
        title: `העלו את הקובץ הראשון שלכם ל-${en('S3')}`,
        body: `הדרכה קצרה בת 4 שלבים על העלאת קובץ לדלי שיצרתם זה עתה.`,
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
          targetId: 'section-upload-file',
          title: 'בחירת קובץ',
          description: `גררו קובץ לאזור הסימון, או לחצו על "${en('Choose file')}" לבחור אחד מהמחשב שלכם.`,
        },
        {
          targetId: 'section-upload-destination',
          title: 'יעד',
          description:
            `אפשר להוסיף ${en('prefix')} — נתיב בסגנון תיקייה (למשל ${en('images/')}) — כדי לארגן קבצים בתוך הדלי. ` +
            `ל-${en('S3')} אין תיקיות אמיתיות; זה בעצם חלק משם ה-${en('key')} של האובייקט.`,
        },
        {
          targetId: 'section-upload-storage-class',
          title: `סוג אחסון (${en('Storage class')})`,
          description:
            `${en('Standard')} מתאים לרוב השימושים. סוגים זולים יותר כמו ${en('Glacier')} מיועדים לארכיון שניגש ` +
            'אליו לעיתים רחוקות, ולוקח יותר זמן לשחזר ממנו.',
        },
        {
          targetId: 'section-upload-submit',
          title: 'העלאה',
          description: `לחצו על ${en('Upload')} כדי לסיים. לאחר מכן תראו את פרטי האובייקט שנוצר — כולל ה-${en('key')} וה-${en('S3 URI')} שלו.`,
        },
      ],
    },
    en: {
      dir: 'ltr',
      welcome: {
        title: 'Upload your first file to S3',
        body: 'A short, 4-step walkthrough of uploading a file into the bucket you just created.',
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
          targetId: 'section-upload-file',
          title: 'Choose a file',
          description:
            'Drag a file onto the dropzone, or click "Choose file" to pick one from your computer.',
        },
        {
          targetId: 'section-upload-destination',
          title: 'Destination',
          description:
            'You can add a prefix — a folder-style path (e.g. images/) — to organize files inside the bucket. ' +
            "S3 doesn't have real folders; this is really just part of the object's key name.",
        },
        {
          targetId: 'section-upload-storage-class',
          title: 'Storage class',
          description:
            'Standard fits most use cases. Cheaper classes like Glacier are meant for archives you rarely access, ' +
            'and take longer to retrieve from.',
        },
        {
          targetId: 'section-upload-submit',
          title: 'Upload',
          description:
            "Click Upload to finish. You'll then see the created object's details, including its key and S3 URI.",
        },
      ],
    },
  },
};
