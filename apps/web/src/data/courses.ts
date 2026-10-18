export interface Lab {
  id: string;
  title: string;
  summary: string;
  /**
   * Path (under /public) to a self-contained static lab experience, e.g. a
   * pre-built interactive simulator. When set, the lab page embeds it in an
   * iframe instead of rendering the "coming soon" placeholder. Kept isolated
   * from the site's own RTL/dark theme on purpose — see
   * apps/web/labs/<labId>/README.md for the source of the embedded bundle.
   */
  embedPath?: string;
  /**
   * Short, plain-language paragraphs (Hebrew) explaining what the lab is
   * about and what students will practice. Rendered on the lab page above
   * the embedded content.
   */
  about?: string[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  labs: Lab[];
}

export const courses: Course[] = [
  {
    id: 'aws-foundations',
    title: 'AWS Foundations',
    description:
      'הכירו את שירותי הליבה של AWS ובנו בסיס מעשי לענן — מחישוב ורשת ועד אבטחה וניהול משאבים.',
    labs: [
      {
        id: 'ec2',
        title: 'EC2',
        summary: 'מעבדה מעשית להקמה, חיבור וניהול של מכונות וירטואליות ב-EC2.',
        embedPath: '/labs/ec2/index.html',
        about: [
          'EC2 (‏Elastic Compute Cloud) הוא אחד השירותים המרכזיים ביותר ב-AWS. הוא מאפשר להקים ולהפעיל שרתים וירטואליים בענן ("מכונות" או Instances) תוך דקות, בלי לקנות או להחזיק חומרה פיזית משלכם. כמעט כל שירות שדורש שרת שרץ ברקע — מאתרי אינטרנט ועד מודלים של AI — בסופו של דבר רץ על מכונות מסוג הזה.',
          'במעבדה האינטראקטיבית הזו תתרגלו את תהליך יצירת מכונת EC2 בדיוק כפי שהוא נראה במסוף האמיתי של AWS: בחירת מערכת הפעלה (AMI), סוג מכונה, מפתח התחברות, הגדרות רשת ואבטחה, ונפח אחסון. לכל שלב מצורף הסבר קופץ שמתאר מה הוא עושה ולמה הוא חשוב, כך שאפשר ללמוד תוך כדי עשייה — בסביבה מדומה שאינה מחוברת לחשבון AWS אמיתי וללא שום עלות.',
        ],
      },
      {
        id: 's3',
        title: 'S3',
        summary: 'מעבדה מעשית ליצירת דלי אחסון ב-S3 והעלאת קובץ ראשון אליו.',
        embedPath: '/labs/s3/index.html',
        about: [
          'S3 (‏Simple Storage Service) הוא שירות אחסון האובייקטים של AWS — המקום שבו שומרים קבצים (תמונות, גיבויים, לוגים, אתרים סטטיים ועוד) בענן, בלי להגביל כמות או לנהל שרתים משלכם. כל קובץ נשמר בתוך "דלי" (Bucket) שאתם יוצרים, עם שם ייחודי גלובלית ואזור משלו.',
          'במעבדה האינטראקטיבית הזו תתרגלו את תהליך יצירת דלי S3 בדיוק כפי שהוא נראה במסוף האמיתי של AWS: שם הדלי והאזור, בעלות על אובייקטים, חסימת גישה ציבורית, ניהול גרסאות, תגיות והצפנת ברירת מחדל. לאחר יצירת הדלי תעלו אליו קובץ ראשון ותראו את פרטי האובייקט שנוצר. לכל שלב מצורף הסבר קופץ שמתאר מה הוא עושה ולמה הוא חשוב — בסביבה מדומה שאינה מחוברת לחשבון AWS אמיתי וללא שום עלות.',
        ],
      },
      {
        id: 'vpc',
        title: 'VPC',
        summary:
          'מעבדה מעשית ליצירת רשת וירטואלית (VPC) עם תת-רשתות, שערי אינטרנט ו-NAT.',
        embedPath: '/labs/vpc/index.html',
        about: [
          'VPC (‏Virtual Private Cloud) היא הרשת הפרטית והמבודדת שבתוכה רצים כמעט כל המשאבים שלכם ב-AWS — מכונות EC2, מסדי נתונים ועוד. בתוך VPC מחלקים את טווח הכתובות לתת-רשתות (Subnets) הפרוסות על פני אזורי זמינות שונים, וקובעים אילו מהן מחוברות לאינטרנט ("ציבוריות") ואילו מבודדות ממנו ("פרטיות").',
          'במעבדה האינטראקטיבית הזו תתרגלו את תהליך יצירת VPC בדיוק כפי שהוא נראה במסוף האמיתי של AWS, כולל האפשרות המורחבת "VPC and more": טווח כתובות (CIDR), מספר אזורי זמינות ותת-רשתות, שערי NAT, נקודות קצה (VPC Endpoints) והגדרות DNS — עם מפה חזותית חיה שמתעדכנת בזמן אמת ומראה בדיוק מה ייווצר. לכל שלב מצורף הסבר קופץ שמתאר מה הוא עושה ולמה הוא חשוב — בסביבה מדומה שאינה מחוברת לחשבון AWS אמיתי וללא שום עלות.',
        ],
      },
    ],
  },
];

export function getCourseById(courseId: string): Course | undefined {
  return courses.find((course) => course.id === courseId);
}

export function getLabById(courseId: string, labId: string): Lab | undefined {
  return getCourseById(courseId)?.labs.find((lab) => lab.id === labId);
}
