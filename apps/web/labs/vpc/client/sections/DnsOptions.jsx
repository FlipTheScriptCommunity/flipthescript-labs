import React from 'react';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import FormField from '@cloudscape-design/components/form-field';
import Toggle from '@cloudscape-design/components/toggle';
import SpaceBetween from '@cloudscape-design/components/space-between';

export default function DnsOptions({ state, setState }) {
  return (
    <Container header={<Header variant="h2">DNS options</Header>}>
      <SpaceBetween size="l">
        <FormField
          label="DNS hostnames"
          description="Assigns a public DNS hostname to instances with a public IP address."
        >
          <Toggle
            checked={state.dnsHostnames}
            onChange={(e) =>
              setState((s) => ({ ...s, dnsHostnames: e.detail.checked }))
            }
          >
            Enable DNS hostnames
          </Toggle>
        </FormField>
        <FormField
          label="DNS resolution"
          description="Lets instances in the VPC resolve hostnames using the Amazon-provided DNS server."
        >
          <Toggle
            checked={state.dnsResolution}
            onChange={(e) =>
              setState((s) => ({ ...s, dnsResolution: e.detail.checked }))
            }
          >
            Enable DNS resolution
          </Toggle>
        </FormField>
      </SpaceBetween>
    </Container>
  );
}
