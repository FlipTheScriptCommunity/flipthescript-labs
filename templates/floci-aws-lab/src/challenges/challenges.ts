import {
  GetObjectCommand,
  HeadBucketCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { GetFunctionCommand, InvokeCommand } from '@aws-sdk/client-lambda';
import { en } from '../lib/bidi';
import { href } from '../lib/router';
import type { Challenge, CheckContext, CheckResult } from './types';

export const LAB_BUCKET = 'fts-lab-data';
export const LAB_OBJECT_KEY = 'hello.txt';
export const LAB_FUNCTION = 'read-s3-object';

const pass = (he: string, enText: string): CheckResult => ({
  ok: true,
  message: { he, en: enText },
});
const fail = (he: string, enText: string): CheckResult => ({
  ok: false,
  message: { he, en: enText },
});

const errorName = (err: unknown) => (err as { name?: string })?.name ?? '';
const isNotFound = (err: unknown) =>
  [
    'NotFound',
    'NoSuchBucket',
    'NoSuchKey',
    'ResourceNotFoundException',
  ].includes(errorName(err));

async function checkBucketExists({ s3 }: CheckContext): Promise<CheckResult> {
  try {
    await s3.send(new HeadBucketCommand({ Bucket: LAB_BUCKET }));
    return pass(`הדלי ${en(LAB_BUCKET)} קיים.`, `Bucket ${LAB_BUCKET} exists.`);
  } catch (err) {
    if (isNotFound(err)) {
      return fail(
        `לא נמצא דלי בשם ${en(LAB_BUCKET)}. בדקו שהשם הוקלד בדיוק כך.`,
        `No bucket named ${LAB_BUCKET} yet — check the name is spelled exactly like that.`,
      );
    }
    throw err;
  }
}

async function checkObjectUploaded({ s3 }: CheckContext): Promise<CheckResult> {
  try {
    const head = await s3.send(
      new HeadObjectCommand({ Bucket: LAB_BUCKET, Key: LAB_OBJECT_KEY }),
    );
    if (!head.ContentLength) {
      return fail(
        `הקובץ ${en(LAB_OBJECT_KEY)} קיים אבל ריק — כתבו בו טקסט כלשהו.`,
        `${LAB_OBJECT_KEY} exists but is empty — put some text in it.`,
      );
    }
    return pass(
      `הקובץ ${en(LAB_OBJECT_KEY)} נמצא בדלי (${head.ContentLength} בתים).`,
      `${LAB_OBJECT_KEY} is in the bucket (${head.ContentLength} bytes).`,
    );
  } catch (err) {
    if (isNotFound(err)) {
      return fail(
        `לא נמצא אובייקט עם המפתח ${en(LAB_OBJECT_KEY)} בדלי ${en(LAB_BUCKET)}.`,
        `No object with key ${LAB_OBJECT_KEY} in ${LAB_BUCKET}.`,
      );
    }
    throw err;
  }
}

async function checkFunctionExists({
  lambda,
}: CheckContext): Promise<CheckResult> {
  try {
    const { Configuration } = await lambda.send(
      new GetFunctionCommand({ FunctionName: LAB_FUNCTION }),
    );
    if (!Configuration?.Runtime?.startsWith('nodejs')) {
      return fail(
        `הפונקציה קיימת, אבל ה-${en('Runtime')} שלה הוא ${en(Configuration?.Runtime ?? '?')} — המעבדה הזו כתובה ב-${en('Node.js')}.`,
        `The function exists, but its runtime is ${Configuration?.Runtime ?? '?'} — this lab is written for Node.js.`,
      );
    }
    return pass(
      `הפונקציה ${en(LAB_FUNCTION)} קיימת (${en(Configuration.Runtime)}).`,
      `Function ${LAB_FUNCTION} exists (${Configuration.Runtime}).`,
    );
  } catch (err) {
    if (isNotFound(err)) {
      return fail(
        `לא נמצאה פונקציה בשם ${en(LAB_FUNCTION)}.`,
        `No function named ${LAB_FUNCTION} yet.`,
      );
    }
    throw err;
  }
}

async function checkFunctionReadsObject(
  ctx: CheckContext,
): Promise<CheckResult> {
  let expected: string;
  try {
    const obj = await ctx.s3.send(
      new GetObjectCommand({ Bucket: LAB_BUCKET, Key: LAB_OBJECT_KEY }),
    );
    expected = ((await obj.Body?.transformToString()) ?? '').trim();
  } catch (err) {
    if (isNotFound(err)) {
      return fail(
        `קודם צריך את ${en(LAB_OBJECT_KEY)} בדלי ${en(LAB_BUCKET)} — השלימו את האתגר הקודם.`,
        `${LAB_OBJECT_KEY} needs to be in ${LAB_BUCKET} first — finish the previous challenge.`,
      );
    }
    throw err;
  }
  if (!expected) {
    return fail(
      `${en(LAB_OBJECT_KEY)} ריק, אז אין מה לקרוא ממנו.`,
      `${LAB_OBJECT_KEY} is empty, so there's nothing to read.`,
    );
  }

  let res;
  try {
    res = await ctx.lambda.send(
      new InvokeCommand({
        FunctionName: LAB_FUNCTION,
        Payload: new TextEncoder().encode('{}'),
      }),
    );
  } catch (err) {
    if (isNotFound(err))
      return fail(
        `לא נמצאה פונקציה בשם ${en(LAB_FUNCTION)}.`,
        `No function named ${LAB_FUNCTION} yet.`,
      );
    throw err;
  }
  const payload = res.Payload ? new TextDecoder().decode(res.Payload) : '';

  if (res.FunctionError) {
    const detail = payload.slice(0, 200);
    return fail(
      `הפונקציה נכשלה בזמן הריצה: ${en(detail)}`,
      `The function failed while running: ${detail}`,
    );
  }
  // Accept the content however the student chose to return it: a bare string,
  // or inside any object field (payload is JSON, so compare the escaped form).
  const escaped = JSON.stringify(expected).slice(1, -1);
  if (payload.includes(expected) || payload.includes(escaped)) {
    return pass(
      `הפונקציה החזירה את התוכן של ${en(LAB_OBJECT_KEY)}. כל הכבוד!`,
      `The function returned the contents of ${LAB_OBJECT_KEY}. Nice work!`,
    );
  }
  return fail(
    `הפונקציה רצה, אבל התשובה שלה לא כוללת את התוכן של ${en(LAB_OBJECT_KEY)}. היא החזירה: ${en(payload.slice(0, 120) || '(empty)')}. זכרו ללחוץ ${en('Deploy')} אחרי שינוי הקוד.`,
    `The function ran, but its response doesn't include the contents of ${LAB_OBJECT_KEY}. It returned: ${payload.slice(0, 120) || '(empty)'}. Remember to Deploy after changing the code.`,
  );
}

export const CHALLENGES: Challenge[] = [
  {
    id: 's3-first-bucket',
    title: { he: `הדלי הראשון שלכם ב-${en('S3')}`, en: 'Your first S3 bucket' },
    summary: {
      he: `צרו דלי (${en('Bucket')}) ב-${en('S3')} והעלו אליו קובץ טקסט — הבסיס של אחסון בענן.`,
      en: 'Create an S3 bucket and upload a text file to it — the foundation of storage in the cloud.',
    },
    objectives: {
      he: [
        `מה זה דלי (${en('Bucket')}) ומה זה אובייקט (${en('Object')}) ב-${en('S3')}`,
        'חוקי מתן השמות לדליים, ולמה השם חייב להיות ייחודי',
        `איך קובץ נשמר בדלי תחת מפתח (${en('Key')})`,
      ],
      en: [
        'What an S3 bucket and an object are',
        'Bucket naming rules, and why names must be globally unique',
        'How a file is stored in a bucket under a key',
      ],
    },
    startHref: href.buckets(),
    tasks: [
      {
        id: 'create-bucket',
        title: {
          he: `צרו דלי בשם ${en(LAB_BUCKET)}`,
          en: `Create a bucket named ${LAB_BUCKET}`,
        },
        hint: {
          he: `בעמוד ${en('Amazon S3')} לחצו ${en('Create bucket')}, הקלידו ${en(LAB_BUCKET)} בשדה ${en('Bucket name')} ואשרו.`,
          en: `On the Amazon S3 page choose Create bucket, enter ${LAB_BUCKET} as the bucket name, and confirm.`,
        },
        check: checkBucketExists,
      },
      {
        id: 'upload-object',
        title: {
          he: `העלו לדלי קובץ בשם ${en(LAB_OBJECT_KEY)}`,
          en: `Upload an object named ${LAB_OBJECT_KEY}`,
        },
        hint: {
          he: `פתחו את הדלי ולחצו ${en('Create text file')} (או ${en('Upload')} עם קובץ מהמחשב). השם צריך להיות ${en(LAB_OBJECT_KEY)} והתוכן לא ריק.`,
          en: `Open the bucket and choose Create text file (or Upload a file from your computer). Name it ${LAB_OBJECT_KEY} and give it some content.`,
        },
        check: checkObjectUploaded,
      },
    ],
  },
  {
    id: 'lambda-reads-s3',
    title: {
      he: `פונקציית ${en('Lambda')} שקוראת מ-${en('S3')}`,
      en: 'Deploy a Lambda that reads S3',
    },
    summary: {
      he: `כתבו ופרסו פונקציית ${en('Lambda')} שקוראת את ${en(LAB_OBJECT_KEY)} מהדלי ומחזירה את התוכן שלו.`,
      en: `Write and deploy a Lambda function that reads ${LAB_OBJECT_KEY} from your bucket and returns its contents.`,
    },
    objectives: {
      he: [
        `מה זה ${en('handler')}, מה זה ${en('event')} ומה הפונקציה מחזירה`,
        `איך קוד בתוך ${en('Lambda')} משתמש ב-${en('AWS SDK')} כדי לדבר עם שירות אחר`,
        `למה לכל פונקציה יש ${en('Execution role')} (הרשאות ${en('IAM')})`,
        `מחזור העבודה: עריכה ← ${en('Deploy')} ← ${en('Test')}`,
      ],
      en: [
        'What a handler is, what the event is, and what the function returns',
        'How code inside Lambda uses the AWS SDK to call another service',
        'Why every function has an execution role (IAM permissions)',
        'The edit → Deploy → Test loop',
      ],
    },
    startHref: href.functions(),
    tasks: [
      {
        id: 'create-function',
        title: {
          he: `צרו פונקציה בשם ${en(LAB_FUNCTION)}`,
          en: `Create a function named ${LAB_FUNCTION}`,
        },
        hint: {
          he: `בעמוד ${en('AWS Lambda')} לחצו ${en('Create function')}, קראו לה ${en(LAB_FUNCTION)} והשאירו ${en('Runtime')} של ${en('Node.js')}.`,
          en: `On the AWS Lambda page choose Create function, name it ${LAB_FUNCTION}, and keep a Node.js runtime.`,
        },
        check: checkFunctionExists,
      },
      {
        id: 'read-object',
        title: {
          he: `גרמו לפונקציה להחזיר את התוכן של ${en(LAB_OBJECT_KEY)}`,
          en: `Make the function return the contents of ${LAB_OBJECT_KEY}`,
        },
        hint: {
          he: `ב-${en('AWS SDK')} יש ${en('GetObjectCommand')} שקורא אובייקט מ-${en('S3')}. אפשר להתחיל מהקוד הזה, ללחוץ ${en('Deploy')} ואז ${en('Test')}:`,
          en: 'The AWS SDK has a GetObjectCommand that reads an object from S3. You can start from this code, then choose Deploy and Test:',
        },
        snippet: `import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';

const s3 = new S3Client({});

export const handler = async (event) => {
  const res = await s3.send(
    new GetObjectCommand({ Bucket: '${LAB_BUCKET}', Key: '${LAB_OBJECT_KEY}' })
  );
  return { content: await res.Body.transformToString() };
};`,
        check: checkFunctionReadsObject,
      },
    ],
  },
];
