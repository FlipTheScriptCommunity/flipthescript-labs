import React from 'react';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import FormField from '@cloudscape-design/components/form-field';
import Input from '@cloudscape-design/components/input';
import Select from '@cloudscape-design/components/select';
import Checkbox from '@cloudscape-design/components/checkbox';
import SpaceBetween from '@cloudscape-design/components/space-between';
import { MAX_STORAGE, STORAGE_TYPES, getStorageType } from '../data';

const toOption = (t) => ({
  value: t.value,
  label: t.label,
  description: t.description,
});

export default function Storage({ state, setState, errors }) {
  const set = (patch) => setState((s) => ({ ...s, ...patch }));
  const type = getStorageType(state.storageType);

  const setType = (value) => {
    const next = getStorageType(value);
    setState((s) => ({
      ...s,
      storageType: value,
      allocatedStorage: String(
        Math.max(Number(s.allocatedStorage) || 0, next.min),
      ),
    }));
  };

  return (
    <Container header={<Header variant="h2">Storage</Header>}>
      <SpaceBetween size="l">
        <FormField label="Storage type">
          <Select
            selectedOption={toOption(type)}
            onChange={(e) => setType(e.detail.selectedOption.value)}
            options={STORAGE_TYPES.map(toOption)}
          />
        </FormField>

        <FormField
          label="Allocated storage"
          description="The amount of storage to allocate for your database, in GiB."
          constraintText={`The minimum value is ${type.min} GiB and the maximum value is ${MAX_STORAGE.toLocaleString('en-US')} GiB.`}
          errorText={errors.allocatedStorage}
        >
          <Input
            type="number"
            value={state.allocatedStorage}
            onChange={(e) => set({ allocatedStorage: e.detail.value })}
          />
        </FormField>

        {type.perIops && (
          <FormField
            label="Provisioned IOPS"
            description="The number of I/O operations per second to provision for the DB instance."
          >
            <Input
              type="number"
              value={state.iops}
              onChange={(e) => set({ iops: e.detail.value })}
            />
          </FormField>
        )}

        <FormField label="Storage autoscaling">
          <Checkbox
            checked={state.storageAutoscaling}
            onChange={(e) => set({ storageAutoscaling: e.detail.checked })}
            description="Enabling this feature will allow the storage to increase after the specified threshold is exceeded."
          >
            Enable storage autoscaling
          </Checkbox>
        </FormField>

        {state.storageAutoscaling && (
          <FormField
            label="Maximum storage threshold"
            description="Charges will apply when your database autoscales to the specified threshold."
            errorText={errors.maxStorage}
          >
            <Input
              type="number"
              value={state.maxStorage}
              onChange={(e) => set({ maxStorage: e.detail.value })}
            />
          </FormField>
        )}
      </SpaceBetween>
    </Container>
  );
}
