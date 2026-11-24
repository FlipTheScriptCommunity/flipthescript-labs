// Simulates the S3 "CreateBucket" API entirely on the client — this lab is
// embedded as a static bundle (no backend), so there's no server to call.
// validateBucketName() mirrors S3's real bucket-naming rules so the lab
// teaches the actual constraints, not an invented simplified set.

const IPV4_RE = /^(\d{1,3}\.){3}\d{1,3}$/;

export function validateBucketName(name) {
  if (!name) return 'Bucket name is required.';
  if (name.length < 3 || name.length > 63) {
    return 'Bucket name must be between 3 (min) and 63 (max) characters long.';
  }
  if (!/^[a-z0-9.-]+$/.test(name)) {
    return 'Bucket name can consist only of lowercase letters, numbers, periods (.), and hyphens (-).';
  }
  if (!/^[a-z0-9]/.test(name) || !/[a-z0-9]$/.test(name)) {
    return 'Bucket name must begin and end with a letter or number.';
  }
  if (name.includes('..')) {
    return 'Bucket name must not contain two adjacent periods.';
  }
  if (IPV4_RE.test(name)) {
    return 'Bucket name must not be formatted as an IP address.';
  }
  if (name.startsWith('xn--') || name.startsWith('sthree-')) {
    return 'Bucket name must not start with the prefix "xn--" or "sthree-".';
  }
  if (
    name.endsWith('-s3alias') ||
    name.endsWith('--ol-s3') ||
    name.endsWith('--x-s3')
  ) {
    return 'Bucket name must not end with the suffix "-s3alias", "--ol-s3", or "--x-s3".';
  }
  return null;
}

function randomHex(bytes) {
  let out = '';
  for (let i = 0; i < bytes; i++) {
    out += Math.floor(Math.random() * 256)
      .toString(16)
      .padStart(2, '0');
  }
  return out;
}

export function mockCreateBucket(payload) {
  return new Promise((resolve, reject) => {
    const nameError = validateBucketName(payload.name);
    if (nameError) {
      reject(new Error(nameError));
      return;
    }
    if (payload.objectLockEnabled && payload.versioning !== 'enable') {
      reject(
        new Error('Object Lock requires Bucket Versioning to be enabled.'),
      );
      return;
    }
    if (
      !payload.blockPublicAccess.blockNewAcls &&
      !payload.blockPublicAccess.blockAnyAcls &&
      !payload.blockPublicAccess.blockNewPolicies &&
      !payload.blockPublicAccess.blockAnyPolicies &&
      !payload.publicAccessAcknowledged
    ) {
      reject(
        new Error(
          'You must acknowledge that the bucket and the objects in it can be public before turning off Block Public Access settings.',
        ),
      );
      return;
    }

    setTimeout(() => {
      resolve({
        bucketArn: `arn:aws:s3:::${payload.name}`,
        region: payload.region,
        creationDate: new Date().toISOString(),
        requestId: randomHex(8).toUpperCase(),
      });
    }, 700);
  });
}
