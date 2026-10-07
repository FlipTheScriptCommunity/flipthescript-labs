import React from 'react';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import RadioGroup from '@cloudscape-design/components/radio-group';

export default function BucketVersioning({ state, setState }) {
  return (
    <Container
      header={
        <Header
          variant="h2"
          description="Versioning is a means of keeping multiple variants of an object in the same bucket. You can use versioning to preserve, retrieve, and restore every version of every object stored in your bucket."
        >
          Bucket Versioning
        </Header>
      }
    >
      <RadioGroup
        value={state.versioning}
        onChange={(e) => {
          const value = e.detail.value;
          setState((s) => ({
            ...s,
            versioning: value,
            // Object Lock can't be enabled without versioning — if the
            // student disables versioning after turning Object Lock on,
            // turn it back off too so the form can't reach an invalid combo.
            objectLockEnabled: value === 'enable' ? s.objectLockEnabled : false,
          }));
        }}
        items={[
          { value: 'disable', label: 'Disable' },
          { value: 'enable', label: 'Enable' },
        ]}
      />
    </Container>
  );
}
