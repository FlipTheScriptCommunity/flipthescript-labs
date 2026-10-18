import React from 'react';
import ContentLayout from '@cloudscape-design/components/content-layout';
import Header from '@cloudscape-design/components/header';
import Alert from '@cloudscape-design/components/alert';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Container from '@cloudscape-design/components/container';
import Table from '@cloudscape-design/components/table';
import Box from '@cloudscape-design/components/box';
import Button from '@cloudscape-design/components/button';
import ColumnLayout from '@cloudscape-design/components/column-layout';
import ResourceMap from './ResourceMap';
import { AZ_LETTERS, REGION } from '../data';

export default function ResultView({ result, onCreateAnother }) {
  const allSubnets = [...result.publicSubnets, ...result.privateSubnets];
  const azs = Array.from(new Set(allSubnets.map((s) => s.az))).sort();
  if (azs.length === 0) {
    // No subnets at all is a valid (if unusual) combination — show the lone AZ(s) implied by nothing, falling back to none.
  }

  return (
    <ContentLayout header={<Header variant="h1">{result.vpcId}</Header>}>
      <SpaceBetween size="l">
        <Alert type="success" header="Your VPC has been created successfully">
          Region: {result.region}. {allSubnets.length} subnet
          {allSubnets.length === 1 ? '' : 's'} created across{' '}
          {new Set(allSubnets.map((s) => s.az)).size || 0} Availability Zone(s).
        </Alert>

        <Container header={<Header variant="h2">Resource map</Header>}>
          <ResourceMap
            vpcCidr={result.vpcCidr}
            azs={azs.length ? azs : [`${REGION}${AZ_LETTERS[0]}`]}
            publicSubnets={result.publicSubnets}
            privateSubnets={result.privateSubnets}
            hasPublic={result.publicSubnets.length > 0}
            natGatewayAzs={
              result.natGateways.length === result.publicSubnets.length
                ? result.publicSubnets.map((s) => s.az)
                : result.publicSubnets
                    .slice(0, result.natGateways.length)
                    .map((s) => s.az)
            }
            s3Endpoint={!!result.s3EndpointId}
            showIds
            ids={{
              vpcId: result.vpcId,
              internetGatewayId: result.internetGatewayId,
              s3EndpointId: result.s3EndpointId,
            }}
          />
        </Container>

        <Container header={<Header variant="h2">Details</Header>}>
          <ColumnLayout columns={3} variant="text-grid">
            <div>
              <Box variant="awsui-key-label">VPC ID</Box>
              <div>{result.vpcId}</div>
            </div>
            <div>
              <Box variant="awsui-key-label">IPv4 CIDR</Box>
              <div>{result.vpcCidr}</div>
            </div>
            <div>
              <Box variant="awsui-key-label">IPv6 CIDR</Box>
              <div>{result.ipv6CidrBlock || '—'}</div>
            </div>
            <div>
              <Box variant="awsui-key-label">Internet gateway</Box>
              <div>{result.internetGatewayId || '—'}</div>
            </div>
            <div>
              <Box variant="awsui-key-label">NAT gateways</Box>
              <div>
                {result.natGateways.length === 0
                  ? '—'
                  : result.natGateways.map((n) => n.natGatewayId).join(', ')}
              </div>
            </div>
            <div>
              <Box variant="awsui-key-label">DNS hostnames / resolution</Box>
              <div>
                {result.dnsHostnames ? 'Enabled' : 'Disabled'} /{' '}
                {result.dnsResolution ? 'Enabled' : 'Disabled'}
              </div>
            </div>
          </ColumnLayout>
        </Container>

        <Table
          header={
            <Header variant="h2" counter={`(${allSubnets.length})`}>
              Subnets
            </Header>
          }
          columnDefinitions={[
            { id: 'name', header: 'Name', cell: (item) => item.name },
            {
              id: 'subnetId',
              header: 'Subnet ID',
              cell: (item) => item.subnetId,
            },
            {
              id: 'type',
              header: 'Type',
              cell: (item) => (item.type === 'public' ? 'Public' : 'Private'),
            },
            { id: 'az', header: 'Availability Zone', cell: (item) => item.az },
            { id: 'cidr', header: 'IPv4 CIDR', cell: (item) => item.cidr },
          ]}
          items={allSubnets}
          empty={
            <Box textAlign="center" color="inherit">
              No subnets were created.
            </Box>
          }
        />

        <Button onClick={onCreateAnother}>Create another VPC</Button>
      </SpaceBetween>
    </ContentLayout>
  );
}
