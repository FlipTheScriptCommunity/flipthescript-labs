import React from 'react';
import Header from '@cloudscape-design/components/header';
import FormField from '@cloudscape-design/components/form-field';
import Input from '@cloudscape-design/components/input';
import Checkbox from '@cloudscape-design/components/checkbox';
import Select from '@cloudscape-design/components/select';
import SpaceBetween from '@cloudscape-design/components/space-between';
import ExpandableSection from '@cloudscape-design/components/expandable-section';

// This mock account has exactly one option here, so there's nothing to
// switch to — the control is shown so the page matches the real console.
const keepOnlyOption = () => undefined;

export default function AdditionalConfiguration({ state, setState, errors }) {
  const set = (patch) => setState((s) => ({ ...s, ...patch }));

  return (
    <ExpandableSection
      variant="container"
      headerText="Additional configuration"
      headerDescription="Database options, backup, encryption, and deletion protection."
      defaultExpanded
    >
      <SpaceBetween size="l">
        <Header variant="h3">Database options</Header>
        <FormField
          label="Initial database name"
          description="If you do not specify a database name, Amazon RDS does not create a database."
          errorText={errors.databaseName}
        >
          <Input
            value={state.databaseName}
            onChange={(e) => set({ databaseName: e.detail.value })}
            nativeInputAttributes={{ dir: 'ltr' }}
          />
        </FormField>

        <Header variant="h3">Backup</Header>
        <Checkbox
          checked={state.backups}
          onChange={(e) => set({ backups: e.detail.checked })}
          description="Creates a point-in-time snapshot of your database."
        >
          Enable automated backups
        </Checkbox>
        {state.backups && (
          <FormField
            label="Backup retention period"
            description="The number of days (1-35) for which automatic backups are kept."
            errorText={errors.backupRetention}
          >
            <Input
              type="number"
              value={state.backupRetention}
              onChange={(e) => set({ backupRetention: e.detail.value })}
            />
          </FormField>
        )}

        <Header variant="h3">Encryption</Header>
        <Checkbox
          checked={state.encryption}
          onChange={(e) => set({ encryption: e.detail.checked })}
          description="Choose to encrypt the given instance. Master key IDs and aliases appear in the list after they have been created using the AWS Key Management Service console."
        >
          Enable encryption
        </Checkbox>
        {state.encryption && (
          <FormField label="AWS KMS key">
            <Select
              selectedOption={{ value: 'aws/rds', label: '(default) aws/rds' }}
              onChange={keepOnlyOption}
              options={[{ value: 'aws/rds', label: '(default) aws/rds' }]}
            />
          </FormField>
        )}

        <Header variant="h3">Deletion protection</Header>
        <Checkbox
          checked={state.deletionProtection}
          onChange={(e) => set({ deletionProtection: e.detail.checked })}
          description="Protects the database from being deleted accidentally. While this option is enabled, you can't delete the database."
        >
          Enable deletion protection
        </Checkbox>
      </SpaceBetween>
    </ExpandableSection>
  );
}
