import React, { useState } from 'react';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import FormField from '@cloudscape-design/components/form-field';
import Multiselect from '@cloudscape-design/components/multiselect';
import Button from '@cloudscape-design/components/button';
import Table from '@cloudscape-design/components/table';
import StatusIndicator from '@cloudscape-design/components/status-indicator';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Alert from '@cloudscape-design/components/alert';
import Box from '@cloudscape-design/components/box';
import { DEFAULT_SIMULATOR_ACTIONS, SIMULATOR_SERVICES } from '../data';
import { effectivePolicies, simulate } from '../policyEval';

const OPTIONS = SIMULATOR_SERVICES.map(({ service, actions }) => ({
  label: service,
  options: actions.map((action) => ({ value: action, label: action })),
}));
const ALL_OPTIONS = OPTIONS.flatMap((group) => group.options);

const permissionsSignature = (user) =>
  effectivePolicies(user)
    .map((p) => `${p.name}|${p.attachedVia}`)
    .sort()
    .join(',');

export default function PolicySimulator({ user }) {
  const [selected, setSelected] = useState(
    ALL_OPTIONS.filter((o) => DEFAULT_SIMULATOR_ACTIONS.includes(o.value)),
  );
  const [results, setResults] = useState(null);
  const [ranWith, setRanWith] = useState(null);

  const run = () => {
    setResults(
      simulate(
        user,
        selected.map((o) => o.value),
      ),
    );
    setRanWith(permissionsSignature(user));
  };

  const stale = results && ranWith !== permissionsSignature(user);

  return (
    <Container
      header={
        <Header
          variant="h2"
          description="Test whether this user is allowed to perform specific actions. The result is based on every policy that applies to the user — attached directly or through a group."
          actions={
            <Button
              variant="primary"
              onClick={run}
              disabled={selected.length === 0}
            >
              Run simulation
            </Button>
          }
        >
          Policy simulator
        </Header>
      }
    >
      <SpaceBetween size="l">
        <FormField label="Actions" description="Choose the actions to test.">
          <Multiselect
            selectedOptions={selected}
            onChange={(e) => setSelected(e.detail.selectedOptions)}
            options={OPTIONS}
            placeholder="Choose actions"
            filteringType="auto"
            tokenLimit={6}
          />
        </FormField>

        {stale && (
          <Alert type="info">
            This user&apos;s permissions changed since the last run. Run the
            simulation again to see the new results.
          </Alert>
        )}

        {results && (
          <Table
            variant="embedded"
            items={results}
            columnDefinitions={[
              { id: 'action', header: 'Action', cell: (r) => r.action },
              { id: 'resource', header: 'Resource', cell: () => '*' },
              {
                id: 'permission',
                header: 'Permission',
                cell: (r) =>
                  r.decision === 'allowed' ? (
                    <StatusIndicator type="success">allowed</StatusIndicator>
                  ) : (
                    <StatusIndicator type="error">
                      denied (implicitly)
                    </StatusIndicator>
                  ),
              },
              {
                id: 'policy',
                header: 'Matching policy',
                cell: (r) =>
                  r.matchedPolicy
                    ? `${r.matchedPolicy} (${r.attachedVia})`
                    : 'No policy allows this action',
              },
            ]}
            empty={
              <Box textAlign="center" color="inherit">
                Choose at least one action.
              </Box>
            }
          />
        )}
      </SpaceBetween>
    </Container>
  );
}
