// The subset of S3's bucket naming rules worth teaching (and enforcing) in the
// create-bucket form. Returns null when the name is valid.
// https://docs.aws.amazon.com/AmazonS3/latest/userguide/bucketnamingrules.html
export function validateBucketName(name: string): string | null {
  if (name.length < 3 || name.length > 63)
    return 'Bucket name must be between 3 and 63 characters long.';
  if (!/^[a-z0-9.-]+$/.test(name))
    return 'Bucket name can contain only lowercase letters, numbers, dots (.), and hyphens (-).';
  if (!/^[a-z0-9]/.test(name) || !/[a-z0-9]$/.test(name))
    return 'Bucket name must begin and end with a letter or number.';
  if (name.includes('..'))
    return 'Bucket name must not contain two adjacent periods.';
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(name))
    return 'Bucket name must not be formatted as an IP address.';
  return null;
}
