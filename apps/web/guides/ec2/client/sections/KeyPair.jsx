import React from 'react';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import FormField from '@cloudscape-design/components/form-field';
import Select from '@cloudscape-design/components/select';
import RadioGroup from '@cloudscape-design/components/radio-group';
import Alert from '@cloudscape-design/components/alert';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Link from '@cloudscape-design/components/link';
import { EXISTING_KEY_PAIRS } from '../data';

export default function KeyPair({ state, setState }) {
  const options = EXISTING_KEY_PAIRS.map((k) => ({ value: k, label: k }));
  const selectedOption = options.find((o) => o.value === state.keyPair) || null;

  return (
    <Container
      header={
        <Header variant="h2" description="You'll need the private key to securely connect to your instance after it launches.">
          Key pair (login)
        </Header>
      }
    >
      <SpaceBetween size="l">
        <RadioGroup
          value={state.keyPairMode}
          onChange={(e) => setState((s) => ({ ...s, keyPairMode: e.detail.value }))}
          items={[
            { value: 'existing', label: 'Choose an existing key pair' },
            { value: 'proceed-without', label: 'Proceed without a key pair (Not recommended)' },
          ]}
        />

        {state.keyPairMode === 'existing' && (
          <FormField label="Key pair name" secondaryControl={<Link href="#" onFollow={(e) => e.preventDefault()}>Create new key pair</Link>}>
            <Select
              placeholder="Select a key pair"
              selectedOption={selectedOption}
              onChange={(e) => setState((s) => ({ ...s, keyPair: e.detail.selectedOption.value }))}
              options={options}
            />
          </FormField>
        )}

        {state.keyPairMode === 'proceed-without' && (
          <Alert type="warning">
            If you proceed without a key pair, you won't be able to connect to the instance unless you choose an AMI that
            is preconfigured with a password or other means of access.
          </Alert>
        )}
      </SpaceBetween>
    </Container>
  );
}
