import React from 'react';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Box from '@cloudscape-design/components/box';
import Button from '@cloudscape-design/components/button';
import FormField from '@cloudscape-design/components/form-field';
import Input from '@cloudscape-design/components/input';
import Alert from '@cloudscape-design/components/alert';
import { AMIS, INSTANCE_TYPES } from '../data';

export default function SummaryPanel({ state, setState, onLaunch, launching, error }) {
  const ami = AMIS.find((a) => a.key === state.amiKey) || AMIS[0];
  const instance = INSTANCE_TYPES.find((it) => it.value === state.instanceType) || INSTANCE_TYPES[0];
  const isFreeTier = ami.freeTier && instance.freeTier;
  const hourly = instance.price * state.numberOfInstances;

  return (
    <div className="summary-panel">
      <Container header={<Header variant="h2">Summary</Header>}>
        <SpaceBetween size="l">
          <div>
            <Box variant="awsui-key-label">Software Image (AMI)</Box>
            <div>{ami.name}</div>
            <Box variant="small" color="text-body-secondary">
              {ami.id}
            </Box>
          </div>

          <div>
            <Box variant="awsui-key-label">Virtual server type (instance type)</Box>
            <div>{instance.value}</div>
          </div>

          <div>
            <Box variant="awsui-key-label">Firewall (security group)</Box>
            <div>{state.securityGroupMode === 'create' ? `New security group — ${state.securityGroupName || 'launch-wizard-1'}` : 'Existing security group'}</div>
          </div>

          <div>
            <Box variant="awsui-key-label">Storage (volumes)</Box>
            <div>
              {state.volumes.length} volume(s) — {state.volumes.reduce((sum, v) => sum + (parseInt(v.size, 10) || 0), 0)} GiB
            </div>
          </div>

          <FormField label="Number of instances">
            <Input
              type="number"
              value={String(state.numberOfInstances)}
              onChange={(e) =>
                setState((s) => ({ ...s, numberOfInstances: Math.max(1, parseInt(e.detail.value, 10) || 1) }))
              }
            />
          </FormField>

          {isFreeTier ? (
            <Alert type="success">Free tier eligible: your selections qualify for the AWS Free Tier.</Alert>
          ) : (
            <Box>
              <Box variant="awsui-key-label">Estimated cost</Box>
              <div>${hourly.toFixed(4)} / hour (on-demand, estimated)</div>
            </Box>
          )}

          {error && <Alert type="error">{error}</Alert>}

          <Button variant="primary" fullWidth loading={launching} onClick={onLaunch}>
            Launch instance
          </Button>

          <Box variant="small" color="text-body-secondary">
            By launching an instance, you agree to the AWS Customer Agreement and this mock environment's terms.
          </Box>
        </SpaceBetween>
      </Container>
    </div>
  );
}
