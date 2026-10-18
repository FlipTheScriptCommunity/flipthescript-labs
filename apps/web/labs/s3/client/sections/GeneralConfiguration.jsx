import React from 'react';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import FormField from '@cloudscape-design/components/form-field';
import Input from '@cloudscape-design/components/input';
import Select from '@cloudscape-design/components/select';
import SpaceBetween from '@cloudscape-design/components/space-between';
import { REGIONS } from '../data';
import { validateBucketName } from '../mockCreateBucket';

export default function GeneralConfiguration({ state, setState }) {
  const regionOption =
    REGIONS.find((r) => r.value === state.region) || REGIONS[0];
  const nameError = state.name ? validateBucketName(state.name) : null;

  return (
    <Container
      header={
        <Header
          variant="h2"
          description="Buckets are containers for data stored in S3."
        >
          General configuration
        </Header>
      }
    >
      <SpaceBetween size="l">
        <FormField
          label="Bucket name"
          description="Bucket names must be globally unique and must not contain spaces or uppercase letters."
          errorText={nameError}
        >
          <Input
            value={state.name}
            placeholder="my-bucket-name"
            onChange={(e) => setState((s) => ({ ...s, name: e.detail.value }))}
            nativeInputAttributes={{ dir: 'ltr' }}
          />
        </FormField>

        <FormField label="AWS Region">
          <Select
            selectedOption={regionOption}
            onChange={(e) =>
              setState((s) => ({ ...s, region: e.detail.selectedOption.value }))
            }
            options={REGIONS}
          />
        </FormField>
      </SpaceBetween>
    </Container>
  );
}
