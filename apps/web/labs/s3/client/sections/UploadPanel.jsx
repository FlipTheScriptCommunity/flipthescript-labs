import React from 'react';
import ContentLayout from '@cloudscape-design/components/content-layout';
import Header from '@cloudscape-design/components/header';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Container from '@cloudscape-design/components/container';
import FormField from '@cloudscape-design/components/form-field';
import FileUpload from '@cloudscape-design/components/file-upload';
import Input from '@cloudscape-design/components/input';
import Select from '@cloudscape-design/components/select';
import Button from '@cloudscape-design/components/button';
import Box from '@cloudscape-design/components/box';
import Alert from '@cloudscape-design/components/alert';
import { STORAGE_CLASSES } from '../data';

export default function UploadPanel({
  bucket,
  upload,
  setUpload,
  onSubmit,
  uploading,
  error,
  onCancel,
}) {
  const storageClassOption =
    STORAGE_CLASSES.find((c) => c.value === upload.storageClass) ||
    STORAGE_CLASSES[0];

  return (
    <ContentLayout
      header={
        <Header
          variant="h1"
          description={`s3://${bucket.name}/${upload.prefix || ''}`}
        >
          Upload to {bucket.name}
        </Header>
      }
    >
      <SpaceBetween size="l">
        <Container
          header={
            <Header
              variant="h2"
              description="Drag and drop a file, or choose a file to add it to this bucket."
            >
              Select file
            </Header>
          }
        >
          <div id="section-upload-file">
            <FormField>
              <FileUpload
                value={upload.file ? [upload.file] : []}
                onChange={(e) =>
                  setUpload((u) => ({ ...u, file: e.detail.value[0] || null }))
                }
                i18nStrings={{
                  uploadButtonText: () => 'Choose file',
                  dropzoneText: () => 'Drop file to upload',
                  removeFileAriaLabel: () => 'Remove file',
                }}
                showFileLastModified
                showFileSize
                tokenLimit={1}
                constraintText="Any file type. This is a simulated upload — nothing is actually transmitted."
              />
            </FormField>
          </div>
        </Container>

        <Container header={<Header variant="h2">Destination</Header>}>
          <div id="section-upload-destination">
            <FormField
              label="Key prefix"
              description="Optional folder-style path within the bucket."
            >
              <Input
                value={upload.prefix}
                placeholder="uploads/"
                onChange={(e) =>
                  setUpload((u) => ({ ...u, prefix: e.detail.value }))
                }
                nativeInputAttributes={{ dir: 'ltr' }}
              />
            </FormField>
          </div>
        </Container>

        <Container header={<Header variant="h2">Storage class</Header>}>
          <div id="section-upload-storage-class">
            <FormField
              label="Storage class"
              description={storageClassOption.description}
            >
              <Select
                selectedOption={storageClassOption}
                onChange={(e) =>
                  setUpload((u) => ({
                    ...u,
                    storageClass: e.detail.selectedOption.value,
                  }))
                }
                options={STORAGE_CLASSES}
              />
            </FormField>
          </div>
        </Container>

        {error && <Alert type="error">{error}</Alert>}

        <Box id="section-upload-submit">
          <SpaceBetween direction="horizontal" size="xs">
            <Button variant="primary" loading={uploading} onClick={onSubmit}>
              Upload
            </Button>
            <Button onClick={onCancel}>Cancel</Button>
          </SpaceBetween>
        </Box>
      </SpaceBetween>
    </ContentLayout>
  );
}
