import React from 'react';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import FormField from '@cloudscape-design/components/form-field';
import RadioGroup from '@cloudscape-design/components/radio-group';
import Select from '@cloudscape-design/components/select';
import SpaceBetween from '@cloudscape-design/components/space-between';
import {
  CLASS_FAMILIES,
  INSTANCE_CLASSES,
  getInstanceClass,
  instanceClassLabel,
} from '../data';

const toOption = (c) => ({ value: c.id, label: instanceClassLabel(c) });

export default function InstanceConfiguration({ state, setState }) {
  const freeTier = state.template === 'free-tier';
  const classes = INSTANCE_CLASSES.filter(
    (c) => c.family === state.classFamily && (!freeTier || c.freeTier),
  );

  const setFamily = (family) => {
    const first = INSTANCE_CLASSES.find(
      (c) => c.family === family && (!freeTier || c.freeTier),
    );
    setState((s) => ({ ...s, classFamily: family, instanceClass: first.id }));
  };

  return (
    <Container
      header={
        <Header
          variant="h2"
          description="The DB instance configuration options below are limited to those supported by the engine that you selected above."
        >
          Instance configuration
        </Header>
      }
    >
      <SpaceBetween size="l">
        <FormField
          label="DB instance class"
          description={
            freeTier
              ? 'The Free tier template only includes burstable micro classes.'
              : undefined
          }
        >
          <RadioGroup
            value={state.classFamily}
            onChange={(e) => setFamily(e.detail.value)}
            items={CLASS_FAMILIES.map((f) => ({
              ...f,
              disabled: freeTier && f.value !== 'burstable',
            }))}
          />
        </FormField>
        <Select
          selectedOption={toOption(getInstanceClass(state.instanceClass))}
          onChange={(e) =>
            setState((s) => ({
              ...s,
              instanceClass: e.detail.selectedOption.value,
            }))
          }
          options={classes.map(toOption)}
          ariaLabel="DB instance class"
        />
      </SpaceBetween>
    </Container>
  );
}
