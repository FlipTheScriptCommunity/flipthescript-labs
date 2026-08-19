export interface Lab {
  id: string;
  title: string;
  summary: string;
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
