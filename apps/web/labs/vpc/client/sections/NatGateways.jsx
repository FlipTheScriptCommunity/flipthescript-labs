import React from 'react';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import RadioGroup from '@cloudscape-design/components/radio-group';
import Alert from '@cloudscape-design/components/alert';
import { NAT_GATEWAY_OPTIONS } from '../data';

export default function NatGateways({ state, setState }) {
  const noPublicSubnets = state.publicSubnetCount === 0;

  return (
    <Container
      header={
        <Header
          variant="h2"
          description="Lets resources in private subnets reach the internet (e.g. for software updates) without being directly reachable from it. Billed per hour, plus data processed."
        >
          NAT gateways ($)
        </Header>
      }
    >
      <RadioGroup
        value={state.natGateways}
        onChange={(e) =>
          setState((s) => ({ ...s, natGateways: e.detail.value }))
        }
        items={NAT_GATEWAY_OPTIONS.map((o) => ({
          ...o,
          disabled: o.value !== 'none' && noPublicSubnets,
        }))}
      />
      {noPublicSubnets && state.natGateways !== 'none' && (
        <Alert type="warning">
          A NAT gateway needs at least one public subnet to live in.
        </Alert>
      )}
    </Container>
  );
}
