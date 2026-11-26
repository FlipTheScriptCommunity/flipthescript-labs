import {
  ACCOUNT_ID,
  AZS,
  DEFAULT_SECURITY_GROUP,
  DEFAULT_SUBNET_GROUP,
  DEFAULT_VPC,
  MAX_STORAGE,
  REGION,
  getEngine,
  getInstanceClass,
  getStorageType,
} from './data';

const HOURS_PER_MONTH = 730;

// Validation rules match the real RDS console.

export function validateIdentifier(id) {
  if (!id) return 'DB instance identifier is required.';
  if (id.length > 63) return 'Must be 1 to 63 characters.';
  if (!/^[a-zA-Z]/.test(id)) return 'First character must be a letter.';
  if (!/^[a-zA-Z0-9-]+$/.test(id)) {
    return 'Can only contain ASCII letters, digits, and hyphens.';
  }
  if (id.endsWith('-') || id.includes('--')) {
    return "Can't end with a hyphen or contain two consecutive hyphens.";
  }
  return null;
}

export function validateMasterUsername(name, engineId) {
  if (!name) return 'Master username is required.';
  if (name.length > 16) return 'Must be 1 to 16 characters.';
  if (!/^[a-zA-Z]/.test(name)) return 'First character must be a letter.';
  if (!/^[a-zA-Z0-9_]+$/.test(name)) {
    return 'Can only contain alphanumeric characters and underscores.';
  }
  if (['rdsadmin', 'rdsrepladmin'].includes(name.toLowerCase())) {
    return `${name} is a reserved word for this engine.`;
  }
  if (engineId === 'postgres' && name.toLowerCase().startsWith('pg_')) {
    return "PostgreSQL usernames can't start with pg_.";
  }
  return null;
}

export function validateMasterPassword(password, engineId) {
  const max = getEngine(engineId)?.passwordMax || 41;
  if (!password) return 'Master password is required.';
  if (password.length < 8 || password.length > max) {
    return `Must be 8 to ${max} characters.`;
  }
  if (/[/'"@\s]/.test(password) || /[^\x20-\x7e]/.test(password)) {
    return 'Can include any printable ASCII character except /, \', ", @, or a space.';
  }
  return null;
}

export function validateStorage(form) {
  const type = getStorageType(form.storageType);
  const size = Number(form.allocatedStorage);
  if (!Number.isInteger(size)) return 'Enter a whole number of GiB.';
  if (size < type.min || size > MAX_STORAGE) {
    return `Allocated storage for ${type.label} must be between ${type.min} and ${MAX_STORAGE.toLocaleString('en-US')} GiB.`;
  }
  return null;
}

export function validateMaxStorage(form) {
  if (!form.storageAutoscaling) return null;
  const size = Number(form.allocatedStorage);
  const max = Number(form.maxStorage);
  if (!Number.isInteger(max)) return 'Enter a whole number of GiB.';
  if (max <= size) {
    return 'The maximum storage threshold must be greater than the allocated storage.';
  }
  if (max > MAX_STORAGE) {
    return `Must be ${MAX_STORAGE.toLocaleString('en-US')} GiB or less.`;
  }
  return null;
}

export function validateDatabaseName(name, engineId) {
  if (!name) return null; // optional
  const max = engineId === 'postgres' ? 63 : 64;
  if (name.length > max) return `Must be 1 to ${max} characters.`;
  if (!/^[a-zA-Z]/.test(name)) return 'Must begin with a letter.';
  if (!/^[a-zA-Z0-9_]+$/.test(name)) {
    return 'Can only contain alphanumeric characters and underscores.';
  }
  return null;
}

export function validateBackupRetention(value) {
  const days = Number(value);
  if (!Number.isInteger(days) || days < 1 || days > 35) {
    return 'Backup retention period must be between 1 and 35 days.';
  }
  return null;
}

// Every field-level error at once, keyed by field — used to show errors next
// to the fields and to block "Create database".
export function validateForm(form) {
  const errors = {
    identifier: validateIdentifier(form.identifier),
    masterUsername: validateMasterUsername(form.masterUsername, form.engine),
    allocatedStorage: validateStorage(form),
    maxStorage: validateMaxStorage(form),
    databaseName: validateDatabaseName(form.databaseName, form.engine),
    backupRetention: form.backups
      ? validateBackupRetention(form.backupRetention)
      : null,
    securityGroupName:
      form.securityGroupMode === 'create' && !form.securityGroupName.trim()
        ? 'Enter a name for the new security group.'
        : null,
    masterPassword: null,
    confirmPassword: null,
  };
  if (form.credentialsMode === 'self' && !form.autoGeneratePassword) {
    errors.masterPassword = validateMasterPassword(
      form.masterPassword,
      form.engine,
    );
    if (
      !errors.masterPassword &&
      form.masterPassword !== form.confirmPassword
    ) {
      errors.confirmPassword = "Passwords don't match.";
    }
  }
  return Object.fromEntries(
    Object.entries(errors).filter(([, message]) => message),
  );
}

export function isFreeTierEligible(form) {
  return (
    form.template === 'free-tier' &&
    form.deployment === 'single-az' &&
    Boolean(getInstanceClass(form.instanceClass)?.freeTier) &&
    ['gp2', 'gp3'].includes(form.storageType) &&
    Number(form.allocatedStorage) <= 20
  );
}

// A rough monthly estimate in USD: instance hours + storage (+ provisioned
// IOPS), doubled for a Multi-AZ standby. Real bills also include backup
// storage beyond the free allowance, data transfer, and more.
export function estimateMonthlyCost(form) {
  const instance = getInstanceClass(form.instanceClass);
  const storageType = getStorageType(form.storageType);
  const copies = form.deployment === 'multi-az' ? 2 : 1;
  const size = Math.max(Number(form.allocatedStorage) || 0, 0);
  const iops = storageType.perIops ? Number(form.iops) || 0 : 0;

  const instanceCost = instance.hourly * HOURS_PER_MONTH * copies;
  const storageCost =
    (size * storageType.perGb + iops * (storageType.perIops || 0)) * copies;
  return {
    instance: instanceCost,
    storage: storageCost,
    total: instanceCost + storageCost,
  };
}

const randomString = (alphabet, length) =>
  Array.from(
    { length },
    () => alphabet[Math.floor(Math.random() * alphabet.length)],
  ).join('');

const LOWER_ALNUM = 'abcdefghijklmnopqrstuvwxyz0123456789';

function generatePassword() {
  // No /, ', ", @ or spaces — the characters RDS doesn't allow.
  return randomString(
    'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!#$%^&*()_+-=',
    20,
  );
}

export function mockCreateDatabase(form) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const errors = validateForm(form);
      const first = Object.values(errors)[0];
      if (first) {
        reject(new Error(first));
        return;
      }

      const engine = getEngine(form.engine);
      const instance = getInstanceClass(form.instanceClass);
      const identifier = form.identifier.toLowerCase();
      const primaryAz =
        form.deployment === 'single-az' && form.availabilityZone !== 'none'
          ? form.availabilityZone
          : AZS[Math.floor(Math.random() * AZS.length)];
      const secondaryAz = AZS.find((az) => az !== primaryAz);

      let password = null;
      let secretArn = null;
      if (form.credentialsMode === 'secrets-manager') {
        secretArn = `arn:aws:secretsmanager:${REGION}:${ACCOUNT_ID}:secret:rds!db-${randomString(
          LOWER_ALNUM,
          8,
        )}-${randomString(LOWER_ALNUM, 4)}-${randomString(LOWER_ALNUM, 6)}`;
      } else {
        password = form.autoGeneratePassword
          ? generatePassword()
          : form.masterPassword;
      }

      resolve({
        identifier,
        arn: `arn:aws:rds:${REGION}:${ACCOUNT_ID}:db:${identifier}`,
        resourceId: `db-${randomString('ABCDEFGHIJKLMNOPQRSTUVWXYZ234567', 26)}`,
        engine,
        engineVersion: form.engineVersion,
        template: form.template,
        instance,
        storageType: getStorageType(form.storageType),
        allocatedStorage: Number(form.allocatedStorage),
        iops: getStorageType(form.storageType).perIops
          ? Number(form.iops)
          : null,
        storageAutoscaling: form.storageAutoscaling,
        maxStorage: form.storageAutoscaling ? Number(form.maxStorage) : null,
        multiAz: form.deployment === 'multi-az',
        primaryAz,
        secondaryAz: form.deployment === 'multi-az' ? secondaryAz : null,
        endpoint: `${identifier}.${randomString(LOWER_ALNUM, 12)}.${REGION}.rds.amazonaws.com`,
        port: Number(form.port),
        vpc: DEFAULT_VPC,
        subnetGroup: DEFAULT_SUBNET_GROUP,
        securityGroup:
          form.securityGroupMode === 'create'
            ? {
                id: `sg-${randomString('0123456789abcdef', 17)}`,
                name: form.securityGroupName.trim(),
              }
            : DEFAULT_SECURITY_GROUP,
        publiclyAccessible: form.publicAccess === 'yes',
        authentication: form.authentication,
        masterUsername: form.masterUsername,
        credentialsMode: form.credentialsMode,
        autoGeneratedPassword:
          form.credentialsMode === 'self' && form.autoGeneratePassword,
        password,
        secretArn,
        databaseName: form.databaseName || null,
        backups: form.backups,
        backupRetention: form.backups ? Number(form.backupRetention) : 0,
        encryption: form.encryption,
        deletionProtection: form.deletionProtection,
        estimate: estimateMonthlyCost(form),
        freeTierEligible: isFreeTierEligible(form),
        createdAt: new Date().toISOString(),
      });
    }, 900);
  });
}
