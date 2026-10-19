// Static reference data for the RDS lab. Everything here is a teaching mock:
// engine versions, instance classes and prices are realistic examples, not a
// live catalog, and the cost estimate is deliberately rough.

export const REGION = 'us-east-1';
export const ACCOUNT_ID = '123456789012';
export const AZS = ['us-east-1a', 'us-east-1b', 'us-east-1c'];

// Only the open-source engines are wired up in this lab; the others are
// shown (disabled) so the screen still looks like the real console.
export const ENGINES = [
  {
    id: 'aurora-mysql',
    label: 'Aurora (MySQL Compatible)',
    disabled: true,
  },
  {
    id: 'aurora-postgresql',
    label: 'Aurora (PostgreSQL Compatible)',
    disabled: true,
  },
  {
    id: 'mysql',
    label: 'MySQL',
    edition: 'MySQL Community',
    versions: ['8.4.5', '8.0.42', '8.0.41'],
    port: 3306,
    defaultUser: 'admin',
    passwordMax: 41,
    client: 'mysql',
  },
  {
    id: 'mariadb',
    label: 'MariaDB',
    edition: 'MariaDB',
    versions: ['11.4.5', '10.11.11', '10.6.21'],
    port: 3306,
    defaultUser: 'admin',
    passwordMax: 41,
    client: 'mariadb',
  },
  {
    id: 'postgres',
    label: 'PostgreSQL',
    edition: 'PostgreSQL',
    versions: ['17.4-R1', '16.8-R1', '15.12-R1'],
    port: 5432,
    defaultUser: 'postgres',
    passwordMax: 128,
    client: 'psql',
  },
  { id: 'oracle', label: 'Oracle', disabled: true },
  { id: 'sqlserver', label: 'Microsoft SQL Server', disabled: true },
  { id: 'db2', label: 'IBM Db2', disabled: true },
];

export const getEngine = (id) => ENGINES.find((engine) => engine.id === id);

export const engineVersionLabel = (engine, version) =>
  `${engine.label} ${version}`;

export const TEMPLATES = [
  {
    value: 'production',
    label: 'Production',
    description:
      'Use defaults for high availability and fast, consistent performance.',
  },
  {
    value: 'dev-test',
    label: 'Dev/Test',
    description:
      'This instance is intended for development use outside of a production environment.',
  },
  {
    value: 'free-tier',
    label: 'Free tier',
    description:
      'Use RDS Free Tier to develop new applications, test existing applications, or gain hands-on experience with Amazon RDS.',
  },
];

// What picking a template pre-fills, like the real console does.
export const TEMPLATE_DEFAULTS = {
  production: {
    deployment: 'multi-az',
    classFamily: 'standard',
    instanceClass: 'db.m7g.large',
    storageType: 'gp3',
    allocatedStorage: '100',
    backupRetention: '7',
    deletionProtection: true,
  },
  'dev-test': {
    deployment: 'single-az',
    classFamily: 'burstable',
    instanceClass: 'db.t4g.medium',
    storageType: 'gp3',
    allocatedStorage: '20',
    backupRetention: '7',
    deletionProtection: false,
  },
  'free-tier': {
    deployment: 'single-az',
    classFamily: 'burstable',
    instanceClass: 'db.t4g.micro',
    storageType: 'gp3',
    allocatedStorage: '20',
    backupRetention: '1',
    deletionProtection: false,
  },
};

export const CLASS_FAMILIES = [
  {
    value: 'standard',
    label: 'Standard classes (includes m classes)',
  },
  {
    value: 'memory',
    label: 'Memory optimized classes (includes r and x classes)',
  },
  {
    value: 'burstable',
    label: 'Burstable classes (includes t classes)',
  },
];

// hourly = example On-Demand price per hour, Single-AZ, us-east-1.
export const INSTANCE_CLASSES = [
  { id: 'db.m7g.large', family: 'standard', vcpu: 2, memory: 8, hourly: 0.168 },
  {
    id: 'db.m7g.xlarge',
    family: 'standard',
    vcpu: 4,
    memory: 16,
    hourly: 0.336,
  },
  { id: 'db.m6i.large', family: 'standard', vcpu: 2, memory: 8, hourly: 0.171 },
  { id: 'db.r7g.large', family: 'memory', vcpu: 2, memory: 16, hourly: 0.239 },
  { id: 'db.r7g.xlarge', family: 'memory', vcpu: 4, memory: 32, hourly: 0.478 },
  {
    id: 'db.t4g.micro',
    family: 'burstable',
    vcpu: 2,
    memory: 1,
    hourly: 0.016,
    freeTier: true,
  },
  {
    id: 'db.t3.micro',
    family: 'burstable',
    vcpu: 2,
    memory: 1,
    hourly: 0.017,
    freeTier: true,
  },
  {
    id: 'db.t4g.small',
    family: 'burstable',
    vcpu: 2,
    memory: 2,
    hourly: 0.032,
  },
  {
    id: 'db.t4g.medium',
    family: 'burstable',
    vcpu: 2,
    memory: 4,
    hourly: 0.065,
  },
];

export const getInstanceClass = (id) =>
  INSTANCE_CLASSES.find((c) => c.id === id);

export const instanceClassLabel = (c) =>
  `${c.id} — ${c.vcpu} vCPUs, ${c.memory} GiB RAM`;

// perGb = example price per GB-month. Provisioned IOPS types also charge
// per provisioned IOPS-month.
export const STORAGE_TYPES = [
  {
    value: 'gp3',
    label: 'General Purpose SSD (gp3)',
    description:
      'Performance scales independently from storage. Baseline of 3,000 IOPS.',
    perGb: 0.115,
    min: 20,
  },
  {
    value: 'gp2',
    label: 'General Purpose SSD (gp2)',
    description: 'Baseline performance determined by volume size.',
    perGb: 0.115,
    min: 20,
  },
  {
    value: 'io1',
    label: 'Provisioned IOPS SSD (io1)',
    description: 'Flexibility in provisioning I/O.',
    perGb: 0.125,
    perIops: 0.1,
    min: 100,
  },
  {
    value: 'io2',
    label: 'Provisioned IOPS SSD (io2)',
    description: 'Flexibility in provisioning I/O with higher durability.',
    perGb: 0.125,
    perIops: 0.1,
    min: 100,
  },
];

export const getStorageType = (value) =>
  STORAGE_TYPES.find((t) => t.value === value);

export const MAX_STORAGE = 65536;

export const DEFAULT_VPC = {
  id: 'vpc-0a1b2c3d4e5f60001',
  label: 'Default VPC (vpc-0a1b2c3d4e5f60001)',
};
export const DEFAULT_SUBNET_GROUP = 'default-vpc-0a1b2c3d4e5f60001';
export const DEFAULT_SECURITY_GROUP = {
  id: 'sg-0f1e2d3c4b5a69788',
  name: 'default',
};
