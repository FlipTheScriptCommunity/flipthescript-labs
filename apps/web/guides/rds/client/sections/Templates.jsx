import React from 'react';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import Tiles from '@cloudscape-design/components/tiles';
import { TEMPLATES } from '../data';

export default function Templates({ state, onTemplateChange }) {
  return (
    <Container
      header={
        <Header
          variant="h2"
          description="Choose a sample template to meet your use case."
        >
          Templates
        </Header>
      }
    >
      <Tiles
        value={state.template}
        onChange={(e) => onTemplateChange(e.detail.value)}
        columns={3}
        items={TEMPLATES}
      />
    </Container>
  );
}
