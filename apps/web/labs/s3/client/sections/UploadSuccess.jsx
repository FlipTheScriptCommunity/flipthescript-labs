import React from 'react';
import ContentLayout from '@cloudscape-design/components/content-layout';
import Header from '@cloudscape-design/components/header';
import Alert from '@cloudscape-design/components/alert';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Container from '@cloudscape-design/components/container';
import Box from '@cloudscape-design/components/box';
import ColumnLayout from '@cloudscape-design/components/column-layout';
import Button from '@cloudscape-design/components/button';

export default function UploadSuccess({ result, onClose }) {
  return (
    <ContentLayout header={<Header variant="h1">Upload: status</Header>}>
      <SpaceBetween size="l">
        <Alert type="success" header="Upload succeeded">
          1 object was uploaded to {result.s3Uri}.
        </Alert>

        <Container header={<Header variant="h2">Details</Header>}>
          <ColumnLayout columns={2} variant="text-grid">
            <div>
              <Box variant="awsui-key-label">Key</Box>
              <div>{result.key}</div>
            </div>
            <div>
              <Box variant="awsui-key-label">Size</Box>
              <div>{result.sizeLabel}</div>
            </div>
            <div>
              <Box variant="awsui-key-label">Storage class</Box>
              <div>{result.storageClass}</div>
            </div>
            <div>
              <Box variant="awsui-key-label">Server-side encryption</Box>
              <div>{result.encryptionType}</div>
            </div>
            <div>
              <Box variant="awsui-key-label">Entity tag (ETag)</Box>
              <div>{result.etag}</div>
            </div>
            <div>
              <Box variant="awsui-key-label">S3 URI</Box>
              <div>{result.s3Uri}</div>
            </div>
          </ColumnLayout>
        </Container>

        <Button variant="primary" onClick={onClose}>
          Close
        </Button>
      </SpaceBetween>
    </ContentLayout>
  );
}
