import React from 'react';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import RadioGroup from '@cloudscape-design/components/radio-group';
import { IPV6_OPTIONS } from '../data';

export default function Ipv6Cidr({ state, setState }) {
  return (
    <Container
      header={
        <Header
          variant="h2"
          description="Optional. Most teaching workloads don't need IPv6."
        >
          IPv6 CIDR block
        </Header>
      }
    >
      <RadioGroup
        value={state.ipv6}
        onChange={(e) => setState((s) => ({ ...s, ipv6: e.detail.value }))}
        items={IPV6_OPTIONS}
      />
    </Container>
  );
}
