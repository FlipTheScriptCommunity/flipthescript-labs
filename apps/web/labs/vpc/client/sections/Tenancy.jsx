import React from 'react';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import RadioGroup from '@cloudscape-design/components/radio-group';
import { TENANCY_OPTIONS } from '../data';

export default function Tenancy({ state, setState }) {
  return (
    <Container
      header={
        <Header
          variant="h2"
          description="Dedicated instances run on hardware dedicated to a single customer — almost always unnecessary, and considerably more expensive."
        >
          Tenancy
        </Header>
      }
    >
      <RadioGroup
        value={state.tenancy}
        onChange={(e) => setState((s) => ({ ...s, tenancy: e.detail.value }))}
        items={TENANCY_OPTIONS}
      />
    </Container>
  );
}
