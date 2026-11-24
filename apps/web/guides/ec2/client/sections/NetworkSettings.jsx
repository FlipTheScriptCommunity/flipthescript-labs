import React, { useState } from 'react';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import FormField from '@cloudscape-design/components/form-field';
import Select from '@cloudscape-design/components/select';
import RadioGroup from '@cloudscape-design/components/radio-group';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Button from '@cloudscape-design/components/button';
import Box from '@cloudscape-design/components/box';
import ColumnLayout from '@cloudscape-design/components/column-layout';
import Input from '@cloudscape-design/components/input';
import { VPCS, SUBNETS } from '../data';

export default function NetworkSettings({ state, setState }) {
  const [editing, setEditing] = useState(true);
  const vpcOption = VPCS.find((v) => v.value === state.vpc) || null;
  const subnetOption = SUBNETS.find((s) => s.value === state.subnet) || null;

  const summaryText = `${vpcOption ? vpcOption.label : 'default VPC'}, ${state.autoAssignIp === 'enable' ? 'Auto-assign public IP enabled' : 'Auto-assign public IP disabled'}, security group ${state.securityGroupName || 'launch-wizard-1'} (SSH from ${state.sshSource})`;

  return (
    <Container
      header={
        <Header
          variant="h2"
          description="Configure the virtual network, subnet, and firewall (security group) for your instance."
          actions={<Button onClick={() => setEditing((e) => !e)}>{editing ? 'Collapse' : 'Edit'}</Button>}
        >
          Network settings
        </Header>
      }
    >
      {!editing ? (
        <Box color="text-body-secondary">{summaryText}</Box>
      ) : (
        <SpaceBetween size="l">
          <FormField label="VPC — required">
            <Select
              selectedOption={vpcOption}
              onChange={(e) => setState((s) => ({ ...s, vpc: e.detail.selectedOption.value }))}
              options={VPCS}
            />
          </FormField>

          <FormField label="Subnet">
            <Select
              placeholder="No preference (default subnet in any availability zone)"
              selectedOption={subnetOption}
              onChange={(e) => setState((s) => ({ ...s, subnet: e.detail.selectedOption.value }))}
              options={SUBNETS}
            />
          </FormField>

          <FormField label="Auto-assign public IP">
            <RadioGroup
              value={state.autoAssignIp}
              onChange={(e) => setState((s) => ({ ...s, autoAssignIp: e.detail.value }))}
              items={[
                { value: 'enable', label: 'Enable' },
                { value: 'disable', label: 'Disable' },
              ]}
            />
          </FormField>

          <FormField label="Firewall (security groups)">
            <RadioGroup
              value={state.securityGroupMode}
              onChange={(e) => setState((s) => ({ ...s, securityGroupMode: e.detail.value }))}
              items={[
                { value: 'create', label: 'Create security group' },
                { value: 'existing', label: 'Select existing security group' },
              ]}
            />
          </FormField>

          {state.securityGroupMode === 'create' && (
            <SpaceBetween size="m">
              <ColumnLayout columns={2}>
                <FormField label="Security group name">
                  <Input
                    value={state.securityGroupName}
                    onChange={(e) => setState((s) => ({ ...s, securityGroupName: e.detail.value }))}
                    nativeInputAttributes={{ dir: 'auto' }}
                  />
                </FormField>
                <FormField label="Description">
                  <Input
                    value={state.securityGroupDescription}
                    onChange={(e) => setState((s) => ({ ...s, securityGroupDescription: e.detail.value }))}
                    nativeInputAttributes={{ dir: 'auto' }}
                  />
                </FormField>
              </ColumnLayout>

              <Box variant="h4">Inbound security group rules</Box>
              <div className="rule-row">
                <ColumnLayout columns={4}>
                  <div>
                    <Box variant="awsui-key-label">Type</Box>
                    <div>SSH</div>
                  </div>
                  <div>
                    <Box variant="awsui-key-label">Protocol</Box>
                    <div>TCP</div>
                  </div>
                  <div>
                    <Box variant="awsui-key-label">Port range</Box>
                    <div>22</div>
                  </div>
                  <FormField label="Source">
                    <Select
                      selectedOption={{ value: state.sshSource, label: state.sshSource }}
                      onChange={(e) => setState((s) => ({ ...s, sshSource: e.detail.selectedOption.value }))}
                      options={[
                        { value: 'My IP', label: 'My IP' },
                        { value: 'Anywhere (0.0.0.0/0)', label: 'Anywhere (0.0.0.0/0)' },
                        { value: 'Custom', label: 'Custom' },
                      ]}
                    />
                  </FormField>
                </ColumnLayout>
              </div>
              <Button iconName="add-plus">Add security group rule</Button>
            </SpaceBetween>
          )}
        </SpaceBetween>
      )}
    </Container>
  );
}
