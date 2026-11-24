export interface Guide {
  id: string;
  title: string;
  summary: string;
  /**
   * Path (under /public) to a self-contained static guide experience, e.g. a
   * pre-built interactive simulator. When set, the guide page embeds it in an
   * iframe instead of rendering the "coming soon" placeholder. Kept isolated
   * from the site's own RTL/dark theme on purpose — see
   * apps/web/guides/<guideId>/README.md for the source of the embedded bundle.
   */
  embedPath?: string;
  /**
   * Short, plain-language paragraphs (Hebrew) explaining what the guide is
   * about and what students will practice. Rendered on the guide page above
   * the embedded content.
   */
  about?: string[];
}

/**
 * A learning track. Today it holds step-by-step guides (הדרכות); hands-on
 * labs (מעבדות) — multi-service challenges run against a local Floci
 * environment and checked automatically — will join it as a separate list.
 */
export interface Track {
  id: string;
  title: string;
  description: string;
  /** Step-by-step guides, one per service. */
  guides: Guide[];
  /** Environment setup guides — the prerequisites for the track's labs. */
  setup: Guide[];
}

export const tracks: Track[] = [
  {
    id: 'aws-foundations',
    title: 'יסודות AWS',
    description:
      'הכירו את שירותי הליבה של AWS ובנו בסיס מעשי לענן — מחישוב ורשת ועד אבטחה וניהול משאבים.',
    guides: [
      {
        id: 'ec2',
        title: 'EC2',
        summary: 'הדרכה מעשית להקמה, חיבור וניהול של מכונות וירטואליות ב-EC2.',
        embedPath: '/guides/ec2/index.html',
        about: [
          'EC2 (‏Elastic Compute Cloud) הוא אחד השירותים המרכזיים ביותר ב-AWS. הוא מאפשר להקים ולהפעיל שרתים וירטואליים בענן ("מכונות" או Instances) תוך דקות, בלי לקנות או להחזיק חומרה פיזית משלכם. כמעט כל שירות שדורש שרת שרץ ברקע — מאתרי אינטרנט ועד מודלים של AI — בסופו של דבר רץ על מכונות מסוג הזה.',
          'בהדרכה האינטראקטיבית הזו תתרגלו את תהליך יצירת מכונת EC2 בדיוק כפי שהוא נראה במסוף האמיתי של AWS: בחירת מערכת הפעלה (AMI), סוג מכונה, מפתח התחברות, הגדרות רשת ואבטחה, ונפח אחסון. לכל שלב מצורף הסבר קופץ שמתאר מה הוא עושה ולמה הוא חשוב, כך שאפשר ללמוד תוך כדי עשייה — בסביבה מדומה שאינה מחוברת לחשבון AWS אמיתי וללא שום עלות.',
        ],
      },
      {
        id: 's3',
        title: 'S3',
        summary: 'הדרכה מעשית ליצירת דלי אחסון ב-S3 והעלאת קובץ ראשון אליו.',
        embedPath: '/guides/s3/index.html',
        about: [
          'S3 (‏Simple Storage Service) הוא שירות אחסון האובייקטים של AWS — המקום שבו שומרים קבצים (תמונות, גיבויים, לוגים, אתרים סטטיים ועוד) בענן, בלי להגביל כמות או לנהל שרתים משלכם. כל קובץ נשמר בתוך "דלי" (Bucket) שאתם יוצרים, עם שם ייחודי גלובלית ואזור משלו.',
          'בהדרכה האינטראקטיבית הזו תתרגלו את תהליך יצירת דלי S3 בדיוק כפי שהוא נראה במסוף האמיתי של AWS: שם הדלי והאזור, בעלות על אובייקטים, חסימת גישה ציבורית, ניהול גרסאות, תגיות והצפנת ברירת מחדל. לאחר יצירת הדלי תעלו אליו קובץ ראשון ותראו את פרטי האובייקט שנוצר. לכל שלב מצורף הסבר קופץ שמתאר מה הוא עושה ולמה הוא חשוב — בסביבה מדומה שאינה מחוברת לחשבון AWS אמיתי וללא שום עלות.',
        ],
      },
      {
        id: 'vpc',
        title: 'VPC',
        summary:
          'הדרכה מעשית ליצירת רשת וירטואלית (VPC) עם תת-רשתות, שערי אינטרנט ו-NAT.',
        embedPath: '/guides/vpc/index.html',
        about: [
          'VPC (‏Virtual Private Cloud) היא הרשת הפרטית והמבודדת שבתוכה רצים כמעט כל המשאבים שלכם ב-AWS — מכונות EC2, מסדי נתונים ועוד. בתוך VPC מחלקים את טווח הכתובות לתת-רשתות (Subnets) הפרוסות על פני אזורי זמינות שונים, וקובעים אילו מהן מחוברות לאינטרנט ("ציבוריות") ואילו מבודדות ממנו ("פרטיות").',
          'בהדרכה האינטראקטיבית הזו תתרגלו את תהליך יצירת VPC בדיוק כפי שהוא נראה במסוף האמיתי של AWS, כולל האפשרות המורחבת "VPC and more": טווח כתובות (CIDR), מספר אזורי זמינות ותת-רשתות, שערי NAT, נקודות קצה (VPC Endpoints) והגדרות DNS — עם מפה חזותית חיה שמתעדכנת בזמן אמת ומראה בדיוק מה ייווצר. לכל שלב מצורף הסבר קופץ שמתאר מה הוא עושה ולמה הוא חשוב — בסביבה מדומה שאינה מחוברת לחשבון AWS אמיתי וללא שום עלות.',
        ],
      },
      {
        id: 'iam',
        title: 'IAM',
        summary:
          'הדרכה מעשית ליצירת משתמש IAM, מתן הרשאות ובדיקה של מה שמותר לו לעשות.',
        embedPath: '/guides/iam/index.html',
        about: [
          'IAM (‏Identity and Access Management) הוא השירות שקובע מי יכול להיכנס לחשבון ה-AWS שלכם ומה מותר לו לעשות בו. כל פעולה ב-AWS — הקמת שרת, קריאת קובץ מ-S3 או מחיקת מסד נתונים — נבדקת מול הרשאות IAM, ולכן זה אחד השירותים החשובים ביותר להבין, במיוחד בכל מה שקשור לאבטחה.',
          'בהדרכה האינטראקטיבית הזו תתרגלו את יצירת משתמש IAM בדיוק כפי שהיא נראית במסוף האמיתי של AWS: שם משתמש וגישה לקונסולה, מתן הרשאות דרך קבוצות או מדיניות (Policies), ובדיקה לפני יצירה. לאחר מכן תשתמשו בסימולטור הרשאות כדי לבדוק אילו פעולות המשתמש רשאי לבצע, ותראו איך הוספה והסרה של הרשאות משנות את התוצאה. לכל שלב מצורף הסבר קופץ שמתאר מה הוא עושה ולמה הוא חשוב — בסביבה מדומה שאינה מחוברת לחשבון AWS אמיתי וללא שום עלות.',
        ],
      },
      {
        id: 'rds',
        title: 'RDS',
        summary: 'הדרכה מעשית להקמת מסד נתונים מנוהל ב-RDS והתחברות אליו.',
        embedPath: '/guides/rds/index.html',
        about: [
          'RDS (‏Relational Database Service) הוא שירות מסדי הנתונים הרלציוניים המנוהלים של AWS. במקום להתקין ולתחזק בעצמכם MySQL או PostgreSQL על שרת, RDS דואג לחומרה, לגיבויים, לעדכוני אבטחה ולזמינות גבוהה — ואתם רק מתחברים ועובדים עם הנתונים.',
          'בהדרכה האינטראקטיבית הזו תתרגלו את יצירת מסד נתונים ב-RDS בדיוק כפי שהיא נראית במסוף האמיתי של AWS: בחירת מנוע ותבנית, זמינות (Multi-AZ), פרטי התחברות, גודל המכונה והאחסון, הגדרות רשת וגישה, גיבויים והצפנה — עם הערכת עלות חודשית שמתעדכנת בזמן אמת. לאחר היצירה תראו את כתובת ההתחברות (Endpoint) ואת הפקודה שמתחברת אל מסד הנתונים. לכל שלב מצורף הסבר קופץ שמתאר מה הוא עושה ולמה הוא חשוב — בסביבה מדומה שאינה מחוברת לחשבון AWS אמיתי וללא שום עלות.',
        ],
      },
      {
        id: 'lambda',
        title: 'Lambda',
        summary: 'הדרכה מעשית ליצירת פונקציית Lambda, כתיבת קוד והרצת בדיקה.',
        embedPath: '/guides/lambda/index.html',
        about: [
          'Lambda הוא שירות המחשוב ללא שרתים (Serverless) של AWS: כותבים פונקציה, ו-AWS מריץ אותה רק כשמשהו מפעיל אותה — בקשת HTTP, קובץ שהועלה ל-S3, הודעה בתור ועוד. אין שרת לנהל, ומשלמים רק על זמן הריצה בפועל.',
          'בהדרכה האינטראקטיבית הזו תיצרו פונקציית Lambda בדיוק כפי שזה נראה במסוף האמיתי של AWS: שם, שפת תכנות (Runtime), ארכיטקטורה ותפקיד הרשאות. לאחר מכן תשנו את הקוד, תפרסו אותו (Deploy) ותריצו אותו עם אירוע בדיקה — והקוד באמת רץ, ישירות בדפדפן שלכם, ומחזיר תשובה ולוגים כמו ב-AWS. לכל שלב מצורף הסבר קופץ שמתאר מה הוא עושה ולמה הוא חשוב — בסביבה מדומה שאינה מחוברת לחשבון AWS אמיתי וללא שום עלות.',
        ],
      },
    ],
    setup: [
      {
        id: 'floci-intro',
        title: 'Floci: ענן על המחשב שלכם',
        summary:
          'הכירו את Floci — שרת מקומי שמחקה את AWS ומאפשר לפתח מהר ובחינם.',
        embedPath: '/guides/floci-intro/index.html',
        about: [
          '"ענן" זה בסך הכול מחשבים של מישהו אחר, רחוקים. Floci מריץ עותק קטן שלהם — אצלכם. עם כמה שורות קוד תוכלו להפעיל שירותים של AWS בלי עלות, בלי לבזבז זמן ובלי לדאוג מחיוב לא צפוי בכרטיס האשראי.',
          'בהדרכה הזו תלמדו להפעיל את Floci בעזרת Docker, להפנות את פקודות ה-AWS CLI שלכם אל השרת המקומי, ולפתח ולבדוק יישומי ענן בלי סיכון.',
        ],
      },
    ],
  },
];

export function getTrackById(trackId: string): Track | undefined {
  return tracks.find((track) => track.id === trackId);
}

export function getGuideById(
  trackId: string,
  guideId: string,
): Guide | undefined {
  const track = getTrackById(trackId);
  return [...(track?.guides ?? []), ...(track?.setup ?? [])].find(
    (guide) => guide.id === guideId,
  );
}
