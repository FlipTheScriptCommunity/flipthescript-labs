import React from 'react';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import KeyValuePairs from '@cloudscape-design/components/key-value-pairs';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Box from '@cloudscape-design/components/box';
import Button from '@cloudscape-design/components/button';
import Alert from '@cloudscape-design/components/alert';
import {
  TEMPLATES,
  getEngine,
  getInstanceClass,
  getStorageType,
} from '../data';
import { estimateMonthlyCost, isFreeTierEligible } from '../mockCreateDatabase';

const usd = (n) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

export default function SummaryPanel({ state, onCreate, creating, error }) {
  const engine = getEngine(state.engine);
  const instance = getInstanceClass(state.instanceClass);
  const storageType = getStorageType(state.storageType);
  const template = TEMPLATES.find((t) => t.value === state.template);
  const estimate = estimateMonthlyCost(state);
  const freeTier = isFreeTierEligible(state);

  return (
    <div className="summary-panel">
      <Container header={<Header variant="h2">Summary</Header>}>
        <SpaceBetween size="l">
          <KeyValuePairs
            columns={1}
            items={[
              {
                label: 'Engine',
                value: `${engine.label} ${state.engineVersion}`,
              },
              { label: 'Template', value: template.label },
              {
                label: 'DB instance class',
                value: `${instance.id} (${instance.vcpu} vCPUs, ${instance.memory} GiB RAM)`,
              },
              {
                label: 'Storage',
                value: `${state.allocatedStorage || '—'} GiB, ${storageType.label}`,
              },
              {
                label: 'Deployment',
                value:
                  state.deployment === 'multi-az'
                    ? 'Multi-AZ DB instance (2 instances)'
                    : 'Single-AZ DB instance (1 instance)',
              },
              {
                label: 'Public access',
                value: state.publicAccess === 'yes' ? 'Yes' : 'No',
              },
            ]}
          />

          <div>
            <Box variant="awsui-key-label">Estimated monthly costs</Box>
            <SpaceBetween size="xxxs">
              <div>DB instance: {usd(estimate.instance)}</div>
              <div>Storage: {usd(estimate.storage)}</div>
              <Box fontWeight="bold">Total: {usd(estimate.total)}</Box>
            </SpaceBetween>
            <Box variant="small" color="text-body-secondary">
              A rough estimate for this lab, not a real AWS quote.
              {state.deployment === 'multi-az' &&
                ' Multi-AZ doubles the cost: you pay for the standby too.'}
            </Box>
          </div>

          {freeTier && (
            <Alert type="success">
              This configuration is eligible for the AWS Free Tier.
            </Alert>
          )}

          {error && <Alert type="error">{error}</Alert>}

          <Button
            variant="primary"
            fullWidth
            loading={creating}
            onClick={onCreate}
          >
            Create database
          </Button>
        </SpaceBetween>
      </Container>
    </div>
  );
}
