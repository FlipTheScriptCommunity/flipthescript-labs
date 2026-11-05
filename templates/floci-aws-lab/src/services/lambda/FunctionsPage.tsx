import { useCallback, useEffect, useState } from 'react';
import {
  DeleteFunctionCommand,
  ListFunctionsCommand,
  type FunctionConfiguration,
} from '@aws-sdk/client-lambda';
import Box from '@cloudscape-design/components/box';
import Button from '@cloudscape-design/components/button';
import ContentLayout from '@cloudscape-design/components/content-layout';
import Header from '@cloudscape-design/components/header';
import Link from '@cloudscape-design/components/link';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Table from '@cloudscape-design/components/table';
import { errorMessage, lambda } from '../../lib/aws';
import { followHandler, href, navigate } from '../../lib/router';
import { useNotifications } from '../../lib/notifications';

export function FunctionsPage() {
  const { notify } = useNotifications();
  const [functions, setFunctions] = useState<FunctionConfiguration[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<FunctionConfiguration[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await lambda.send(new ListFunctionsCommand({}));
      setFunctions(res.Functions ?? []);
    } catch (err) {
      notify({
        type: 'error',
        header: 'Failed to list functions',
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
    const name = selected[0]?.FunctionName;
    if (!name) return;
    try {
      await lambda.send(new DeleteFunctionCommand({ FunctionName: name }));
      notify({
        type: 'success',
        content: `Successfully deleted function "${name}".`,
      });
      setSelected([]);
      load();
    } catch (err) {
      notify({
        type: 'error',
        header: `Failed to delete function "${name}"`,
        content: errorMessage(err),
      });
    }
  };

  const createButton = (
    <Button variant="primary" onClick={() => navigate(href.createFunction())}>
      Create function
    </Button>
  );

  return (
    <ContentLayout
      header={
        <Header
          variant="h1"
          description="Run code without provisioning or managing servers."
        >
          AWS Lambda
        </Header>
      }
    >
      <div id="lambda-functions-table">
        <Table
          items={functions}
          loading={loading}
          loadingText="Loading functions"
          selectionType="single"
          selectedItems={selected}
          onSelectionChange={({ detail }) => setSelected(detail.selectedItems)}
          trackBy="FunctionName"
          variant="full-page"
          header={
            <Header
              variant="awsui-h1-sticky"
              counter={`(${functions.length})`}
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
                  <span id="btn-create-function">{createButton}</span>
                </SpaceBetween>
              }
            >
              Functions
            </Header>
          }
          columnDefinitions={[
            {
              id: 'name',
              header: 'Function name',
              cell: (fn) => (
                <Link
                  href={href.fn(fn.FunctionName ?? '')}
                  onFollow={followHandler}
                >
                  {fn.FunctionName}
                </Link>
              ),
            },
            {
              id: 'runtime',
              header: 'Runtime',
              cell: (fn) => fn.Runtime ?? '-',
            },
            {
              id: 'modified',
              header: 'Last modified',
              cell: (fn) =>
                fn.LastModified
                  ? new Date(fn.LastModified).toLocaleString()
                  : '-',
            },
          ]}
          empty={
            <Box textAlign="center" color="inherit">
              <SpaceBetween size="m">
                <b>No functions</b>
                <Box variant="p" color="inherit">
                  You don&apos;t have any functions.
                </Box>
                {createButton}
              </SpaceBetween>
            </Box>
          }
        />
      </div>
    </ContentLayout>
  );
}
