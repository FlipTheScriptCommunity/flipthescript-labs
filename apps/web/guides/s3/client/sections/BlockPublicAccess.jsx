import React from 'react';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Checkbox from '@cloudscape-design/components/checkbox';
import Alert from '@cloudscape-design/components/alert';
import Box from '@cloudscape-design/components/box';
import { BLOCK_PUBLIC_ACCESS_OPTIONS } from '../data';

export default function BlockPublicAccess({ state, setState }) {
  const bpa = state.blockPublicAccess;
  const allBlocked = Object.values(bpa).every(Boolean);
  const anyUnblocked = !allBlocked;

  const setAll = (checked) => {
    setState((s) => ({
      ...s,
      blockPublicAccess: {
        blockNewAcls: checked,
        blockAnyAcls: checked,
        blockNewPolicies: checked,
        blockAnyPolicies: checked,
      },
      publicAccessAcknowledged: checked ? false : s.publicAccessAcknowledged,
    }));
  };

  const setOne = (key, checked) => {
    setState((s) => ({
      ...s,
      blockPublicAccess: { ...s.blockPublicAccess, [key]: checked },
    }));
  };

  return (
    <Container
      header={
        <Header
          variant="h2"
          description="Public access is granted to buckets and objects through access control lists (ACLs), bucket policies, access point policies, or all. In order to ensure that public access to this bucket and its objects is blocked, turn on Block all public access. These settings apply only to this bucket."
        >
          Block Public Access settings for this bucket
        </Header>
      }
    >
      <SpaceBetween size="m">
        <Checkbox
          checked={allBlocked}
          onChange={(e) => setAll(e.detail.checked)}
        >
          <Box fontWeight="bold">Block all public access</Box>
        </Checkbox>
        <Box color="text-body-secondary" fontSize="body-s">
          Turning this off may result in the bucket and the objects within
          becoming public. We recommend leaving all four settings enabled unless
          you know you need to turn off one of them for a specific use case.
        </Box>

        <SpaceBetween size="s">
          {BLOCK_PUBLIC_ACCESS_OPTIONS.map((opt) => (
            <Checkbox
              key={opt.key}
              checked={bpa[opt.key]}
              onChange={(e) => setOne(opt.key, e.detail.checked)}
            >
              {opt.label}
            </Checkbox>
          ))}
        </SpaceBetween>

        {anyUnblocked && (
          <Alert
            type="warning"
            header="You acknowledge that the current settings might result in this bucket and the objects within becoming public."
          >
            <Checkbox
              checked={state.publicAccessAcknowledged}
              onChange={(e) =>
                setState((s) => ({
                  ...s,
                  publicAccessAcknowledged: e.detail.checked,
                }))
              }
            >
              I acknowledge that the current settings might result in this
              bucket and the objects within becoming public.
            </Checkbox>
          </Alert>
        )}
      </SpaceBetween>
    </Container>
  );
}
