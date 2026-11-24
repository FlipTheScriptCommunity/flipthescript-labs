import {
  LAB_BUCKET,
  LAB_FUNCTION,
  LAB_OBJECT_KEY,
} from '../challenges/challenges';
import { en } from '../lib/bidi';
import type { Lang } from '../lib/i18n';
import { href } from '../lib/router';

// Guided walkthroughs, one per challenge. Each step spotlights one element of
// the console (matched by DOM id) and explains it in plain language.
//
// Unlike the EC2 lab's single-page form, these span several pages, so a step
// can name a `route`: moving to that step navigates there first. The overlay
// never blocks the console — students click the real buttons themselves while
// it's open, and a step whose element isn't on screen yet (say, the bucket page
// before the bucket exists) waits for it to appear.
//
// The console itself stays in English like the real one, so the Hebrew copy
// quotes English labels via en() — see src/lib/bidi.tsx.

export interface TutorialStep {
  targetId: string;
  route?: string;
  title: string;
  description: string;
  tip?: string;
}

export interface TutorialContent {
  welcome: { title: string; body: string };
  steps: TutorialStep[];
}

export const TUTORIAL_UI = {
  he: {
    stepLabel: (index: number, total: number) => `שלב ${index} מתוך ${total}`,
    exit: 'יציאה מההדרכה',
    back: 'הקודם',
    next: 'הבא',
    finish: 'סיום',
    skip: 'דלגו, אני אסתדר לבד',
    start: 'התחילו בהדרכה',
    waiting: 'החלק הזה עוד לא מופיע במסך — השלימו קודם את הפעולה מהשלב הקודם.',
  },
  en: {
    stepLabel: (index: number, total: number) => `Step ${index} of ${total}`,
    exit: 'Exit tutorial',
    back: 'Back',
    next: 'Next',
    finish: 'Finish',
    skip: "Skip, I'll figure it out",
    start: 'Start the tutorial',
    waiting:
      "This part isn't on screen yet — finish the action from the previous step first.",
  },
} satisfies Record<Lang, Record<string, unknown>>;

const CHECK_STEP = {
  targetId: 'challenge-panel',
  he: {
    title: 'בדקו את העבודה שלכם',
    description: `בפאנל הזה מופיעות משימות האתגר. לחצו "בדקו את העבודה שלי" — הבדיקה פונה ל-${en('Floci')} ובודקת את המשאבים שיצרתם בפועל, לא על אילו כפתורים לחצתם.`,
    tip: 'משימה שנכשלה מסבירה מה חסר. פתחו את הרמז שלה אם נתקעתם.',
  },
  en: {
    title: 'Check your work',
    description:
      'This panel lists the challenge tasks. Choose "Check my work" — it asks Floci about the resources you actually created, not which buttons you clicked.',
    tip: "A failed task explains what's missing. Open its hint if you get stuck.",
  },
};

export const TUTORIALS: Record<string, Record<Lang, TutorialContent>> = {
  's3-first-bucket': {
    he: {
      welcome: {
        title: `הדלי הראשון שלכם ב-${en('S3')}`,
        body:
          `${en('Amazon S3')} הוא שירות האחסון של ${en('AWS')}: שומרים בו קבצים ("אובייקטים") בתוך "דליים". ` +
          `הקונסולה שמולכם מחוברת ל-${en('Floci')} — אמולטור ${en('AWS')} שרץ בתוך ה-${en('Codespace')} שלכם — אז כל מה שתיצרו כאן אמיתי, אבל חינמי ולא נוגע בחשבון ${en('AWS')}. ` +
          'ההדרכה תלווה אתכם שלב אחר שלב; אתם לוחצים על הכפתורים בעצמכם.',
      },
      steps: [
        {
          targetId: 's3-buckets-table',
          route: href.buckets(),
          title: 'רשימת הדליים',
          description: `זה עמוד הבית של ${en('S3')}. כל דלי (${en('Bucket')}) בחשבון מופיע כאן. דלי הוא מיכל לאובייקטים — קצת כמו תיקייה ראשית — וכל אובייקט ב-${en('S3')} חייב לשבת בתוך דלי.`,
        },
        {
          targetId: 'btn-create-bucket',
          title: 'יצירת דלי',
          description: `לחצו על ${en('Create bucket')} כדי לפתוח את טופס יצירת הדלי, ואז לחצו "הבא".`,
        },
        {
          targetId: 'field-bucket-name',
          route: href.createBucket(),
          title: 'שם הדלי',
          description: `הקלידו ${en(LAB_BUCKET)}. שמות דליים ב-${en('AWS')} ייחודיים בכל העולם — אם מישהו אחר כבר תפס שם, לא תוכלו להשתמש בו. לכן השם יכול להכיל רק אותיות קטנות, ספרות, נקודות ומקפים.`,
          tip: `ב-${en('AWS')} האמיתי מקובל להוסיף לשם קידומת ייחודית (שם הצוות או מספר החשבון) כדי להימנע מהתנגשויות.`,
        },
        {
          targetId: 'section-block-public-access',
          title: 'חסימת גישה ציבורית',
          description: `כברירת מחדל, דלי חדש חסום לגישה מהאינטרנט. זו אחת ההגדרות החשובות ביותר ב-${en('S3')}: הרבה דליפות מידע מפורסמות קרו בגלל דליים שנפתחו לציבור בטעות.`,
        },
        {
          targetId: 'btn-create-bucket-submit',
          title: 'יוצרים את הדלי',
          description: `לחצו ${en('Create bucket')}. הקונסולה שולחת בקשת ${en('CreateBucket')} אמיתית (אפשר לראות אותה בלשונית ${en('Network')} בכלי המפתחים) ומעבירה אתכם לעמוד הדלי.`,
        },
        {
          targetId: 's3-objects-table',
          route: href.bucket(LAB_BUCKET),
          title: 'אובייקטים ומפתחות',
          description: `זה התוכן של הדלי. כל אובייקט נשמר תחת מפתח (${en('Key')}) — השם המלא שלו בתוך הדלי, למשל ${en(LAB_OBJECT_KEY)} או ${en('images/logo.png')}. ב-${en('S3')} אין באמת תיקיות: ה-${en('/')} הוא פשוט חלק מהמפתח.`,
        },
        {
          targetId: 'btn-create-text-object',
          title: `יוצרים את ${en(LAB_OBJECT_KEY)}`,
          description: `לחצו ${en('Create text file')}, השאירו את השם ${en(LAB_OBJECT_KEY)}, כתבו טקסט כלשהו ולחצו ${en('Create')}. (אפשר גם ${en('Upload')} עם קובץ אמיתי מהמחשב — העיקר שהשם יהיה ${en(LAB_OBJECT_KEY)}.)`,
        },
        { targetId: CHECK_STEP.targetId, ...CHECK_STEP.he },
      ],
    },
    en: {
      welcome: {
        title: 'Your first S3 bucket',
        body:
          'Amazon S3 is AWS storage: you keep files ("objects") inside "buckets". ' +
          'This console is wired to Floci — an AWS emulator running inside your Codespace — so everything you create here is real, but free and nowhere near an AWS account. ' +
          'The tutorial walks you through it step by step; you click the buttons yourself.',
      },
      steps: [
        {
          targetId: 's3-buckets-table',
          route: href.buckets(),
          title: 'Your buckets',
          description:
            'This is the S3 home page. Every bucket in the account shows up here. A bucket is a container for objects — a bit like a top-level folder — and every S3 object lives in a bucket.',
        },
        {
          targetId: 'btn-create-bucket',
          title: 'Create a bucket',
          description:
            'Choose Create bucket to open the form, then choose Next.',
        },
        {
          targetId: 'field-bucket-name',
          route: href.createBucket(),
          title: 'Bucket name',
          description: `Type ${LAB_BUCKET}. Bucket names are unique across all of AWS — if someone else has a name, you can't use it. That's also why names are limited to lowercase letters, numbers, dots, and hyphens.`,
          tip: 'On real AWS, teams usually prefix bucket names with something unique (a team name or account ID) to avoid clashes.',
        },
        {
          targetId: 'section-block-public-access',
          title: 'Block Public Access',
          description:
            'New buckets are blocked from public internet access by default. This is one of the most important S3 settings: many well-known data leaks came from buckets opened to the public by mistake.',
        },
        {
          targetId: 'btn-create-bucket-submit',
          title: 'Create it',
          description:
            'Choose Create bucket. The console sends a real CreateBucket API call (you can watch it in your browser dev tools Network tab) and takes you to the bucket.',
        },
        {
          targetId: 's3-objects-table',
          route: href.bucket(LAB_BUCKET),
          title: 'Objects and keys',
          description: `These are the bucket's contents. Each object is stored under a key — its full name inside the bucket, like ${LAB_OBJECT_KEY} or images/logo.png. S3 has no real folders: the "/" is just part of the key.`,
        },
        {
          targetId: 'btn-create-text-object',
          title: `Create ${LAB_OBJECT_KEY}`,
          description: `Choose Create text file, keep the name ${LAB_OBJECT_KEY}, write any text, and choose Create. (You can also Upload a real file from your computer — just name it ${LAB_OBJECT_KEY}.)`,
        },
        { targetId: CHECK_STEP.targetId, ...CHECK_STEP.en },
      ],
    },
  },

  'lambda-reads-s3': {
    he: {
      welcome: {
        title: `פונקציית ${en('Lambda')} שקוראת מ-${en('S3')}`,
        body:
          `${en('AWS Lambda')} מריץ את הקוד שלכם בלי שתצטרכו לנהל שרת: אתם מעלים פונקציה, ו-${en('AWS')} מריץ אותה בכל פעם שמשהו מפעיל אותה — ומחייב רק על זמן הריצה. ` +
          `באתגר הזה תכתבו פונקציה שקוראת את ${en(LAB_OBJECT_KEY)} מהדלי שיצרתם ומחזירה את התוכן שלו. הפונקציה תרוץ בקונטיינר אמיתי בתוך ה-${en('Codespace')}.`,
      },
      steps: [
        {
          targetId: 'lambda-functions-table',
          route: href.functions(),
          title: 'רשימת הפונקציות',
          description: `כאן מופיעות כל פונקציות ה-${en('Lambda')} בחשבון. פונקציה היא יחידת קוד קטנה עם תפקיד אחד — למשל לעבד קובץ שהועלה, או לענות לבקשת ${en('API')}.`,
        },
        {
          targetId: 'btn-create-function',
          title: 'יצירת פונקציה',
          description: `לחצו ${en('Create function')}, ואז "הבא".`,
        },
        {
          targetId: 'field-function-name',
          route: href.createFunction(),
          title: 'שם הפונקציה',
          description: `הקלידו ${en(LAB_FUNCTION)}. השם משמש לזהות את הפונקציה בכל מקום — כשמפעילים אותה, בלוגים ובהרשאות.`,
        },
        {
          targetId: 'field-runtime',
          title: `סביבת ריצה (${en('Runtime')})`,
          description: `ה-${en('Runtime')} קובע באיזו שפה כתובה הפונקציה ובאיזו גרסה. השאירו ${en('Node.js 22.x')} — הוא כבר כולל את ה-${en('AWS SDK')}, כך שלא צריך להתקין שום חבילה.`,
        },
        {
          targetId: 'field-role',
          title: `תפקיד הרצה (${en('Execution role')})`,
          description: `כל פונקציה רצה עם תפקיד ${en('IAM')} שקובע למה מותר לה לגשת. ב-${en('AWS')} האמיתי, כדי לקרוא מ-${en('S3')} התפקיד חייב לכלול הרשאת ${en('s3:GetObject')} על הדלי — אחרת תקבלו ${en('AccessDenied')}.`,
          tip: `${en('Floci')} לא אוכף הרשאות, לכן כאן התפקיד קבוע. בעבודה אמיתית נותנים לכל פונקציה רק את ההרשאות המינימליות שהיא צריכה (${en('least privilege')}).`,
        },
        {
          targetId: 'field-function-code',
          title: 'הקוד',
          description: `זה קוד ההתחלה. ${en('Lambda')} קורא לפונקציה ${en('handler')} פעם אחת בכל הפעלה, ומעביר לה את ה-${en('event')} — המידע על מה שהפעיל אותה. מה שהפונקציה מחזירה הוא התשובה. בינתיים השאירו אותו כמו שהוא — נשנה אותו בעוד רגע.`,
        },
        {
          targetId: 'btn-create-function-submit',
          title: 'יוצרים את הפונקציה',
          description: `לחצו ${en('Create function')}. הקונסולה אורזת את הקוד לקובץ ${en('.zip')} (כך ${en('Lambda')} מקבל קוד), שולחת אותו ל-${en('Floci')} ומחכה שהפונקציה תהיה מוכנה.`,
        },
        {
          targetId: 'function-code',
          route: href.fn(LAB_FUNCTION),
          title: `קוראים מ-${en('S3')}`,
          description: `עכשיו החליפו את הקוד בקוד שקורא את ${en(LAB_OBJECT_KEY)} בעזרת ${en('GetObjectCommand')} — יש דוגמה ברמז של המשימה בפאנל האתגר. שימו לב שאין בקוד כתובת שרת או סיסמאות: ${en('Lambda')} מספק לפונקציה את האזור וההרשאות דרך משתני סביבה, וה-${en('SDK')} מוצא אותם לבד.`,
          tip: `${en('Floci')} מוסיף גם את ${en('AWS_ENDPOINT_URL')} כדי שה-${en('SDK')} יפנה אליו ולא ל-${en('AWS')} האמיתי. לכן אותו קוד בדיוק ירוץ גם בענן.`,
        },
        {
          targetId: 'btn-deploy',
          title: `${en('Deploy')}`,
          description: `לחצו ${en('Deploy')}. עריכה בעורך לא משנה את הפונקציה — רק ${en('Deploy')} מעלה את הגרסה החדשה. זו טעות נפוצה לבדוק לפני ${en('Deploy')} ולראות את הקוד הישן רץ.`,
        },
        {
          targetId: 'function-test',
          title: 'בודקים את הפונקציה',
          description: `כאן מפעילים את הפונקציה עם ${en('event')} לדוגמה. לחצו ${en('Test')}: ${en('Floci')} מרים קונטיינר ${en('Lambda')} אמיתי, מריץ את הקוד ומחזיר את התשובה. ההפעלה הראשונה איטית יותר (${en('cold start')}) — גם ב-${en('AWS')} האמיתי.`,
        },
        { targetId: CHECK_STEP.targetId, ...CHECK_STEP.he },
      ],
    },
    en: {
      welcome: {
        title: 'Deploy a Lambda that reads S3',
        body:
          'AWS Lambda runs your code without you managing a server: you upload a function, and AWS runs it whenever something triggers it — billing only for the time it runs. ' +
          `In this challenge you'll write a function that reads ${LAB_OBJECT_KEY} from the bucket you created and returns its contents. It runs in a real container inside your Codespace.`,
      },
      steps: [
        {
          targetId: 'lambda-functions-table',
          route: href.functions(),
          title: 'Your functions',
          description:
            'Every Lambda function in the account is listed here. A function is a small unit of code with one job — say, processing an uploaded file or answering an API request.',
        },
        {
          targetId: 'btn-create-function',
          title: 'Create a function',
          description: 'Choose Create function, then choose Next.',
        },
        {
          targetId: 'field-function-name',
          route: href.createFunction(),
          title: 'Function name',
          description: `Type ${LAB_FUNCTION}. The name identifies the function everywhere — when invoking it, in logs, and in permissions.`,
        },
        {
          targetId: 'field-runtime',
          title: 'Runtime',
          description:
            'The runtime sets the language and version your function is written in. Keep Node.js 22.x — it already ships with the AWS SDK, so there is nothing to install.',
        },
        {
          targetId: 'field-role',
          title: 'Execution role',
          description:
            "Every function runs with an IAM role that decides what it's allowed to access. On real AWS, reading from S3 requires the role to grant s3:GetObject on the bucket — otherwise you get AccessDenied.",
          tip: "Floci doesn't enforce permissions, so the role is fixed here. In real work you give each function only the permissions it needs (least privilege).",
        },
        {
          targetId: 'field-function-code',
          title: 'The code',
          description:
            "This is the starter code. Lambda calls the handler once per invocation, passing it the event — the details of whatever triggered it. Whatever the handler returns is the response. Leave it as is for now — you'll change it in a moment.",
        },
        {
          targetId: 'btn-create-function-submit',
          title: 'Create it',
          description:
            'Choose Create function. The console packs the code into a .zip (that is how Lambda takes code), sends it to Floci, and waits for the function to become ready.',
        },
        {
          targetId: 'function-code',
          route: href.fn(LAB_FUNCTION),
          title: 'Read from S3',
          description: `Now replace the code with code that reads ${LAB_OBJECT_KEY} using GetObjectCommand — there's an example in the task hint in the challenge panel. Notice there's no server address or password in the code: Lambda hands the function its region and credentials through environment variables, and the SDK finds them on its own.`,
          tip: 'Floci also sets AWS_ENDPOINT_URL so the SDK talks to it instead of real AWS. That is why the exact same code runs in the cloud too.',
        },
        {
          targetId: 'btn-deploy',
          title: 'Deploy',
          description:
            'Choose Deploy. Editing in the editor does not change the function — only Deploy uploads the new version. Testing before deploying, and seeing the old code run, is a very common mistake.',
        },
        {
          targetId: 'function-test',
          title: 'Test it',
          description:
            'This invokes the function with a sample event. Choose Test: Floci starts a real Lambda container, runs your code, and returns the response. The first invocation is slower (a "cold start") — on real AWS too.',
        },
        { targetId: CHECK_STEP.targetId, ...CHECK_STEP.en },
      ],
    },
  },
};
