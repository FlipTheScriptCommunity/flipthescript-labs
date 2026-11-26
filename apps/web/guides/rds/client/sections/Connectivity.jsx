import React from 'react';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import FormField from '@cloudscape-design/components/form-field';
import Input from '@cloudscape-design/components/input';
import Select from '@cloudscape-design/components/select';
import RadioGroup from '@cloudscape-design/components/radio-group';
import SpaceBetween from '@cloudscape-design/components/space-between';
import ExpandableSection from '@cloudscape-design/components/expandable-section';
import {
  AZS,
  DEFAULT_SECURITY_GROUP,
  DEFAULT_SUBNET_GROUP,
  DEFAULT_VPC,
} from '../data';

// This mock account has exactly one option here, so there's nothing to
// switch to — the control is shown so the page matches the real console.
const keepOnlyOption = () => undefined;

export default function Connectivity({ state, setState, errors }) {
  const set = (patch) => setState((s) => ({ ...s, ...patch }));
  const azOptions = [
    { value: 'none', label: 'No preference' },
    ...AZS.map((az) => ({ value: az, label: az })),
  ];
  const multiAz = state.deployment === 'multi-az';

  return (
    <Container header={<Header variant="h2">Connectivity</Header>}>
      <SpaceBetween size="l">
        <FormField
          label="Virtual private cloud (VPC)"
          description="Choose the VPC. The VPC defines the virtual networking environment for this DB instance."
          constraintText="After a database is created, you can't change its VPC."
        >
          <Select
            selectedOption={{ value: DEFAULT_VPC.id, label: DEFAULT_VPC.label }}
            onChange={keepOnlyOption}
            options={[{ value: DEFAULT_VPC.id, label: DEFAULT_VPC.label }]}
          />
        </FormField>

        <FormField
          label="DB subnet group"
          description="Choose the DB subnet group. The DB subnet group defines which subnets and IP ranges the DB instance can use in the VPC that you selected."
        >
          <Select
            selectedOption={{
              value: DEFAULT_SUBNET_GROUP,
              label: DEFAULT_SUBNET_GROUP,
            }}
            onChange={keepOnlyOption}
            options={[
              { value: DEFAULT_SUBNET_GROUP, label: DEFAULT_SUBNET_GROUP },
            ]}
          />
        </FormField>

        <FormField label="Public access">
          <RadioGroup
            value={state.publicAccess}
            onChange={(e) => set({ publicAccess: e.detail.value })}
            items={[
              {
                value: 'yes',
                label: 'Yes',
                description:
                  'RDS assigns a public IP address to the database. Amazon EC2 instances and other resources outside of the VPC can connect to your database. Resources inside the VPC can also connect to the database. Choose one or more VPC security groups that specify which resources can connect to the database.',
              },
              {
                value: 'no',
                label: 'No',
                description:
                  "RDS doesn't assign a public IP address to the database. Only Amazon EC2 instances and other resources inside the VPC can connect to your database. Choose one or more VPC security groups that specify which resources can connect to the database.",
              },
            ]}
          />
        </FormField>

        <FormField
          label="VPC security group (firewall)"
          description="Choose one or more VPC security groups to allow access to your database. Make sure that the security group rules allow the appropriate incoming traffic."
        >
          <RadioGroup
            value={state.securityGroupMode}
            onChange={(e) => set({ securityGroupMode: e.detail.value })}
            items={[
              { value: 'existing', label: 'Choose existing' },
              { value: 'create', label: 'Create new' },
            ]}
          />
        </FormField>

        {state.securityGroupMode === 'existing' ? (
          <FormField label="Existing VPC security groups">
            <Select
              selectedOption={{
                value: DEFAULT_SECURITY_GROUP.id,
                label: DEFAULT_SECURITY_GROUP.name,
              }}
              onChange={keepOnlyOption}
              options={[
                {
                  value: DEFAULT_SECURITY_GROUP.id,
                  label: DEFAULT_SECURITY_GROUP.name,
                },
              ]}
            />
          </FormField>
        ) : (
          <FormField
            label="New VPC security group name"
            errorText={errors.securityGroupName}
          >
            <Input
              value={state.securityGroupName}
              onChange={(e) => set({ securityGroupName: e.detail.value })}
              nativeInputAttributes={{ dir: 'ltr' }}
            />
          </FormField>
        )}

        <FormField
          label="Availability Zone"
          description={
            multiAz
              ? 'With a Multi-AZ deployment, RDS places the primary and the standby in different Availability Zones for you.'
              : undefined
          }
        >
          <Select
            disabled={multiAz}
            selectedOption={azOptions.find(
              (o) => o.value === state.availabilityZone,
            )}
            onChange={(e) =>
              set({ availabilityZone: e.detail.selectedOption.value })
            }
            options={azOptions}
          />
        </FormField>

        <ExpandableSection headerText="Additional configuration">
          <FormField
            label="Database port"
            description="TCP/IP port that the database will use for application connections."
          >
            <Input
              type="number"
              value={state.port}
              onChange={(e) => set({ port: e.detail.value })}
            />
          </FormField>
        </ExpandableSection>
      </SpaceBetween>
    </Container>
  );
}
