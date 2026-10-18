import React from 'react';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Box from '@cloudscape-design/components/box';
import Button from '@cloudscape-design/components/button';
import Alert from '@cloudscape-design/components/alert';
import { REGIONS } from '../data';

export default function SummaryPanel({ state, onCreate, creating, error }) {
  const region = REGIONS.find((r) => r.value === state.region) || REGIONS[0];
  const allBlocked = Object.values(state.blockPublicAccess).every(Boolean);

  return (
    <div className="summary-panel">
      <Container header={<Header variant="h2">Summary</Header>}>
        <SpaceBetween size="l">
          <div>
            <Box variant="awsui-key-label">Bucket name</Box>
            <div>{state.name || '—'}</div>
          </div>

          <div>
            <Box variant="awsui-key-label">AWS Region</Box>
            <div>{region.label}</div>
          </div>

          <div>
            <Box variant="awsui-key-label">Block Public Access</Box>
            <div>
              {allBlocked
                ? 'On — all public access blocked'
                : 'Off — some public access allowed'}
            </div>
          </div>

          <div>
            <Box variant="awsui-key-label">Bucket Versioning</Box>
            <div>{state.versioning === 'enable' ? 'Enabled' : 'Disabled'}</div>
          </div>

          <div>
            <Box variant="awsui-key-label">Default encryption</Box>
            <div>{state.encryptionType}</div>
          </div>

          {error && <Alert type="error">{error}</Alert>}

          <Button
            variant="primary"
            fullWidth
            loading={creating}
            onClick={onCreate}
          >
            Create bucket
          </Button>

          <Box variant="small" color="text-body-secondary">
            By creating a bucket, you agree to the AWS Customer Agreement and
            this mock environment's terms.
          </Box>
        </SpaceBetween>
      </Container>
    </div>
  );
}
