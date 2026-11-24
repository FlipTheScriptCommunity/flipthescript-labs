// Static reference data for the mock "Create VPC" (VPC and more) wizard.
// All values are illustrative, not live AWS data.

// Matches the real console's own AZ-count options for the "VPC and more"
// wizard. AZ letters are assigned in order as the count increases.
export const AZ_LETTERS = ['a', 'b', 'c'];
export const REGION = 'us-east-1';
export const REGION_LABEL = 'US East (N. Virginia)';

export const TENANCY_OPTIONS = [
  { value: 'default', label: 'Default' },
  { value: 'dedicated', label: 'Dedicated' },
];

export const IPV6_OPTIONS = [
  { value: 'none', label: 'No IPv6 CIDR block' },
  { value: 'amazon', label: 'Amazon-provided IPv6 CIDR block' },
];

export const NAT_GATEWAY_OPTIONS = [
  { value: 'none', label: 'None' },
  {
    value: 'one-per-az',
    label: '1 per AZ',
    description: 'Highly available, higher cost.',
  },
  {
    value: 'one',
    label: '1',
    description:
      'A single NAT gateway for the whole VPC — lower cost, single point of failure.',
  },
];

export const VPC_ENDPOINT_OPTIONS = [
  { value: 'none', label: 'None' },
  {
    value: 's3-gateway',
    label: 'S3 Gateway',
    description:
      'Lets resources in private subnets reach S3 without a NAT gateway or internet access.',
  },
];
