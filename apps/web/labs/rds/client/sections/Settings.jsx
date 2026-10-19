import React from 'react';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import FormField from '@cloudscape-design/components/form-field';
import Input from '@cloudscape-design/components/input';
import RadioGroup from '@cloudscape-design/components/radio-group';
import Checkbox from '@cloudscape-design/components/checkbox';
import SpaceBetween from '@cloudscape-design/components/space-between';
import ExpandableSection from '@cloudscape-design/components/expandable-section';
import { getEngine } from '../data';

export default function Settings({ state, setState, errors }) {
  const set = (patch) => setState((s) => ({ ...s, ...patch }));
  const engine = getEngine(state.engine);

  return (
    <Container header={<Header variant="h2">Settings</Header>}>
      <SpaceBetween size="l">
        <FormField
          label="DB instance identifier"
          description="Type a name for your DB instance. The name must be unique across all DB instances owned by your AWS account in the current AWS Region."
          constraintText={
            'The DB instance identifier is case-insensitive, but is stored as all lowercase (as in "mydbinstance"). ' +
            "Constraints: 1 to 63 alphanumeric characters or hyphens. First character must be a letter. Can't contain two consecutive hyphens. Can't end with a hyphen."
          }
          errorText={errors.identifier}
        >
          <Input
            value={state.identifier}
            onChange={(e) => set({ identifier: e.detail.value })}
            nativeInputAttributes={{ dir: 'ltr' }}
          />
        </FormField>

        <ExpandableSection headerText="Credentials Settings" defaultExpanded>
          <SpaceBetween size="l">
            <FormField
              label="Master username"
              description="Type a login ID for the master user of your DB instance."
              constraintText="1 to 16 alphanumeric characters. The first character must be a letter."
              errorText={errors.masterUsername}
            >
              <Input
                value={state.masterUsername}
                onChange={(e) => set({ masterUsername: e.detail.value })}
                nativeInputAttributes={{ dir: 'ltr' }}
              />
            </FormField>

            <FormField
              label="Credentials management"
              description="You can use AWS Secrets Manager or manage your master user credentials."
            >
              <RadioGroup
                value={state.credentialsMode}
                onChange={(e) => set({ credentialsMode: e.detail.value })}
                items={[
                  {
                    value: 'secrets-manager',
                    label: 'Managed in AWS Secrets Manager — most secure',
                    description:
                      'RDS generates a password for you and manages it throughout its lifecycle using AWS Secrets Manager.',
                  },
                  {
                    value: 'self',
                    label: 'Self managed',
                    description:
                      'Create your own password or have RDS create a password that you manage.',
                  },
                ]}
              />
            </FormField>

            {state.credentialsMode === 'self' && (
              <SpaceBetween size="l">
                <Checkbox
                  checked={state.autoGeneratePassword}
                  onChange={(e) =>
                    set({ autoGeneratePassword: e.detail.checked })
                  }
                  description="Amazon RDS can generate a password for you, or you can specify your own password."
                >
                  Auto generate password
                </Checkbox>

                {!state.autoGeneratePassword && (
                  <>
                    <FormField
                      label="Master password"
                      constraintText={`Minimum constraints: At least 8 printable ASCII characters (up to ${engine.passwordMax}). Can't contain any of the following symbols: / ' " @`}
                      errorText={errors.masterPassword}
                    >
                      <Input
                        type="password"
                        value={state.masterPassword}
                        onChange={(e) =>
                          set({ masterPassword: e.detail.value })
                        }
                        nativeInputAttributes={{ dir: 'ltr' }}
                      />
                    </FormField>
                    <FormField
                      label="Confirm master password"
                      errorText={errors.confirmPassword}
                    >
                      <Input
                        type="password"
                        value={state.confirmPassword}
                        onChange={(e) =>
                          set({ confirmPassword: e.detail.value })
                        }
                        nativeInputAttributes={{ dir: 'ltr' }}
                      />
                    </FormField>
                  </>
                )}
              </SpaceBetween>
            )}
          </SpaceBetween>
        </ExpandableSection>
      </SpaceBetween>
    </Container>
  );
}
