import React from 'react';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import Tiles from '@cloudscape-design/components/tiles';

// Easy create is disabled in this lab, so Standard create is the only
// choice — the tiles are shown so the page matches the real console.
const keepOnlyOption = () => undefined;

export default function CreationMethod() {
  return (
    <Container
      header={<Header variant="h2">Choose a database creation method</Header>}
    >
      <Tiles
        value="standard"
        onChange={keepOnlyOption}
        items={[
          {
            value: 'standard',
            label: 'Standard create',
            description:
              'You set all of the configuration options, including ones for availability, security, backups, and maintenance.',
          },
          {
            value: 'easy',
            label: 'Easy create',
            description:
              'Use recommended best-practice configurations. Some configuration options can be changed after the database is created. (Not used in this lab.)',
            disabled: true,
          },
        ]}
      />
    </Container>
  );
}
