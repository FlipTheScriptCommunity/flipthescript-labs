import React from 'react';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import RadioGroup from '@cloudscape-design/components/radio-group';
import { VPC_ENDPOINT_OPTIONS } from '../data';

export default function VpcEndpoints({ state, setState }) {
  return (
    <Container
      header={
        <Header
          variant="h2"
          description="VPC endpoints let resources inside the VPC reach supported AWS services privately, without traversing the public internet."
        >
          VPC endpoints
        </Header>
      }
    >
      <RadioGroup
        value={state.vpcEndpoint}
        onChange={(e) =>
          setState((s) => ({ ...s, vpcEndpoint: e.detail.value }))
        }
        items={VPC_ENDPOINT_OPTIONS}
      />
    </Container>
  );
}
