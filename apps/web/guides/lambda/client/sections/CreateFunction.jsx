import React from 'react';
import ContentLayout from '@cloudscape-design/components/content-layout';
import Header from '@cloudscape-design/components/header';
import Container from '@cloudscape-design/components/container';
import Tiles from '@cloudscape-design/components/tiles';
import FormField from '@cloudscape-design/components/form-field';
import Input from '@cloudscape-design/components/input';
import Select from '@cloudscape-design/components/select';
import RadioGroup from '@cloudscape-design/components/radio-group';
import Checkbox from '@cloudscape-design/components/checkbox';
import ExpandableSection from '@cloudscape-design/components/expandable-section';
import Alert from '@cloudscape-design/components/alert';
import Button from '@cloudscape-design/components/button';
import SpaceBetween from '@cloudscape-design/components/space-between';
import { EXISTING_ROLES, RUNTIMES, getRuntime } from '../data';

const runtimeOption = (r) => ({
  value: r.value,
  label: r.label,
  description: r.description,
  disabled: r.disabled,
});

export default function CreateFunction({
  state,
  setState,
  errors,
  error,
  creating,
  onCreate,
  onCancel,
}) {
  const set = (patch) => setState((s) => ({ ...s, ...patch }));

  return (
    <ContentLayout
      header={
        <Header
          variant="h1"
          description="Choose one of the following options to create your function."
        >
          Create function
        </Header>
      }
    >
      <SpaceBetween size="l">
        <div id="section-create-option">
          <Container>
            <Tiles
              value="scratch"
              onChange={() => undefined}
              columns={3}
              items={[
                {
                  value: 'scratch',
                  label: 'Author from scratch',
                  description: 'Start with a simple Hello World example.',
                },
                {
                  value: 'blueprint',
                  label: 'Use a blueprint',
                  description:
                    'Build a Lambda application from sample code and configuration presets for common use cases. (Not available in this lab.)',
                  disabled: true,
                },
                {
                  value: 'container',
                  label: 'Container image',
                  description:
                    'Select a container image to deploy for your function. (Not available in this lab.)',
                  disabled: true,
                },
              ]}
            />
          </Container>
        </div>

        <div id="section-basic-info">
          <Container header={<Header variant="h2">Basic information</Header>}>
            <SpaceBetween size="l">
              <FormField
                label="Function name"
                description="Enter a name that describes the purpose of your function."
                constraintText="Function name must be 1 to 64 characters, must be unique to the Region, and can't include spaces. Valid characters are a-z, A-Z, 0-9, hyphens (-), and underscores (_)."
                errorText={errors.name}
              >
                <Input
                  value={state.name}
                  placeholder="myFunctionName"
                  onChange={(e) => set({ name: e.detail.value })}
                  nativeInputAttributes={{ dir: 'ltr' }}
                />
              </FormField>

              <FormField
                label="Runtime"
                description="Choose the language to use to write your function. Note that the console code editor supports only Node.js, Python, and Ruby."
              >
                <Select
                  selectedOption={runtimeOption(getRuntime(state.runtime))}
                  onChange={(e) =>
                    set({ runtime: e.detail.selectedOption.value })
                  }
                  options={RUNTIMES.map(runtimeOption)}
                />
              </FormField>

              <FormField
                label="Architecture"
                description="Choose the instruction set architecture you want for your function code."
              >
                <RadioGroup
                  value={state.architecture}
                  onChange={(e) => set({ architecture: e.detail.value })}
                  items={[
                    { value: 'x86_64', label: 'x86_64' },
                    { value: 'arm64', label: 'arm64' },
                  ]}
                />
              </FormField>
            </SpaceBetween>
          </Container>
        </div>

        <div id="section-permissions">
          <Container
            header={
              <Header
                variant="h2"
                description="By default, Lambda will create an execution role with permissions to upload logs to Amazon CloudWatch Logs. You can customize this default role later when adding triggers."
              >
                Permissions
              </Header>
            }
          >
            <ExpandableSection headerText="Change default execution role">
              <SpaceBetween size="l">
                <FormField label="Execution role">
                  <RadioGroup
                    value={state.roleMode}
                    onChange={(e) => set({ roleMode: e.detail.value })}
                    items={[
                      {
                        value: 'create',
                        label:
                          'Create a new role with basic Lambda permissions',
                      },
                      {
                        value: 'existing',
                        label: 'Use an existing role',
                      },
                      {
                        value: 'template',
                        label: 'Create a new role from AWS policy templates',
                        description: 'Not available in this lab.',
                        disabled: true,
                      },
                    ]}
                  />
                </FormField>
                {state.roleMode === 'create' ? (
                  <Alert type="info">
                    Lambda will create an execution role named{' '}
                    {state.name || 'myFunctionName'}-role-xxxxxxxx, with
                    permission to upload logs to Amazon CloudWatch Logs.
                  </Alert>
                ) : (
                  <FormField
                    label="Existing role"
                    description="Choose an existing role that you've created to be used with this Lambda function. The role must have permission to upload logs to Amazon CloudWatch Logs."
                  >
                    <Select
                      selectedOption={{
                        value: state.existingRole,
                        label: state.existingRole,
                      }}
                      onChange={(e) =>
                        set({ existingRole: e.detail.selectedOption.value })
                      }
                      options={EXISTING_ROLES.map((r) => ({
                        value: r,
                        label: r,
                      }))}
                    />
                  </FormField>
                )}
              </SpaceBetween>
            </ExpandableSection>
          </Container>
        </div>

        <div id="section-advanced">
          <Container>
            <ExpandableSection
              headerText="Additional configurations"
              headerDescription="Use additional configurations to set up networking, security, and governance for your function. These settings help secure and customize your Lambda function deployment."
            >
              <SpaceBetween size="l">
                <Checkbox
                  checked={state.functionUrl}
                  onChange={(e) => set({ functionUrl: e.detail.checked })}
                  description="Use function URLs to assign HTTP(S) endpoints to your Lambda function."
                >
                  Enable function URL
                </Checkbox>
                {state.functionUrl && (
                  <SpaceBetween size="m">
                    <FormField
                      label="Auth type"
                      description="Choose the auth type for your function URL."
                    >
                      <RadioGroup
                        value={state.functionUrlAuth}
                        onChange={(e) =>
                          set({ functionUrlAuth: e.detail.value })
                        }
                        items={[
                          {
                            value: 'AWS_IAM',
                            label: 'AWS_IAM',
                            description:
                              'Only authenticated IAM users and roles can make requests to your function URL.',
                          },
                          {
                            value: 'NONE',
                            label: 'NONE',
                            description:
                              'Lambda won’t perform IAM authentication on requests to your function URL. The URL endpoint will be public unless you implement your own authorization logic in your function.',
                          },
                        ]}
                      />
                    </FormField>
                    {state.functionUrlAuth === 'NONE' && (
                      <Alert type="warning">
                        Your function URL will be public: anyone with the URL
                        can invoke your function.
                      </Alert>
                    )}
                  </SpaceBetween>
                )}
              </SpaceBetween>
            </ExpandableSection>
          </Container>
        </div>

        {error && <Alert type="error">{error}</Alert>}

        <div id="section-create-button" className="lambda-form-actions">
          <SpaceBetween direction="horizontal" size="xs">
            <Button variant="link" onClick={onCancel}>
              Cancel
            </Button>
            <Button variant="primary" loading={creating} onClick={onCreate}>
              Create function
            </Button>
          </SpaceBetween>
        </div>
      </SpaceBetween>
    </ContentLayout>
  );
}
