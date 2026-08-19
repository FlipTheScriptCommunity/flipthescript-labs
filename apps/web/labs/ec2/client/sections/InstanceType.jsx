import React from 'react';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import FormField from '@cloudscape-design/components/form-field';
import Select from '@cloudscape-design/components/select';
import ColumnLayout from '@cloudscape-design/components/column-layout';
import Box from '@cloudscape-design/components/box';
import Link from '@cloudscape-design/components/link';
import SpaceBetween from '@cloudscape-design/components/space-between';
import { INSTANCE_TYPES } from '../data';

export default function InstanceType({ state, setState }) {
  const options = INSTANCE_TYPES.map((it) => ({
    value: it.value,
    label: it.value,
    description: `${it.vcpu} vCPU, ${it.memory}${it.freeTier ? ' — Free tier eligible' : ''}`,
  }));
  const selectedOption = options.find((o) => o.value === state.instanceType) || options[0];
  const details = INSTANCE_TYPES.find((it) => it.value === state.instanceType) || INSTANCE_TYPES[0];

  return (
    <Container header={<Header variant="h2" description="Instance type determines the hardware of the host computer used for your instance.">Instance type</Header>}>
      <SpaceBetween size="l">
        <FormField label="Instance type">
          <Select
            selectedOption={selectedOption}
            onChange={(e) => setState((s) => ({ ...s, instanceType: e.detail.selectedOption.value }))}
            options={options}
          />
        </FormField>

        <ColumnLayout columns={4} variant="text-grid">
          <div>
            <Box variant="awsui-key-label">Family</Box>
            <div>{details.value.split('.')[0]}</div>
          </div>
          <div>
            <Box variant="awsui-key-label">vCPUs</Box>
            <div>{details.vcpu}</div>
          </div>
          <div>
            <Box variant="awsui-key-label">Memory</Box>
            <div>{details.memory}</div>
          </div>
          <div>
            <Box variant="awsui-key-label">Network performance</Box>
            <div>{details.network}</div>
          </div>
        </ColumnLayout>

        <Link external href="#" onFollow={(e) => e.preventDefault()}>
          Compare instance types
        </Link>
      </SpaceBetween>
    </Container>
  );
}
