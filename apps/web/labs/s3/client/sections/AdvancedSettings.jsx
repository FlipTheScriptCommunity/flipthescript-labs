import React from 'react';
import ExpandableSection from '@cloudscape-design/components/expandable-section';
import FormField from '@cloudscape-design/components/form-field';
import Toggle from '@cloudscape-design/components/toggle';
import Alert from '@cloudscape-design/components/alert';
import SpaceBetween from '@cloudscape-design/components/space-between';

export default function AdvancedSettings({ state, setState }) {
  const versioningOff = state.versioning !== 'enable';

  return (
    <ExpandableSection headerText="Advanced settings" variant="container">
      <SpaceBetween size="l">
        <FormField
          label="Object Lock"
          description="Prevents objects from being deleted or overwritten for a fixed amount of time or indefinitely. Object Lock can only be enabled at bucket creation, and requires Bucket Versioning."
        >
          <Toggle
            checked={state.objectLockEnabled}
            disabled={versioningOff}
            onChange={(e) =>
              setState((s) => ({
                ...s,
                objectLockEnabled: e.detail.checked,
                versioning: e.detail.checked ? 'enable' : s.versioning,
              }))
            }
          >
            Enable Object Lock
          </Toggle>
        </FormField>
        {versioningOff && (
          <Alert type="info">
            Enable Bucket Versioning above to turn on Object Lock.
          </Alert>
        )}
      </SpaceBetween>
    </ExpandableSection>
  );
}
