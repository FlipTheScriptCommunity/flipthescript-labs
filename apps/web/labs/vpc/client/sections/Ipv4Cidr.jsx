import React from 'react';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import FormField from '@cloudscape-design/components/form-field';
import Input from '@cloudscape-design/components/input';
import { validateIpv4Cidr } from '../mockCreateVpc';

export default function Ipv4Cidr({ state, setState }) {
  const error = state.ipv4Cidr ? validateIpv4Cidr(state.ipv4Cidr) : null;

  return (
    <Container
      header={
        <Header
          variant="h2"
          description="The range of IPv4 addresses for your VPC, in CIDR notation. Must be between a /16 and /28 netmask."
        >
          IPv4 CIDR block
        </Header>
      }
    >
      <FormField label="IPv4 CIDR block" errorText={error}>
        <Input
          value={state.ipv4Cidr}
          placeholder="10.0.0.0/16"
          onChange={(e) =>
            setState((s) => ({ ...s, ipv4Cidr: e.detail.value }))
          }
          nativeInputAttributes={{ dir: 'ltr' }}
        />
      </FormField>
    </Container>
  );
}
