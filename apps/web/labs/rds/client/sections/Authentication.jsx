import React from 'react';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import FormField from '@cloudscape-design/components/form-field';
import RadioGroup from '@cloudscape-design/components/radio-group';

export default function Authentication({ state, setState }) {
  return (
    <Container header={<Header variant="h2">Database authentication</Header>}>
      <FormField label="Database authentication options">
        <RadioGroup
          value={state.authentication}
          onChange={(e) =>
            setState((s) => ({ ...s, authentication: e.detail.value }))
          }
          items={[
            {
              value: 'password',
              label: 'Password authentication',
              description: 'Authenticates using database passwords.',
            },
            {
              value: 'password-iam',
              label: 'Password and IAM database authentication',
              description:
                'Authenticates using the database password and user credentials through AWS IAM users and roles.',
            },
            {
              value: 'password-kerberos',
              label: 'Password and Kerberos authentication',
              description:
                'Choose a directory in which you want to allow authorized users to authenticate with this DB instance using Kerberos Authentication. (Not available in this lab.)',
              disabled: true,
            },
          ]}
        />
      </FormField>
    </Container>
  );
}
