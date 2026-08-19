// Content for the guided /help walkthrough. Each step spotlights one section
// of the launch page (matched by DOM id) and explains it in plain language.

export const TUTORIAL_STEPS = [
  {
    targetId: 'section-name-and-tags',
    title: 'Name and tags',
    description:
      'Give your instance a descriptive name, like "my-first-server". AWS shows this as the ' +
      "instance's Name tag throughout the console, which makes it much easier to find later. " +
      'Additional tags are optional key/value labels you can add for your own organization or billing.',
  },
  {
    targetId: 'section-ami',
    title: 'Choose an OS image (AMI)',
    description:
      'An AMI (Amazon Machine Image) is the operating system template your instance boots from — ' +
      'think of it as choosing which OS to install. For learning, pick Amazon Linux or Ubuntu.',
    tip: 'Tip: pair a "Free tier eligible" AMI with a "Free tier eligible" instance type to avoid unexpected charges.',
  },
  {
    targetId: 'section-instance-type',
    title: 'Pick an instance type',
    description:
      'The instance type sets how much CPU and memory your virtual server gets. t2.micro / t3.micro ' +
      '(1–2 vCPUs, 1 GiB memory) are free-tier eligible and plenty for coursework. Larger types like ' +
      'm5 or c5 cost more per hour and are meant for real workloads.',
  },
  {
    targetId: 'section-key-pair',
    title: 'Key pair (login)',
    description:
      "A key pair is how you'll securely connect to your instance over SSH. AWS keeps the public " +
      "half; you download the private half (a .pem file) once, and it's never shown again — so save " +
      "it somewhere safe. If you lose it, there's no way to recover it for that instance.",
    tip: 'First time? Choose "Create new key pair" and keep the downloaded file — you\'ll need it to connect.',
  },
  {
    targetId: 'section-network-settings',
    title: 'Network settings',
    description:
      'This controls where your instance lives on the network and what traffic can reach it. The ' +
      'security group is a virtual firewall — by default it only opens port 22 (SSH) from "My IP," ' +
      'so only you can connect.',
    tip: 'Avoid opening ports to "Anywhere (0.0.0.0/0)" unless you specifically need public access — it exposes the instance to the whole internet.',
  },
  {
    targetId: 'section-storage',
    title: 'Configure storage',
    description:
      'This is the root EBS volume — the virtual hard disk your OS and files live on. The default, ' +
      '8 GiB of gp3 storage, is free-tier eligible and enough for most classroom exercises. You can ' +
      'add more volumes later if a project needs extra space.',
  },
  {
    targetId: 'section-advanced-details',
    title: 'Advanced details (optional)',
    description:
      'Most beginners can leave this section collapsed. It holds optional settings: an IAM role ' +
      '(permissions to reach other AWS services), what happens on shutdown, termination protection, ' +
      'and "User data" — a startup script that runs automatically the first time the instance boots.',
  },
  {
    targetId: 'section-summary',
    title: 'Review & launch',
    description:
      "The Summary panel is a live preview of everything you've configured, including whether it " +
      'qualifies for the Free Tier. Set how many instances to launch, double-check your choices, then ' +
      'click Launch instance.',
    tip: "Remember: AWS bills running instances by the second. Stop or terminate instances you're done with so you don't leave them running unnecessarily.",
  },
];
