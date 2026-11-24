// Simulates the EC2 "CreateVpc" (+ CreateSubnet, CreateRouteTable,
// CreateInternetGateway, CreateNatGateway, ...) API calls the real "VPC and
// more" wizard makes under the hood — entirely on the client, since this lab
// is a static bundle with no backend. Everything here mirrors the resources
// the real wizard actually creates, just with fake ids.

import { AZ_LETTERS, REGION } from './data';

const IPV4_CIDR_RE = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})\/(\d{1,2})$/;

export function validateIpv4Cidr(cidr) {
  if (!cidr) return 'An IPv4 CIDR block is required.';
  const match = cidr.match(IPV4_CIDR_RE);
  if (!match) return 'Enter a valid IPv4 CIDR block, e.g. 10.0.0.0/16.';
  const octets = [match[1], match[2], match[3], match[4]].map(Number);
  if (octets.some((o) => o > 255))
    return 'Each octet of the IPv4 CIDR block must be between 0 and 255.';
  const prefix = Number(match[5]);
  if (prefix < 16 || prefix > 28)
    return 'The VPC size must be between a /16 netmask and /28 netmask.';
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

const resourceId = (prefix) => `${prefix}-${randomHex(8)}`;

// Splits a /16 (or smaller) IPv4 CIDR into successive /20 subnet blocks, the
// same subnet size the real wizard's "VPC and more" option defaults to. Only
// used to make the preview/result look plausible — this lab never actually
// allocates real address space.
function deriveSubnetCidr(vpcCidr, index) {
  const match = vpcCidr.match(IPV4_CIDR_RE);
  if (!match) return '—';
  const base = Number(match[2]);
  const third = (base + index * 16) % 256;
  return `${match[1]}.${third}.0.0/20`;
}

export function buildResourcePlan(form) {
  const azs = Array.from(
    { length: form.azCount },
    (_, i) => `${REGION}${AZ_LETTERS[i]}`,
  );
  let subnetIndex = 0;

  const publicSubnets = [];
  for (let az = 0; az < form.azCount && az < form.publicSubnetCount; az++) {
    publicSubnets.push({
      az: azs[az],
      type: 'public',
      cidr: deriveSubnetCidr(form.ipv4Cidr, subnetIndex++),
      name: `${form.namePrefix}-subnet-public${az + 1}-${azs[az]}`,
    });
  }
  const privateSubnets = [];
  for (let az = 0; az < form.azCount && az < form.privateSubnetCount; az++) {
    privateSubnets.push({
      az: azs[az],
      type: 'private',
      cidr: deriveSubnetCidr(form.ipv4Cidr, subnetIndex++),
      name: `${form.namePrefix}-subnet-private${az + 1}-${azs[az]}`,
    });
  }

  const hasPublic = publicSubnets.length > 0;
  const natCount =
    form.natGateways === 'none'
      ? 0
      : form.natGateways === 'one'
        ? 1
        : publicSubnets.length;

  return { azs, publicSubnets, privateSubnets, hasPublic, natCount };
}

export function mockCreateVpc(form) {
  return new Promise((resolve, reject) => {
    const cidrError = validateIpv4Cidr(form.ipv4Cidr);
    if (cidrError) {
      reject(new Error(cidrError));
      return;
    }
    if (!form.namePrefix) {
      reject(new Error('Name tag is required to name the created resources.'));
      return;
    }
    if (form.publicSubnetCount === 0 && form.natGateways !== 'none') {
      reject(new Error('NAT gateways require at least one public subnet.'));
      return;
    }

    const plan = buildResourcePlan(form);

    setTimeout(() => {
      resolve({
        vpcId: resourceId('vpc'),
        vpcCidr: form.ipv4Cidr,
        ipv6CidrBlock:
          form.ipv6 === 'amazon'
            ? `2600:1f18:${randomHex(2)}:${randomHex(2)}00::/56`
            : null,
        region: REGION,
        publicSubnets: plan.publicSubnets.map((s) => ({
          ...s,
          subnetId: resourceId('subnet'),
        })),
        privateSubnets: plan.privateSubnets.map((s) => ({
          ...s,
          subnetId: resourceId('subnet'),
        })),
        internetGatewayId: plan.hasPublic ? resourceId('igw') : null,
        publicRouteTableId: plan.hasPublic ? resourceId('rtb') : null,
        privateRouteTableIds: plan.privateSubnets.map(() => resourceId('rtb')),
        natGateways: Array.from({ length: plan.natCount }, () => ({
          natGatewayId: resourceId('nat'),
          elasticIp: `${Math.floor(Math.random() * 223) + 3}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`,
        })),
        s3EndpointId:
          form.vpcEndpoint === 's3-gateway' ? resourceId('vpce') : null,
        dnsHostnames: form.dnsHostnames,
        dnsResolution: form.dnsResolution,
        createdAt: new Date().toISOString(),
      });
    }, 900);
  });
}
