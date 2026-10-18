// Simulates the S3 "PutObject" API entirely on the client. The file the
// student picks is read only for its name/size/type — nothing is actually
// transmitted anywhere, matching the rest of this lab's "no real backend"
// approach (see mockCreateBucket.js).

function randomHex(bytes) {
  let out = '';
  for (let i = 0; i < bytes; i++) {
    out += Math.floor(Math.random() * 256)
      .toString(16)
      .padStart(2, '0');
  }
  return out;
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const units = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  return `${(bytes / 1024 ** i).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export function mockUploadObject({
  bucketName,
  region,
  file,
  prefix,
  storageClass,
  encryptionType,
}) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('Choose a file to upload.'));
      return;
    }

    const key = `${prefix ? prefix.replace(/\/?$/, '/') : ''}${file.name}`;

    // Simulate the small delay of a real upload (not proportional to file
    // size — this is a teaching mock, not a real transfer).
    setTimeout(() => {
      resolve({
        key,
        sizeLabel: formatBytes(file.size),
        bytes: file.size,
        storageClass,
        encryptionType,
        etag: randomHex(16),
        versionId: randomHex(16),
        s3Uri: `s3://${bucketName}/${key}`,
        consoleUrl: `https://s3.console.aws.amazon.com/s3/object/${bucketName}?region=${region}&prefix=${key}`,
        uploadedAt: new Date().toISOString(),
      });
    }, 900);
  });
}
