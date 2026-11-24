import React from 'react';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import Tiles from '@cloudscape-design/components/tiles';
import FormField from '@cloudscape-design/components/form-field';
import Select from '@cloudscape-design/components/select';
import SpaceBetween from '@cloudscape-design/components/space-between';
import { ENGINES, getEngine } from '../data';

export default function EngineOptions({ state, onEngineChange, setState }) {
  const engine = getEngine(state.engine);
  const versionOption = (v) => ({ value: v, label: `${engine.label} ${v}` });

  return (
    <Container header={<Header variant="h2">Engine options</Header>}>
      <SpaceBetween size="l">
        <FormField label="Engine type">
          <Tiles
            value={state.engine}
            onChange={(e) => onEngineChange(e.detail.value)}
            columns={4}
            items={ENGINES.map((e) => ({
              value: e.id,
              label: e.label,
              disabled: e.disabled,
              description: e.disabled ? 'Not available in this lab' : undefined,
            }))}
          />
        </FormField>
        <FormField label="Engine version">
          <Select
            selectedOption={versionOption(state.engineVersion)}
            onChange={(e) =>
              setState((s) => ({
                ...s,
                engineVersion: e.detail.selectedOption.value,
              }))
            }
            options={engine.versions.map(versionOption)}
          />
        </FormField>
      </SpaceBetween>
    </Container>
  );
}
