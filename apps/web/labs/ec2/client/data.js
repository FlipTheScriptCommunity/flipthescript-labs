// Static reference data used to populate the mock EC2 launch experience.
// All values are illustrative, not live AWS data.

export const AMIS = [
  {
    id: 'ami-0c94855ba95c71c99',
    key: 'amazon-linux',
    name: 'Amazon Linux',
    description: 'Amazon Linux 2023 AMI',
    detail: 'Amazon Linux 2023 AMI 2023.5.20240722.0 x86_64 HVM kernel-6.1',
    freeTier: true,
    badgeColor: '#ff9900',
    initials: 'AL',
  },
  {
    id: 'ami-0suse00000000001',
    key: 'suse',
    name: 'SUSE Linux',
    description: 'SUSE Linux Enterprise Server 15 SP5',
    detail: 'suse-sles-15-sp5-v20240523-hvm-ssd-x86_64',
    freeTier: false,
    badgeColor: '#73ba25',
    initials: 'SU',
  },
  {
    id: 'ami-0ubuntu000000001',
    key: 'ubuntu',
    name: 'Ubuntu',
    description: 'Ubuntu Server 24.04 LTS',
    detail: 'ubuntu/images/hvm-ssd/ubuntu-noble-24.04-amd64-server-20240701',
    freeTier: true,
    badgeColor: '#E95420',
    initials: 'UB',
  },
  {
    id: 'ami-0redhat0000000001',
    key: 'redhat',
    name: 'Red Hat',
    description: 'Red Hat Enterprise Linux 9',
    detail: 'RHEL-9.4.0_HVM-20240605-x86_64-0-Hourly2-GP3',
    freeTier: false,
    badgeColor: '#EE0000',
    initials: 'RH',
  },
  {
    id: 'ami-0windows000000001',
    key: 'windows',
    name: 'Windows',
    description: 'Microsoft Windows Server 2022 Base',
    detail: 'Windows_Server-2022-English-Full-Base-2024.07.10',
    freeTier: false,
    badgeColor: '#00A4EF',
    initials: 'WS',
  },
  {
    id: 'ami-0macos000000000001',
    key: 'macos',
    name: 'macOS',
    description: 'macOS Sonoma 14',
    detail: 'amzn-ec2-macos-14.5-20240701-054007',
    freeTier: false,
    badgeColor: '#555555',
    initials: 'MC',
  },
  {
    id: 'ami-0debian00000000001',
    key: 'debian',
    name: 'Debian',
    description: 'Debian 12 (Bookworm)',
    detail: 'debian-12-amd64-20240701-1740',
    freeTier: false,
    badgeColor: '#A81D33',
    initials: 'DB',
  },
];

export const INSTANCE_TYPES = [
  { value: 't2.micro', vcpu: 1, memory: '1 GiB', network: 'Low to Moderate', freeTier: true, price: 0.0116 },
  { value: 't3.micro', vcpu: 2, memory: '1 GiB', network: 'Up to 5 Gigabit', freeTier: true, price: 0.0104 },
  { value: 't3.small', vcpu: 2, memory: '2 GiB', network: 'Up to 5 Gigabit', freeTier: false, price: 0.0208 },
  { value: 't3.medium', vcpu: 2, memory: '4 GiB', network: 'Up to 5 Gigabit', freeTier: false, price: 0.0416 },
  { value: 'm5.large', vcpu: 2, memory: '8 GiB', network: 'Up to 10 Gigabit', freeTier: false, price: 0.096 },
  { value: 'm5.xlarge', vcpu: 4, memory: '16 GiB', network: 'Up to 10 Gigabit', freeTier: false, price: 0.192 },
  { value: 'c5.large', vcpu: 2, memory: '4 GiB', network: 'Up to 10 Gigabit', freeTier: false, price: 0.085 },
  { value: 'c5.xlarge', vcpu: 4, memory: '8 GiB', network: 'Up to 10 Gigabit', freeTier: false, price: 0.17 },
  { value: 'r5.large', vcpu: 2, memory: '16 GiB', network: 'Up to 10 Gigabit', freeTier: false, price: 0.126 },
];

export const EXISTING_KEY_PAIRS = ['my-dev-keypair', 'prod-bastion-key', 'ci-runner-key'];

export const VPCS = [
  { value: 'vpc-0a1b2c3d4e5f60001', label: 'vpc-0a1b2c3d4e5f60001 (default)' },
  { value: 'vpc-0f9e8d7c6b5a40002', label: 'vpc-0f9e8d7c6b5a40002 (app-prod-vpc)' },
];

export const SUBNETS = [
  { value: 'subnet-0111aaa1', label: 'subnet-0111aaa1 | us-east-1a | Default subnet' },
  { value: 'subnet-0222bbb2', label: 'subnet-0222bbb2 | us-east-1b | Default subnet' },
  { value: 'subnet-0333ccc3', label: 'subnet-0333ccc3 | us-east-1c | Default subnet' },
];

export const VOLUME_TYPES = ['gp3', 'gp2', 'io1', 'io2', 'st1', 'sc1', 'standard'];

export const IAM_ROLES = ['None', 'EC2-S3-ReadOnly-Role', 'EC2-SSM-Role', 'AppServer-InstanceRole'];
