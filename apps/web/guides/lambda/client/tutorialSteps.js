// Bilingual content for the guided walkthrough, one step list per screen:
// 'create' (the "Create function" page) and 'function' (the new function's
// page, with the code editor and test). Each step spotlights a section of the
// screen (matched by DOM id) and explains it in plain language, in Hebrew
// (default — this is a Hebrew-language course) and English.
//
// The lab UI itself stays in English, like the real console, so the Hebrew
// copy quotes English field names and terms (Lambda, runtime, Deploy).
// en(s) marks such a term with invisible \u0001...\u0002 markers;
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
  create: {
    he: {
      dir: 'rtl',
      welcome: {
        title: `צרו את פונקציית ה-${en('Lambda')} הראשונה שלכם`,
        body:
          `${en('Lambda')} מריץ קוד בלי שתצטרכו שרת: אתם כותבים פונקציה, ו-${en('AWS')} מריץ אותה רק ` +
          'כשמשהו קורא לה — ומחייב רק על זמן הריצה. במעבדה הזו תיצרו פונקציה, תשנו את הקוד שלה, ' +
          'ותריצו אותה עם אירוע בדיקה. הקוד באמת רץ — בדפדפן שלכם.',
        skip: 'דלגו, אני אסתדר לבד',
        start: 'התחילו בהדרכה',
      },
      ui: HE_UI,
      steps: [
        {
          targetId: 'section-create-option',
          title: 'נקודת התחלה',
          description:
            `${en('Author from scratch')} מתחיל מדוגמת ${en('Hello World')} פשוטה — הדרך הכי טובה ` +
            'להבין מה קורה בתוך פונקציה.',
        },
        {
          targetId: 'section-basic-info',
          title: 'שם, שפה וארכיטקטורה',
          description:
            `שם הפונקציה חייב להיות ייחודי באזור. ${en('Runtime')} היא שפת התכנות וגרסתה — ` +
            `כאן ${en('Node.js')}. ${en('arm64')} (מעבדי ${en('Graviton')}) בדרך כלל זול יותר מ-${en('x86_64')}.`,
          tip: 'במעבדה הזו רק Node.js זמין, כי הקוד רץ בתוך הדפדפן שלכם.',
        },
        {
          targetId: 'section-permissions',
          title: `הרשאות (${en('Execution role')})`,
          description:
            `כל פונקציה רצה עם תפקיד ${en('IAM')} משלה, שקובע אילו שירותים היא רשאית להפעיל. ` +
            `כברירת מחדל ${en('Lambda')} יוצר תפקיד שמאפשר רק לכתוב לוגים ל-${en('CloudWatch Logs')}.`,
          tip: `צריכים שהפונקציה תקרא מ-${en('S3')}? מוסיפים הרשאה לתפקיד — לא שמים מפתחות בקוד.`,
        },
        {
          targetId: 'section-advanced',
          title: `${en('Function URL')}`,
          description:
            `אפשר לתת לפונקציה כתובת ${en('HTTPS')} משלה, ואז לקרוא לה ישירות מדפדפן. ` +
            `עם ${en('NONE')} הכתובת ציבורית לכל אחד — עם ${en('AWS_IAM')} רק משתמשים מורשים.`,
        },
        {
          targetId: 'section-create-button',
          title: 'יצירה',
          description: `לחצו ${en('Create function')} ונעבור לעמוד הפונקציה — שם נכתוב קוד ונריץ אותו.`,
        },
      ],
    },
    en: {
      dir: 'ltr',
      welcome: {
        title: 'Create your first Lambda function',
        body:
          'Lambda runs code without a server: you write a function, and AWS runs it only when something ' +
          "calls it — and charges only for the time it runs. In this lab you'll create a function, change " +
          'its code, and run it with a test event. The code really runs — in your browser.',
        skip: "Skip, I'll explore on my own",
        start: 'Start walkthrough',
      },
      ui: EN_UI,
      steps: [
        {
          targetId: 'section-create-option',
          title: 'Starting point',
          description:
            'Author from scratch starts from a simple Hello World example — the best way to understand ' +
            'what happens inside a function.',
        },
        {
          targetId: 'section-basic-info',
          title: 'Name, language and architecture',
          description:
            'The function name must be unique in the Region. The runtime is the programming language and its ' +
            'version — Node.js here. arm64 (Graviton processors) is usually cheaper than x86_64.',
          tip: 'Only Node.js is available in this lab, because the code runs inside your browser.',
        },
        {
          targetId: 'section-permissions',
          title: 'Permissions (execution role)',
          description:
            'Every function runs with its own IAM role, which decides which services it may call. By default ' +
            'Lambda creates a role that can only write logs to CloudWatch Logs.',
          tip: 'Need the function to read from S3? Add a permission to the role — never put keys in your code.',
        },
        {
          targetId: 'section-advanced',
          title: 'Function URL',
          description:
            'You can give the function its own HTTPS address and call it straight from a browser. With NONE the ' +
            'URL is public to anyone — with AWS_IAM only authorized users can call it.',
        },
        {
          targetId: 'section-create-button',
          title: 'Create',
          description:
            "Click Create function and we'll move to the function's page — where you'll write code and run it.",
        },
      ],
    },
  },

  function: {
    he: {
      dir: 'rtl',
      welcome: {
        title: 'הפונקציה נוצרה!',
        body:
          'עכשיו לחלק המעניין: נעבור על עמוד הפונקציה, נשנה את הקוד, נפרוס אותו ' +
          `(${en('Deploy')}), ונריץ בדיקה (${en('Test')}) כדי לראות את התשובה והלוגים.`,
        skip: 'דלגו, אני אסתדר לבד',
        start: 'התחילו בהדרכה',
      },
      ui: HE_UI,
      steps: [
        {
          targetId: 'section-overview',
          title: 'סקירת הפונקציה',
          description:
            `התרשים מראה מה מפעיל את הפונקציה (${en('Trigger')}) ולאן התוצאה ממשיכה (${en('Destination')}). ` +
            `ה-${en('ARN')} הוא המזהה המלא שלה ב-${en('AWS')}.`,
        },
        {
          targetId: 'section-code',
          title: 'הקוד',
          description:
            `הפונקציה ${en('handler')} נקראת בכל הפעלה. היא מקבלת ${en('event')} — הקלט — ` +
            'ומה שהיא מחזירה הוא התשובה.',
          tip: `נסו להחזיר משהו מה-${en('event')}, למשל ${en('body: event.key1')}, או להוסיף ${en('console.log')}.`,
        },
        {
          targetId: 'section-deploy',
          title: `${en('Deploy')} ו-${en('Test')}`,
          description:
            `שינוי בעורך לא משפיע עד שלוחצים ${en('Deploy')} — רק אז הקוד החדש נכנס לתוקף. ` +
            `${en('Test')} מריץ את הגרסה האחרונה שנפרסה.`,
        },
        {
          targetId: 'section-test-event',
          title: 'אירוע בדיקה',
          description:
            `ה-${en('JSON')} כאן נשלח לפונקציה כ-${en('event')}. בעולם האמיתי האירוע מגיע ממה שהפעיל את הפונקציה — ` +
            `בקשת ${en('HTTP')}, קובץ שהועלה ל-${en('S3')} ועוד.`,
        },
        {
          targetId: 'section-results',
          title: 'תוצאות ולוגים',
          description:
            `אחרי ${en('Test')} תראו את התשובה, כל מה שהודפס עם ${en('console.log')}, ואת שורת ${en('REPORT')}: ` +
            `משך הריצה, הזמן שחויב, והזיכרון. ${en('Init Duration')} מופיע רק בהפעלה הראשונה (${en('Cold start')}).`,
          tip: `נסו לזרוק שגיאה עם ${en("throw new Error('boom')")} ותראו איך נראית ריצה שנכשלה.`,
        },
      ],
    },
    en: {
      dir: 'ltr',
      welcome: {
        title: 'Your function is ready!',
        body:
          "Now for the fun part: we'll tour the function page, change the code, deploy it, and run a test " +
          'to see the response and the logs.',
        skip: "Skip, I'll explore on my own",
        start: 'Start walkthrough',
      },
      ui: EN_UI,
      steps: [
        {
          targetId: 'section-overview',
          title: 'Function overview',
          description:
            'The diagram shows what invokes the function (triggers) and where its result goes (destinations). ' +
            'The ARN is its full identifier in AWS.',
        },
        {
          targetId: 'section-code',
          title: 'The code',
          description:
            'The handler function is called on every invocation. It receives the event — the input — and ' +
            'whatever it returns is the response.',
          tip: 'Try returning something from the event, like body: event.key1, or add a console.log.',
        },
        {
          targetId: 'section-deploy',
          title: 'Deploy and Test',
          description:
            "Edits in the editor don't take effect until you click Deploy — only then does the new code go " +
            'live. Test runs the last deployed version.',
        },
        {
          targetId: 'section-test-event',
          title: 'Test event',
          description:
            'This JSON is passed to the function as the event. In real life the event comes from whatever ' +
            'invoked the function — an HTTP request, a file uploaded to S3, and so on.',
        },
        {
          targetId: 'section-results',
          title: 'Results and logs',
          description:
            'After a test you see the response, everything printed with console.log, and the REPORT line: ' +
            'duration, billed duration and memory. Init Duration only appears on the first run (a cold start).',
          tip: "Try throw new Error('boom') to see what a failed run looks like.",
        },
      ],
    },
  },
};
