import { useCallback, useEffect, useState } from 'react';
import {
  GetFunctionCommand,
  InvokeCommand,
  UpdateFunctionCodeCommand,
  type FunctionConfiguration,
} from '@aws-sdk/client-lambda';
import { unzipSync, strFromU8 } from 'fflate';
import Alert from '@cloudscape-design/components/alert';
import Box from '@cloudscape-design/components/box';
import Button from '@cloudscape-design/components/button';
import ColumnLayout from '@cloudscape-design/components/column-layout';
import Container from '@cloudscape-design/components/container';
import ContentLayout from '@cloudscape-design/components/content-layout';
import FormField from '@cloudscape-design/components/form-field';
import Header from '@cloudscape-design/components/header';
import SpaceBetween from '@cloudscape-design/components/space-between';
import StatusIndicator from '@cloudscape-design/components/status-indicator';
import { errorMessage, lambda } from '../../lib/aws';
import { useNotifications } from '../../lib/notifications';
import { buildLambdaZip } from '../../lib/zip';
import { CodeEditor } from './CodeEditor';
import {
  CODE_FILE,
  LAMBDA_CODE_PREFIX,
  prettyPayload,
  waitForFunctionReady,
} from './lambda-helpers';

interface InvokeResult {
  status: number | undefined;
  functionError: string | undefined;
  payload: string;
  durationMs: number;
}

// Floci's GetFunction returns a Code.Location URL for downloading the deployed
// zip, like real Lambda does. Showing the deployed code (rather than a blank
// editor) is what lets students edit and redeploy.
async function fetchDeployedCode(
  location: string | undefined,
): Promise<string | null> {
  if (!location) return null;
  try {
    const url = new URL(location);
    // The location points at Floci's own host (e.g. localhost:4566), which the
    // browser can't reach from a Codespace — fetch it through the same-origin
    // proxy path instead.
    const res = await fetch(
      `${LAMBDA_CODE_PREFIX}${url.pathname}${url.search}`,
    );
    if (!res.ok) return null;
    const files = unzipSync(new Uint8Array(await res.arrayBuffer()));
    const source = files[CODE_FILE];
    return source ? strFromU8(source) : null;
  } catch {
    return null;
  }
}

export function FunctionDetailPage({ functionName }: { functionName: string }) {
  const { notify } = useNotifications();
  const [config, setConfig] = useState<FunctionConfiguration | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [code, setCode] = useState<string | null>(null);
  const [deployedCode, setDeployedCode] = useState<string | null>(null);
  const [deploying, setDeploying] = useState(false);
  const [event, setEvent] = useState('{\n  "key1": "value1"\n}');
  const [invoking, setInvoking] = useState(false);
  const [result, setResult] = useState<InvokeResult | null>(null);
  const [invokeError, setInvokeError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await lambda.send(
        new GetFunctionCommand({ FunctionName: functionName }),
      );
      setConfig(res.Configuration ?? null);
      setLoadError(null);
      const source = await fetchDeployedCode(res.Code?.Location);
      setDeployedCode(source);
      setCode((current) => current ?? source ?? '');
    } catch (err) {
      setLoadError(errorMessage(err));
    }
  }, [functionName]);

  useEffect(() => {
    load();
  }, [load]);

  const deploy = async () => {
    if (code === null) return;
    setDeploying(true);
    try {
      await lambda.send(
        new UpdateFunctionCodeCommand({
          FunctionName: functionName,
          ZipFile: buildLambdaZip(CODE_FILE, code),
        }),
      );
      setConfig(await waitForFunctionReady(functionName));
      setDeployedCode(code);
      notify({
        type: 'success',
        content: `Successfully updated the function "${functionName}".`,
      });
    } catch (err) {
      notify({
        type: 'error',
        header: 'Failed to deploy',
        content: errorMessage(err),
      });
    } finally {
      setDeploying(false);
    }
  };

  const invoke = async () => {
    setInvokeError(null);
    let payload: string;
    try {
      payload = JSON.stringify(JSON.parse(event));
    } catch {
      setInvokeError('The event must be valid JSON.');
      return;
    }
    setInvoking(true);
    const started = performance.now();
    try {
      const res = await lambda.send(
        new InvokeCommand({
          FunctionName: functionName,
          Payload: new TextEncoder().encode(payload),
        }),
      );
      setResult({
        status: res.StatusCode,
        functionError: res.FunctionError,
        payload: prettyPayload(res.Payload),
        durationMs: Math.round(performance.now() - started),
      });
    } catch (err) {
      setInvokeError(errorMessage(err));
    } finally {
      setInvoking(false);
    }
  };

  if (loadError) {
    return (
      <ContentLayout header={<Header variant="h1">{functionName}</Header>}>
        <Alert type="error" header="Could not load this function">
          {loadError}
        </Alert>
      </ContentLayout>
    );
  }

  const dirty = code !== null && deployedCode !== null && code !== deployedCode;

  return (
    <ContentLayout header={<Header variant="h1">{functionName}</Header>}>
      <SpaceBetween size="l">
        <div id="function-code">
          <Container
            header={
              <Header
                variant="h2"
                description={`Handler: ${config?.Handler ?? '-'}`}
                actions={
                  <span id="btn-deploy">
                    <Button
                      variant="primary"
                      loading={deploying}
                      disabled={code === null}
                      onClick={deploy}
                    >
                      Deploy
                    </Button>
                  </span>
                }
              >
                Code source — {CODE_FILE}
              </Header>
            }
          >
            <SpaceBetween size="s">
              {dirty && (
                <Alert type="warning">
                  You have changes that aren&apos;t deployed yet. Choose{' '}
                  <b>Deploy</b> before testing — invoking runs the deployed
                  code, not what&apos;s in the editor.
                </Alert>
              )}
              {code === null ? (
                <StatusIndicator type="loading">Loading code</StatusIndicator>
              ) : (
                <CodeEditor value={code} onChange={setCode} />
              )}
            </SpaceBetween>
          </Container>
        </div>

        <div id="function-test">
          <Container
            header={
              <Header
                variant="h2"
                description="Invoke the function with a test event and see what it returns."
                actions={
                  <span id="btn-invoke">
                    <Button loading={invoking} onClick={invoke}>
                      Test
                    </Button>
                  </span>
                }
              >
                Test
              </Header>
            }
          >
            <SpaceBetween size="m">
              <FormField label="Event JSON" errorText={invokeError}>
                <CodeEditor value={event} onChange={setEvent} rows={6} />
              </FormField>
              {result && (
                <div id="invoke-result">
                  <Alert
                    type={result.functionError ? 'error' : 'success'}
                    header={
                      result.functionError
                        ? `Executing function: failed (${result.functionError})`
                        : 'Executing function: succeeded'
                    }
                  >
                    <SpaceBetween size="xs">
                      <Box variant="small">
                        Status code {result.status ?? '-'} · Round trip{' '}
                        {result.durationMs} ms
                      </Box>
                      <Box variant="awsui-key-label">Response</Box>
                      <pre className="object-preview">
                        {result.payload || '(empty)'}
                      </pre>
                    </SpaceBetween>
                  </Alert>
                </div>
              )}
            </SpaceBetween>
          </Container>
        </div>

        <Container header={<Header variant="h2">Configuration</Header>}>
          <ColumnLayout columns={3} variant="text-grid">
            <KeyValue label="Runtime" value={config?.Runtime} />
            <KeyValue label="Handler" value={config?.Handler} />
            <KeyValue
              label="Timeout"
              value={config?.Timeout ? `${config.Timeout} sec` : undefined}
            />
            <KeyValue
              label="Memory"
              value={config?.MemorySize ? `${config.MemorySize} MB` : undefined}
            />
            <KeyValue label="Execution role" value={config?.Role} />
            <KeyValue label="Function ARN" value={config?.FunctionArn} />
          </ColumnLayout>
        </Container>
      </SpaceBetween>
    </ContentLayout>
  );
}

function KeyValue({
  label,
  value,
}: {
  label: string;
  value: string | undefined;
}) {
  return (
    <div>
      <Box variant="awsui-key-label">{label}</Box>
      <div className="break-all">{value ?? '-'}</div>
    </div>
  );
}
