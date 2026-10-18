import React from 'react';
import ContentLayout from '@cloudscape-design/components/content-layout';
import Header from '@cloudscape-design/components/header';
import Alert from '@cloudscape-design/components/alert';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Container from '@cloudscape-design/components/container';
import Table from '@cloudscape-design/components/table';
import Box from '@cloudscape-design/components/box';
import Button from '@cloudscape-design/components/button';
import Link from '@cloudscape-design/components/link';
import ColumnLayout from '@cloudscape-design/components/column-layout';

export default function ObjectsList({
  bucket,
  objects,
  onUpload,
  showCreatedBanner,
  onDismissBanner,
}) {
  return (
    <ContentLayout
      header={
        <Header
          variant="h1"
          description={`S3 URI: s3://${bucket.name}`}
          actions={
            <Button
              variant="primary"
              onClick={onUpload}
              id="action-open-upload"
            >
              Upload
            </Button>
          }
        >
          {bucket.name}
        </Header>
      }
    >
      <SpaceBetween size="l">
        {showCreatedBanner && (
          <Alert
            type="success"
            header="Successfully created bucket"
            dismissible
            onDismiss={onDismissBanner}
          >
            <Link href="#" onFollow={(e) => e.preventDefault()}>
              {bucket.name}
            </Link>{' '}
            was created in {bucket.region}.
          </Alert>
        )}

        <Container header={<Header variant="h2">Bucket overview</Header>}>
          <ColumnLayout columns={3} variant="text-grid">
            <div>
              <Box variant="awsui-key-label">AWS Region</Box>
              <div>{bucket.region}</div>
            </div>
            <div>
              <Box variant="awsui-key-label">Bucket versioning</Box>
              <div>
                {bucket.versioning === 'enable' ? 'Enabled' : 'Disabled'}
              </div>
            </div>
            <div>
              <Box variant="awsui-key-label">Default encryption</Box>
              <div>{bucket.encryptionType}</div>
            </div>
          </ColumnLayout>
        </Container>

        <Table
          header={
            <Header variant="h2" counter={`(${objects.length})`}>
              Objects
            </Header>
          }
          columnDefinitions={[
            {
              id: 'key',
              header: 'Key',
              cell: (item) => (
                <Link href="#" onFollow={(e) => e.preventDefault()}>
                  {item.key}
                </Link>
              ),
            },
            {
              id: 'storageClass',
              header: 'Storage class',
              cell: (item) => item.storageClass,
            },
            { id: 'size', header: 'Size', cell: (item) => item.sizeLabel },
            {
              id: 'uploadedAt',
              header: 'Last modified',
              cell: (item) => new Date(item.uploadedAt).toLocaleString(),
            },
          ]}
          items={objects}
          empty={
            <Box textAlign="center" color="inherit">
              <Box variant="strong">This bucket is empty</Box>
              <Box variant="p" color="inherit">
                Objects you upload will be listed here.
              </Box>
              <Button onClick={onUpload}>Upload</Button>
            </Box>
          }
        />
      </SpaceBetween>
    </ContentLayout>
  );
}
