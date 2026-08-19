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
      },
    ],
  },
];

export function getCourseById(courseId: string): Course | undefined {
  return courses.find((course) => course.id === courseId);
}

export function getLabById(
  courseId: string,
  labId: string,
): Lab | undefined {
  return getCourseById(courseId)?.labs.find((lab) => lab.id === labId);
}
