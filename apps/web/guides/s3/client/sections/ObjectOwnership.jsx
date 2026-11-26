import React from 'react';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import RadioGroup from '@cloudscape-design/components/radio-group';
import Box from '@cloudscape-design/components/box';

export default function ObjectOwnership({ state, setState }) {
  return (
    <Container
      header={
        <Header
          variant="h2"
          description="Control ownership of objects written to this bucket and the use of access control lists (ACLs)."
        >
          Object Ownership
        </Header>
      }
    >
      <RadioGroup
        value={state.objectOwnership}
        onChange={(e) =>
          setState((s) => ({ ...s, objectOwnership: e.detail.value }))
        }
        items={[
          {
            value: 'bucket-owner-enforced',
            label: 'ACLs disabled (recommended)',
            description:
              'All objects in this bucket are owned by this account. Access to this bucket and its objects is specified using only policies.',
          },
          {
            value: 'acls-enabled',
            label: 'ACLs enabled',
            description:
              'Objects in this bucket can be owned by other AWS accounts, and access can be specified using ACLs.',
          },
        ]}
      />
      {state.objectOwnership === 'bucket-owner-enforced' && (
        <Box
          margin={{ top: 'm' }}
          color="text-body-secondary"
          fontSize="body-s"
        >
          <Box variant="awsui-key-label" display="inline">
            Bucket owner enforced
          </Box>{' '}
          — ACLs are disabled, and you (the bucket owner) automatically own and
          have full control over every object in the bucket.
        </Box>
      )}
    </Container>
  );
}
