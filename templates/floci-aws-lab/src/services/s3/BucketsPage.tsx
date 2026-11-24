import { useCallback, useEffect, useState } from 'react';
import {
  DeleteBucketCommand,
  ListBucketsCommand,
  type Bucket,
} from '@aws-sdk/client-s3';
import Box from '@cloudscape-design/components/box';
import Button from '@cloudscape-design/components/button';
import ContentLayout from '@cloudscape-design/components/content-layout';
import Header from '@cloudscape-design/components/header';
import Link from '@cloudscape-design/components/link';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Table from '@cloudscape-design/components/table';
import { REGION, errorMessage, s3 } from '../../lib/aws';
import { followHandler, href, navigate } from '../../lib/router';
import { useNotifications } from '../../lib/notifications';

export function BucketsPage() {
  const { notify } = useNotifications();
  const [buckets, setBuckets] = useState<Bucket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Bucket[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await s3.send(new ListBucketsCommand({}));
      setBuckets(res.Buckets ?? []);
    } catch (err) {
      notify({
        type: 'error',
        header: 'Failed to list buckets',
        content: errorMessage(err),
      });
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    load();
  }, [load]);

  const deleteSelected = async () => {
    const name = selected[0]?.Name;
    if (!name) return;
    try {
      await s3.send(new DeleteBucketCommand({ Bucket: name }));
      notify({
        type: 'success',
        content: `Successfully deleted bucket "${name}".`,
      });
      setSelected([]);
      load();
    } catch (err) {
      notify({
        type: 'error',
        header: `Failed to delete bucket "${name}"`,
        content: errorMessage(err),
      });
    }
  };

  return (
    <ContentLayout
      header={
        <Header
          variant="h1"
          description="Amazon S3 stores data as objects within buckets."
        >
          Amazon S3
        </Header>
      }
    >
      <div id="s3-buckets-table">
        <Table
          items={buckets}
          loading={loading}
          loadingText="Loading buckets"
          selectionType="single"
          selectedItems={selected}
          onSelectionChange={({ detail }) => setSelected(detail.selectedItems)}
          trackBy="Name"
          variant="full-page"
          header={
            <Header
              variant="awsui-h1-sticky"
              counter={`(${buckets.length})`}
              description="Buckets are containers for data stored in S3."
              actions={
                <SpaceBetween direction="horizontal" size="xs">
                  <Button
                    iconName="refresh"
                    ariaLabel="Refresh"
                    onClick={load}
                  />
                  <Button
                    disabled={selected.length === 0}
                    onClick={deleteSelected}
                  >
                    Delete
                  </Button>
                  <span id="btn-create-bucket">
                    <Button
                      variant="primary"
                      onClick={() => navigate(href.createBucket())}
                    >
                      Create bucket
                    </Button>
                  </span>
                </SpaceBetween>
              }
            >
              General purpose buckets
            </Header>
          }
          columnDefinitions={[
            {
              id: 'name',
              header: 'Name',
              cell: (bucket) => (
                <Link
                  href={href.bucket(bucket.Name ?? '')}
                  onFollow={followHandler}
                >
                  {bucket.Name}
                </Link>
              ),
            },
            {
              id: 'region',
              header: 'AWS Region',
              cell: () => `US East (N. Virginia) ${REGION}`,
            },
            {
              id: 'created',
              header: 'Creation date',
              cell: (bucket) => bucket.CreationDate?.toLocaleString() ?? '-',
            },
          ]}
          empty={
            <Box textAlign="center" color="inherit">
              <SpaceBetween size="m">
                <b>No buckets</b>
                <Box variant="p" color="inherit">
                  You don&apos;t have any buckets.
                </Box>
                <Button onClick={() => navigate(href.createBucket())}>
                  Create bucket
                </Button>
              </SpaceBetween>
            </Box>
          }
        />
      </div>
    </ContentLayout>
  );
}
