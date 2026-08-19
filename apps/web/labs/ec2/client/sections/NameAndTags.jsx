import React from 'react';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import FormField from '@cloudscape-design/components/form-field';
import Input from '@cloudscape-design/components/input';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Button from '@cloudscape-design/components/button';
import Box from '@cloudscape-design/components/box';

export default function NameAndTags({ state, setState }) {
  const tags = state.tags;

  const updateTag = (index, field, value) => {
    const next = tags.slice();
    next[index] = { ...next[index], [field]: value };
    setState((s) => ({ ...s, tags: next }));
  };

  const addTag = () => {
    setState((s) => ({ ...s, tags: [...s.tags, { key: '', value: '' }] }));
  };

  const removeTag = (index) => {
    setState((s) => ({ ...s, tags: s.tags.filter((_, i) => i !== index) }));
  };

  return (
    <Container header={<Header variant="h2">Name and tags</Header>}>
      <SpaceBetween size="l">
        <FormField
          label="Name"
          description="This will be shown as the Name tag of the instance and any attached storage."
        >
          <Input
            value={state.name}
            placeholder="My-instance"
            onChange={(e) => setState((s) => ({ ...s, name: e.detail.value }))}
          />
        </FormField>

        <FormField label="Additional tags" description="Optional key/value pairs to help identify and organize this resource.">
          <SpaceBetween size="xs">
            {tags.map((tag, i) => (
              <SpaceBetween key={i} direction="horizontal" size="xs" alignItems="center">
                <Input placeholder="Key" value={tag.key} onChange={(e) => updateTag(i, 'key', e.detail.value)} />
                <Input placeholder="Value" value={tag.value} onChange={(e) => updateTag(i, 'value', e.detail.value)} />
                <Button iconName="close" variant="icon" onClick={() => removeTag(i)} ariaLabel="Remove tag" />
              </SpaceBetween>
            ))}
            <Box>
              <Button iconName="add-plus" onClick={addTag}>
                Add new tag
              </Button>
            </Box>
          </SpaceBetween>
        </FormField>
      </SpaceBetween>
    </Container>
  );
}
