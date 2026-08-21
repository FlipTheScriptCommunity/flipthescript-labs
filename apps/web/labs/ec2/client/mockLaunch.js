// Simulates the EC2 "launch instance" API entirely on the client — this lab
// is embedded as a static bundle (no backend), so there's no server to call.
// Mirrors the validation/response shape the original standalone mock server used.

const AMI_NAMES = {
  'amazon-linux': 'Amazon Linux',
  suse: 'SUSE Linux',
  ubuntu: 'Ubuntu',
  redhat: 'Red Hat',
  windows: 'Windows',
  macos: 'macOS',
  debian: 'Debian',
};

function randomHex(bytes) {
  let out = '';
  for (let i = 0; i < bytes; i++) {
    out += Math.floor(Math.random() * 256)
      .toString(16)
      .padStart(2, '0');
  }
  return out;
}

function fakeInstanceId() {
  return 'i-' + randomHex(8);
}

function fakeRequestId() {
  const hex = randomHex(16);
  return [hex.slice(0, 8), hex.slice(8, 12), hex.slice(12, 16), hex.slice(16, 20), hex.slice(20, 32)].join('-');
}

export function mockLaunchInstance(payload) {
  return new Promise((resolve, reject) => {
    // Same basic validation the original mock API performed.
    if (payload.keyPairMode === 'existing' && !payload.keyPair) {
      reject(new Error('Select a key pair, or choose to proceed without one.'));
      return;
    }

    const count = Math.max(1, Math.min(20, parseInt(payload.numberOfInstances, 10) || 1));
    const instanceIds = Array.from({ length: count }, fakeInstanceId);

    // Simulate the small delay of a real API call.
    setTimeout(() => {
      resolve({
        requestId: fakeRequestId(),
        instanceIds,
        amiName: AMI_NAMES[payload.amiKey] || 'Amazon Linux',
        instanceType: payload.instanceType || 't2.micro',
        launchedAt: new Date().toISOString(),
      });
    }, 600);
  });
}
