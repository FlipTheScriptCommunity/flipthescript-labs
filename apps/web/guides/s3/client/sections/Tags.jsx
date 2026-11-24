import React from 'react';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import FormField from '@cloudscape-design/components/form-field';
import Input from '@cloudscape-design/components/input';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Button from '@cloudscape-design/components/button';
import Box from '@cloudscape-design/components/box';

export default function Tags({ state, setState }) {
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
    <Container
      header={
        <Header
          variant="h2"
          description="You can use bucket tags to track storage costs and organize buckets by project or department."
        >
          Tags — optional
        </Header>
      }
    >
      <FormField label="Tags">
        <SpaceBetween size="xs">
          {tags.map((tag, i) => (
            <SpaceBetween
              key={i}
              direction="horizontal"
              size="xs"
              alignItems="center"
            >
              <Input
                placeholder="Key"
                value={tag.key}
                onChange={(e) => updateTag(i, 'key', e.detail.value)}
              />
              <Input
                placeholder="Value"
                value={tag.value}
                onChange={(e) => updateTag(i, 'value', e.detail.value)}
              />
              <Button
                iconName="close"
                variant="icon"
                onClick={() => removeTag(i)}
                ariaLabel="Remove tag"
              />
            </SpaceBetween>
          ))}
          <Box>
            <Button iconName="add-plus" onClick={addTag}>
              Add tag
            </Button>
          </Box>
        </SpaceBetween>
      </FormField>
    </Container>
  );
}
