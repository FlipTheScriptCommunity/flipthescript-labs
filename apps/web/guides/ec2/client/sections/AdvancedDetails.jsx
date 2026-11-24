import React from 'react';
import ExpandableSection from '@cloudscape-design/components/expandable-section';
import FormField from '@cloudscape-design/components/form-field';
import Select from '@cloudscape-design/components/select';
import RadioGroup from '@cloudscape-design/components/radio-group';
import Toggle from '@cloudscape-design/components/toggle';
import Textarea from '@cloudscape-design/components/textarea';
import SpaceBetween from '@cloudscape-design/components/space-between';
import { IAM_ROLES } from '../data';

export default function AdvancedDetails({ state, setState }) {
  return (
    <ExpandableSection headerText="Advanced details" variant="container">
      <SpaceBetween size="l">
        <FormField label="IAM instance profile">
          <Select
            selectedOption={{ value: state.iamRole, label: state.iamRole }}
            onChange={(e) => setState((s) => ({ ...s, iamRole: e.detail.selectedOption.value }))}
            options={IAM_ROLES.map((r) => ({ value: r, label: r }))}
          />
        </FormField>

        <FormField label="Shutdown behavior">
          <RadioGroup
            value={state.shutdownBehavior}
            onChange={(e) => setState((s) => ({ ...s, shutdownBehavior: e.detail.value }))}
            items={[
              { value: 'stop', label: 'Stop' },
              { value: 'terminate', label: 'Terminate' },
            ]}
          />
        </FormField>

        <FormField label="Termination protection" description="Protect against accidental termination.">
          <Toggle
            checked={state.terminationProtection}
            onChange={(e) => setState((s) => ({ ...s, terminationProtection: e.detail.checked }))}
          >
            Enable termination protection
          </Toggle>
        </FormField>

        <FormField label="User data" description="Optional script that runs on first boot.">
          <Textarea
            value={state.userData}
            onChange={(e) => setState((s) => ({ ...s, userData: e.detail.value }))}
            placeholder={'#!/bin/bash\nyum update -y'}
            rows={6}
          />
        </FormField>
      </SpaceBetween>
    </ExpandableSection>
  );
}
