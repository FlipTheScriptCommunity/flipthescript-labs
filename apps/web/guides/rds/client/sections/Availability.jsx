import React from 'react';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import Tiles from '@cloudscape-design/components/tiles';
import FormField from '@cloudscape-design/components/form-field';

export default function Availability({ state, setState }) {
  const freeTier = state.template === 'free-tier';
  return (
    <Container
      header={<Header variant="h2">Availability and durability</Header>}
    >
      <FormField
        label="Deployment options"
        description={
          freeTier
            ? 'The Free tier template only supports a Single-AZ DB instance.'
            : undefined
        }
      >
        <Tiles
          value={state.deployment}
          onChange={(e) =>
            setState((s) => ({ ...s, deployment: e.detail.value }))
          }
          columns={3}
          items={[
            {
              value: 'multi-az-cluster',
              label: 'Multi-AZ DB cluster deployment (3 instances)',
              description:
                'Creates a DB cluster with a primary DB instance and two readable standby DB instances, with each in a different Availability Zone. (Not available in this lab.)',
              disabled: true,
            },
            {
              value: 'multi-az',
              label: 'Multi-AZ DB instance deployment (2 instances)',
              description:
                'Creates a primary DB instance and a standby DB instance in a different Availability Zone. Provides high availability and data redundancy, but the standby DB instance doesn’t support connections for read workloads.',
              disabled: freeTier,
            },
            {
              value: 'single-az',
              label: 'Single-AZ DB instance deployment (1 instance)',
              description:
                'Creates a single DB instance with no standby DB instances.',
            },
          ]}
        />
      </FormField>
    </Container>
  );
}
