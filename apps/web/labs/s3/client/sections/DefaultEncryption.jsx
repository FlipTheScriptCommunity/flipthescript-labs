import React from 'react';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import FormField from '@cloudscape-design/components/form-field';
import RadioGroup from '@cloudscape-design/components/radio-group';
import Select from '@cloudscape-design/components/select';
import Toggle from '@cloudscape-design/components/toggle';
import SpaceBetween from '@cloudscape-design/components/space-between';
import { ENCRYPTION_TYPES, KMS_KEYS } from '../data';

export default function DefaultEncryption({ state, setState }) {
  const kmsKeyOption =
    KMS_KEYS.find((k) => k.value === state.kmsKey) || KMS_KEYS[0];

  return (
    <Container
      header={
        <Header
          variant="h2"
          description="Server-side encryption is automatically applied to new objects stored in this bucket."
        >
          Default encryption
        </Header>
      }
    >
      <SpaceBetween size="l">
        <FormField label="Encryption type">
          <RadioGroup
            value={state.encryptionType}
            onChange={(e) =>
              setState((s) => ({ ...s, encryptionType: e.detail.value }))
            }
            items={ENCRYPTION_TYPES.map((t) => ({
              value: t.value,
              label: t.label,
            }))}
          />
        </FormField>

        {state.encryptionType === 'SSE-KMS' && (
          <>
            <FormField label="AWS KMS key">
              <Select
                selectedOption={kmsKeyOption}
                onChange={(e) =>
                  setState((s) => ({
                    ...s,
                    kmsKey: e.detail.selectedOption.value,
                  }))
                }
                options={KMS_KEYS}
              />
            </FormField>
            <FormField
              label="Bucket Key"
              description="Reduces encryption costs by lowering the number of requests made to AWS KMS."
            >
              <Toggle
                checked={state.bucketKeyEnabled}
                onChange={(e) =>
                  setState((s) => ({
                    ...s,
                    bucketKeyEnabled: e.detail.checked,
                  }))
                }
              >
                Enable Bucket Key
              </Toggle>
            </FormField>
          </>
        )}
      </SpaceBetween>
    </Container>
  );
}
