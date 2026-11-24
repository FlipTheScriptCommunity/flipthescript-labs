// Static reference data used to populate the mock S3 "Create bucket" and
// object-upload experience. All values are illustrative, not live AWS data.

export const REGIONS = [
  { value: 'us-east-1', label: 'US East (N. Virginia) us-east-1' },
  { value: 'us-west-2', label: 'US West (Oregon) us-west-2' },
  { value: 'eu-west-1', label: 'Europe (Ireland) eu-west-1' },
  { value: 'eu-central-1', label: 'Europe (Frankfurt) eu-central-1' },
  { value: 'il-central-1', label: 'Israel (Tel Aviv) il-central-1' },
  { value: 'ap-southeast-1', label: 'Asia Pacific (Singapore) ap-southeast-1' },
];

export const STORAGE_CLASSES = [
  {
    value: 'STANDARD',
    label: 'Standard',
    description: 'Frequently accessed data',
  },
  {
    value: 'INTELLIGENT_TIERING',
    label: 'Intelligent-Tiering',
    description:
      'Automatic cost savings for unknown or changing access patterns',
  },
  {
    value: 'STANDARD_IA',
    label: 'Standard-IA',
    description: 'Infrequently accessed data',
  },
  {
    value: 'ONEZONE_IA',
    label: 'One Zone-IA',
    description: 'Infrequently accessed, non-critical data',
  },
  {
    value: 'GLACIER_IR',
    label: 'Glacier Instant Retrieval',
    description: 'Long-lived archive data accessed rarely',
  },
  {
    value: 'GLACIER',
    label: 'Glacier Flexible Retrieval',
    description: 'Long-lived archive data accessed once or twice a year',
  },
  {
    value: 'DEEP_ARCHIVE',
    label: 'Glacier Deep Archive',
    description:
      'Long-lived archive data accessed rarely, retrieved within hours',
  },
];

export const ENCRYPTION_TYPES = [
  { value: 'SSE-S3', label: 'Amazon S3 managed keys (SSE-S3)' },
  { value: 'SSE-KMS', label: 'AWS Key Management Service key (SSE-KMS)' },
];

export const KMS_KEYS = [
  { value: 'aws/s3', label: 'aws/s3 (default AWS managed key)' },
  { value: 'alias/my-app-key', label: 'alias/my-app-key' },
];

// Block Public Access settings, in the order the real console lists them.
export const BLOCK_PUBLIC_ACCESS_OPTIONS = [
  {
    key: 'blockNewAcls',
    label:
      'Block public access to buckets and objects granted through new access control lists (ACLs)',
  },
  {
    key: 'blockAnyAcls',
    label:
      'Block public access to buckets and objects granted through any access control lists (ACLs)',
  },
  {
    key: 'blockNewPolicies',
    label:
      'Block public access to buckets and objects granted through new public bucket or access point policies',
  },
  {
    key: 'blockAnyPolicies',
    label:
      'Block public and cross-account access to buckets and objects through any public bucket or access point policies',
  },
];
