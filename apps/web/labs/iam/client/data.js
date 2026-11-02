// Static reference data for the IAM lab. Everything here is a teaching mock:
// a fake account, a handful of real AWS managed policies (with simplified
// statements — enough to answer "is this action allowed?" the same way the
// real policy would for the actions the simulator offers), and three
// pre-existing user groups to add the new user to.

export const ACCOUNT_ID = '123456789012';
export const SIGN_IN_URL = `https://${ACCOUNT_ID}.signin.aws.amazon.com/console`;

// Users that already exist in this mock account: they give the "already
// exists" validation something real to catch, and they're the users the
// "Copy permissions" option can copy from.
export const EXISTING_USERS = [
  { name: 'admin', groups: ['Admins'], policies: [] },
  {
    name: 'ci-deployer',
    groups: [],
    policies: ['AmazonS3FullAccess', 'AWSLambda_FullAccess'],
  },
];

export const getExistingUser = (name) =>
  EXISTING_USERS.find((user) => user.name === name);

const JOB_FUNCTION = 'AWS managed - job function';
const AWS_MANAGED = 'AWS managed';

const policyArn = (name) => `arn:aws:iam::aws:policy/${name}`;

// `statements` use the same shape as a real policy document's Statement
// list: Effect plus either Action or NotAction (wildcards allowed).
export const MANAGED_POLICIES = [
  {
    name: 'AdministratorAccess',
    type: JOB_FUNCTION,
    description: 'Provides full access to AWS services and resources.',
    statements: [{ effect: 'Allow', action: ['*'] }],
  },
  {
    name: 'PowerUserAccess',
    type: JOB_FUNCTION,
    description:
      'Provides full access to AWS services and resources, but does not allow management of Users and groups.',
    statements: [
      {
        effect: 'Allow',
        notAction: ['iam:*', 'organizations:*', 'account:*'],
      },
      {
        effect: 'Allow',
        action: [
          'iam:CreateServiceLinkedRole',
          'iam:DeleteServiceLinkedRole',
          'iam:ListRoles',
          'organizations:DescribeOrganization',
          'account:ListRegions',
          'account:GetAccountInformation',
        ],
      },
    ],
  },
  {
    name: 'ReadOnlyAccess',
    type: JOB_FUNCTION,
    description: 'Provides read-only access to AWS services and resources.',
    statements: [
      {
        effect: 'Allow',
        action: [
          's3:Get*',
          's3:List*',
          'ec2:Describe*',
          'ec2:Get*',
          'iam:Get*',
          'iam:List*',
          'rds:Describe*',
          'rds:List*',
          'lambda:Get*',
          'lambda:List*',
          'dynamodb:BatchGet*',
          'dynamodb:Describe*',
          'dynamodb:Get*',
          'dynamodb:List*',
          'dynamodb:Query',
          'dynamodb:Scan',
        ],
      },
    ],
  },
  {
    name: 'AmazonS3FullAccess',
    type: AWS_MANAGED,
    description:
      'Provides full access to all buckets via the AWS Management Console.',
    statements: [{ effect: 'Allow', action: ['s3:*', 's3-object-lambda:*'] }],
  },
  {
    name: 'AmazonS3ReadOnlyAccess',
    type: AWS_MANAGED,
    description:
      'Provides read only access to all buckets via the AWS Management Console.',
    statements: [
      {
        effect: 'Allow',
        action: [
          's3:Get*',
          's3:List*',
          's3:Describe*',
          's3-object-lambda:Get*',
          's3-object-lambda:List*',
        ],
      },
    ],
  },
  {
    name: 'AmazonEC2FullAccess',
    type: AWS_MANAGED,
    description:
      'Provides full access to Amazon EC2 via the AWS Management Console.',
    statements: [
      {
        effect: 'Allow',
        action: [
          'ec2:*',
          'elasticloadbalancing:*',
          'cloudwatch:*',
          'autoscaling:*',
        ],
      },
    ],
  },
  {
    name: 'AmazonEC2ReadOnlyAccess',
    type: AWS_MANAGED,
    description:
      'Provides read only access to Amazon EC2 via the AWS Management Console.',
    statements: [
      {
        effect: 'Allow',
        action: [
          'ec2:Describe*',
          'elasticloadbalancing:Describe*',
          'cloudwatch:ListMetrics',
          'cloudwatch:GetMetricStatistics',
          'cloudwatch:Describe*',
          'autoscaling:Describe*',
        ],
      },
    ],
  },
  {
    name: 'AmazonRDSFullAccess',
    type: AWS_MANAGED,
    description:
      'Provides full access to Amazon RDS via the AWS Management Console.',
    statements: [
      {
        effect: 'Allow',
        action: [
          'rds:*',
          'cloudwatch:DescribeAlarms',
          'cloudwatch:GetMetricStatistics',
          'ec2:DescribeVpcs',
          'ec2:DescribeSubnets',
          'ec2:DescribeSecurityGroups',
        ],
      },
    ],
  },
  {
    name: 'AmazonRDSReadOnlyAccess',
    type: AWS_MANAGED,
    description:
      'Allows read-only access to Amazon RDS via the AWS Management Console.',
    statements: [
      {
        effect: 'Allow',
        action: [
          'rds:Describe*',
          'rds:ListTagsForResource',
          'ec2:DescribeAccountAttributes',
          'ec2:DescribeAvailabilityZones',
          'ec2:DescribeVpcs',
        ],
      },
    ],
  },
  {
    name: 'AWSLambda_FullAccess',
    type: AWS_MANAGED,
    description:
      'Grants full access to AWS Lambda service, AWS Lambda console features, and other related AWS services.',
    statements: [
      {
        effect: 'Allow',
        action: [
          'lambda:*',
          'cloudformation:DescribeStacks',
          'logs:DescribeLogGroups',
          'logs:GetLogEvents',
          'iam:ListRoles',
          'iam:GetRole',
        ],
      },
    ],
  },
  {
    name: 'AWSLambda_ReadOnlyAccess',
    type: AWS_MANAGED,
    description:
      'Grants read-only access to AWS Lambda service, AWS Lambda console features, and other related AWS services.',
    statements: [
      {
        effect: 'Allow',
        action: [
          'lambda:Get*',
          'lambda:List*',
          'logs:DescribeLogGroups',
          'logs:GetLogEvents',
        ],
      },
    ],
  },
  {
    name: 'AmazonDynamoDBFullAccess',
    type: AWS_MANAGED,
    description:
      'Provides full access to Amazon DynamoDB via the AWS Management Console.',
    statements: [{ effect: 'Allow', action: ['dynamodb:*'] }],
  },
  {
    name: 'AmazonDynamoDBReadOnlyAccess',
    type: AWS_MANAGED,
    description:
      'Provides read only access to Amazon DynamoDB via the AWS Management Console.',
    statements: [
      {
        effect: 'Allow',
        action: [
          'dynamodb:BatchGetItem',
          'dynamodb:Describe*',
          'dynamodb:List*',
          'dynamodb:GetItem',
          'dynamodb:Query',
          'dynamodb:Scan',
          'dynamodb:PartiQLSelect',
        ],
      },
    ],
  },
  {
    name: 'IAMFullAccess',
    type: AWS_MANAGED,
    description: 'Provides full access to IAM via the AWS Management Console.',
    statements: [
      {
        effect: 'Allow',
        action: [
          'iam:*',
          'organizations:DescribeAccount',
          'organizations:DescribeOrganization',
        ],
      },
    ],
  },
  {
    name: 'IAMReadOnlyAccess',
    type: AWS_MANAGED,
    description:
      'Provides read only access to IAM via the AWS Management Console.',
    statements: [
      {
        effect: 'Allow',
        action: [
          'iam:GenerateCredentialReport',
          'iam:GenerateServiceLastAccessedDetails',
          'iam:Get*',
          'iam:List*',
          'iam:SimulateCustomPolicy',
          'iam:SimulatePrincipalPolicy',
        ],
      },
    ],
  },
  {
    name: 'IAMUserChangePassword',
    type: AWS_MANAGED,
    description:
      'Provides the ability for an IAM user to change their own password.',
    statements: [
      {
        effect: 'Allow',
        action: ['iam:ChangePassword', 'iam:GetAccountPasswordPolicy'],
      },
    ],
  },
].map((policy) => ({ ...policy, arn: policyArn(policy.name) }));

export const CHANGE_PASSWORD_POLICY = 'IAMUserChangePassword';

export const getPolicy = (name) =>
  MANAGED_POLICIES.find((policy) => policy.name === name);

export const USER_GROUPS = [
  {
    name: 'Admins',
    policies: ['AdministratorAccess'],
    created: '2026-03-02',
  },
  {
    name: 'Developers',
    policies: ['PowerUserAccess'],
    created: '2026-03-02',
  },
  {
    name: 'ReadOnly',
    policies: ['ReadOnlyAccess'],
    created: '2026-04-14',
  },
];

export const getGroup = (name) =>
  USER_GROUPS.find((group) => group.name === name);

// Actions offered in the policy simulator, grouped by service like the real
// IAM Policy Simulator's service picker.
export const SIMULATOR_SERVICES = [
  {
    service: 'Amazon S3',
    actions: [
      's3:ListAllMyBuckets',
      's3:GetObject',
      's3:PutObject',
      's3:DeleteBucket',
    ],
  },
  {
    service: 'Amazon EC2',
    actions: [
      'ec2:DescribeInstances',
      'ec2:RunInstances',
      'ec2:TerminateInstances',
    ],
  },
  {
    service: 'AWS Identity and Access Management (IAM)',
    actions: ['iam:ListUsers', 'iam:CreateUser', 'iam:ChangePassword'],
  },
  {
    service: 'Amazon RDS',
    actions: ['rds:DescribeDBInstances', 'rds:CreateDBInstance'],
  },
  {
    service: 'AWS Lambda',
    actions: [
      'lambda:ListFunctions',
      'lambda:InvokeFunction',
      'lambda:CreateFunction',
    ],
  },
  {
    service: 'Amazon DynamoDB',
    actions: ['dynamodb:GetItem', 'dynamodb:PutItem'],
  },
];

export const DEFAULT_SIMULATOR_ACTIONS = [
  's3:ListAllMyBuckets',
  's3:PutObject',
  'ec2:RunInstances',
  'iam:CreateUser',
];
