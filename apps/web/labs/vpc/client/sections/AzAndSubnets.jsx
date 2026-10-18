import React from 'react';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import FormField from '@cloudscape-design/components/form-field';
import Select from '@cloudscape-design/components/select';
import SpaceBetween from '@cloudscape-design/components/space-between';
import { AZ_LETTERS, REGION } from '../data';

const countOption = (n) => ({ value: String(n), label: String(n) });

export default function AzAndSubnets({ state, setState }) {
  const azOptions = [1, 2, 3].map(countOption);
  const subnetOptionsFor = (azCount) =>
    Array.from({ length: azCount + 1 }, (_, n) => countOption(n));

  const setAzCount = (azCount) => {
    setState((s) => ({
      ...s,
      azCount,
      publicSubnetCount: Math.min(s.publicSubnetCount, azCount),
      privateSubnetCount: Math.min(s.privateSubnetCount, azCount),
    }));
  };

  return (
    <Container
      header={
        <Header
          variant="h2"
          description="Each Availability Zone is an isolated data center. Spreading subnets across more than one AZ is what makes a workload highly available."
        >
          Availability Zones (AZs) and subnets
        </Header>
      }
    >
      <SpaceBetween size="l">
        <FormField label="Number of Availability Zones">
          <Select
            selectedOption={countOption(state.azCount)}
            onChange={(e) => setAzCount(Number(e.detail.selectedOption.value))}
            options={azOptions}
          />
        </FormField>
        <FormField
          label="Availability Zones used"
          description="Assigned automatically, in order."
        >
          <div style={{ fontFamily: 'monospace' }} dir="ltr">
            {Array.from(
              { length: state.azCount },
              (_, i) => `${REGION}${AZ_LETTERS[i]}`,
            ).join(', ')}
          </div>
        </FormField>
        <FormField label="Number of public subnets">
          <Select
            selectedOption={countOption(state.publicSubnetCount)}
            onChange={(e) =>
              setState((s) => ({
                ...s,
                publicSubnetCount: Number(e.detail.selectedOption.value),
              }))
            }
            options={subnetOptionsFor(state.azCount)}
          />
        </FormField>
        <FormField label="Number of private subnets">
          <Select
            selectedOption={countOption(state.privateSubnetCount)}
            onChange={(e) =>
              setState((s) => ({
                ...s,
                privateSubnetCount: Number(e.detail.selectedOption.value),
              }))
            }
            options={subnetOptionsFor(state.azCount)}
          />
        </FormField>
      </SpaceBetween>
    </Container>
  );
}
