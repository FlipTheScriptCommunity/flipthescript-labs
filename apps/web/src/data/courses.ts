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
    ],
  },
  {
    id: 'local-development',
    title: 'Local Development',
    description:
      'כלים וטכניקות לפיתוח וטסטינג מקומי של יישומי AWS בלי לנסוע לענן.',
    labs: [
      {
        id: 'floci-intro',
        title: 'Floci: ענן על המחשב שלך',
        summary:
          'הכירו את Floci — שרת מקומי שמחקה AWS ושמאפשר פיתוח מהיר וחינם.',
        embedPath: '/labs/floci-intro/index.html',
        about: [
          '"ענן" זה בסך הכל מחשבים של מישהו אחר, רחוק. Floci מריץ עתק קטן שלהם — אצלך. בגיד קטן של קוד, תוכל להפעיל משירותי AWS שונים בחיסכון בעלויות, חסכון בזמן, וללא דאגה מטעויות כרטיס אשראי.',
          'במדריך הזה תלמדו לעלות את Floci בעזרת Docker, להפנות את פקודות AWS שלכם אל השרת המקומי, ולפתח וטסטנו יישומים חשופים לענן בלי סיכון.',
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
