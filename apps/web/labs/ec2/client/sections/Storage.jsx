import React from 'react';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import FormField from '@cloudscape-design/components/form-field';
import Select from '@cloudscape-design/components/select';
import Input from '@cloudscape-design/components/input';
import SpaceBetween from '@cloudscape-design/components/space-between';
import ColumnLayout from '@cloudscape-design/components/column-layout';
import Button from '@cloudscape-design/components/button';
import Box from '@cloudscape-design/components/box';
import { VOLUME_TYPES } from '../data';

export default function Storage({ state, setState }) {
  const volumes = state.volumes;

  const updateVolume = (index, field, value) => {
    const next = volumes.slice();
    next[index] = { ...next[index], [field]: value };
    setState((s) => ({ ...s, volumes: next }));
  };

  const addVolume = () => {
    setState((s) => ({
      ...s,
      volumes: [...s.volumes, { device: `/dev/sdb`, size: '8', type: 'gp3', root: false }],
    }));
  };

  const removeVolume = (index) => {
    setState((s) => ({ ...s, volumes: s.volumes.filter((_, i) => i !== index) }));
  };

  return (
    <Container header={<Header variant="h2" description="Configure the root volume and any additional EBS volumes attached to your instance.">Configure storage</Header>}>
      <SpaceBetween size="l">
        {volumes.map((vol, i) => (
          <div key={i} className="volume-row">
            <ColumnLayout columns={5}>
              <div>
                <Box variant="awsui-key-label">Device</Box>
                <div>{vol.device}</div>
              </div>
              <FormField label="Size (GiB)">
                <Input
                  type="number"
                  value={vol.size}
                  onChange={(e) => updateVolume(i, 'size', e.detail.value)}
                />
              </FormField>
              <FormField label="Volume type">
                <Select
                  selectedOption={{ value: vol.type, label: vol.type }}
                  onChange={(e) => updateVolume(i, 'type', e.detail.selectedOption.value)}
                  options={VOLUME_TYPES.map((t) => ({ value: t, label: t }))}
                />
              </FormField>
              <div>
                <Box variant="awsui-key-label">Encrypted</Box>
                <div>Not encrypted</div>
              </div>
              <div>
                {!vol.root && (
                  <Button iconName="remove" variant="icon" ariaLabel="Remove volume" onClick={() => removeVolume(i)} />
                )}
              </div>
            </ColumnLayout>
          </div>
        ))}
        <Box>
          <Button iconName="add-plus" onClick={addVolume}>
            Add new volume
          </Button>
        </Box>
      </SpaceBetween>
    </Container>
  );
}
