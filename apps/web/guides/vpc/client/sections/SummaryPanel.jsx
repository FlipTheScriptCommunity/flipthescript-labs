import React from 'react';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Box from '@cloudscape-design/components/box';
import Button from '@cloudscape-design/components/button';
import Alert from '@cloudscape-design/components/alert';
import ResourceMap from './ResourceMap';
import { buildResourcePlan } from '../mockCreateVpc';

export default function SummaryPanel({ state, onCreate, creating, error }) {
  const plan = buildResourcePlan(state);
  const natGatewayAzs =
    state.natGateways === 'none'
      ? []
      : state.natGateways === 'one'
        ? plan.publicSubnets.slice(0, 1).map((s) => s.az)
        : plan.publicSubnets.map((s) => s.az);

  return (
    <div className="summary-panel">
      <Container header={<Header variant="h2">Preview</Header>}>
        <SpaceBetween size="l">
          <ResourceMap
            vpcCidr={state.ipv4Cidr || '—'}
            azs={plan.azs}
            publicSubnets={plan.publicSubnets}
            privateSubnets={plan.privateSubnets}
            hasPublic={plan.hasPublic}
            natGatewayAzs={natGatewayAzs}
            s3Endpoint={state.vpcEndpoint === 's3-gateway'}
            showIds={false}
          />

          <div>
            <Box variant="awsui-key-label">Resources to be created</Box>
            <div>
              1 VPC, {plan.publicSubnets.length + plan.privateSubnets.length}{' '}
              subnets
              {plan.hasPublic ? ', 1 internet gateway' : ''}
              {plan.natCount > 0
                ? `, ${plan.natCount} NAT gateway${plan.natCount > 1 ? 's' : ''}`
                : ''}
              {state.vpcEndpoint === 's3-gateway' ? ', 1 VPC endpoint' : ''}
            </div>
          </div>

          {error && <Alert type="error">{error}</Alert>}

          <Button
            variant="primary"
            fullWidth
            loading={creating}
            onClick={onCreate}
          >
            Create VPC
          </Button>
        </SpaceBetween>
      </Container>
    </div>
  );
}
