import React from 'react';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import FormField from '@cloudscape-design/components/form-field';
import Input from '@cloudscape-design/components/input';

export default function NameTag({ state, setState }) {
  return (
    <Container
      header={
        <Header
          variant="h2"
          description="Automatically generates names for resources (VPC, subnets, route tables, gateways) based on this value."
        >
          Name tag auto-generation
        </Header>
      }
    >
      <FormField
        label="Auto-generate"
        description="Resources will be prefixed with this value, e.g. my-project-vpc, my-project-subnet-public1-us-east-1a."
      >
        <Input
          value={state.namePrefix}
          placeholder="my-project"
          onChange={(e) =>
            setState((s) => ({ ...s, namePrefix: e.detail.value }))
          }
          nativeInputAttributes={{ dir: 'ltr' }}
        />
      </FormField>
    </Container>
  );
}
