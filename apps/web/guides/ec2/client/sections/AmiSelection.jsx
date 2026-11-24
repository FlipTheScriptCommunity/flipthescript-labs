import React from 'react';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import SpaceBetween from '@cloudscape-design/components/space-between';
import ColumnLayout from '@cloudscape-design/components/column-layout';
import Box from '@cloudscape-design/components/box';
import Badge from '@cloudscape-design/components/badge';
import { AMIS } from '../data';

function AmiTile({ ami, selected, onSelect }) {
  return (
    <div
      role="radio"
      aria-checked={selected}
      tabIndex={0}
      onClick={() => onSelect(ami.key)}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect(ami.key)}
      className={`ami-tile${selected ? ' ami-tile-selected' : ''}`}
    >
      <div className="ami-tile-logo" style={{ backgroundColor: ami.badgeColor }}>
        {ami.initials}
      </div>
      <div className="ami-tile-body">
        <Box fontWeight="bold">{ami.name}</Box>
        {ami.freeTier && (
          <Box>
            <Badge color="green">Free tier eligible</Badge>
          </Box>
        )}
      </div>
    </div>
  );
}

export default function AmiSelection({ state, setState }) {
  const selected = AMIS.find((a) => a.key === state.amiKey) || AMIS[0];

  return (
    <Container
      header={
        <Header variant="h2" description="An AMI is a template that contains the software configuration required to launch your instance.">
          Application and OS Images (Amazon Machine Image)
        </Header>
      }
    >
      <SpaceBetween size="l">
        <Box variant="h4">Quick Start</Box>
        <div className="ami-tile-grid">
          {AMIS.map((ami) => (
            <AmiTile key={ami.key} ami={ami} selected={ami.key === state.amiKey} onSelect={(key) => setState((s) => ({ ...s, amiKey: key }))} />
          ))}
        </div>

        <Box variant="hr" />

        <div className="ami-summary">
          <ColumnLayout columns={3} variant="text-grid">
            <div>
              <Box variant="awsui-key-label">AMI ID</Box>
              <div>{selected.id}</div>
            </div>
            <div>
              <Box variant="awsui-key-label">AMI name</Box>
              <div>{selected.detail}</div>
            </div>
            <div>
              <Box variant="awsui-key-label">Architecture</Box>
              <div>64-bit (x86)</div>
            </div>
          </ColumnLayout>
          {selected.freeTier && (
            <Box margin={{ top: 's' }} color="text-status-success">
              Free tier eligible: This AMI is free tier eligible when used with a compatible instance type.
            </Box>
          )}
        </div>
      </SpaceBetween>
    </Container>
  );
}
