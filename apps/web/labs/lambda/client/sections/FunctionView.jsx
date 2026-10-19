import React, { useState } from 'react';
import ContentLayout from '@cloudscape-design/components/content-layout';
import Header from '@cloudscape-design/components/header';
import Container from '@cloudscape-design/components/container';
import KeyValuePairs from '@cloudscape-design/components/key-value-pairs';
import CopyToClipboard from '@cloudscape-design/components/copy-to-clipboard';
import Tabs from '@cloudscape-design/components/tabs';
import Alert from '@cloudscape-design/components/alert';
import Button from '@cloudscape-design/components/button';
import FormField from '@cloudscape-design/components/form-field';
import Input from '@cloudscape-design/components/input';
import StatusIndicator from '@cloudscape-design/components/status-indicator';
import Box from '@cloudscape-design/components/box';
import SpaceBetween from '@cloudscape-design/components/space-between';
import CodeEditor from './CodeEditor';
import { DEFAULT_EVENT, MEMORY_LIMITS, TIMEOUT_LIMITS } from '../data';
import { invoke } from '../runtime';

const formatTimeout = (seconds) =>
  seconds >= 60
    ? `${Math.floor(seconds / 60)} min ${seconds % 60} sec`
    : `0 min ${seconds} sec`;

function Overview({ fn }) {
  return (
    <Container header={<Header variant="h2">Function overview</Header>}>
      <SpaceBetween size="l">
        <div className="lambda-diagram">
          <Button iconName="add-plus" disabled>
            Add trigger
          </Button>
          <div className="lambda-diagram-function">
            <div className="lambda-diagram-icon" aria-hidden>
              λ
            </div>
            <div>
              <Box fontWeight="bold">{fn.name}</Box>
              <Box variant="small" color="text-body-secondary">
                Layers (0)
              </Box>
            </div>
          </div>
          <Button iconName="add-plus" disabled>
            Add destination
          </Button>
        </div>
        <KeyValuePairs
          columns={3}
          items={[
            { label: 'Description', value: '—' },
            {
              label: 'Last modified',
              value: new Date(fn.lastModified).toUTCString(),
            },
            {
              label: 'Function ARN',
              value: (
                <CopyToClipboard
                  variant="inline"
                  textToCopy={fn.arn}
                  copySuccessText="ARN copied"
                  copyErrorText="ARN failed to copy"
                />
              ),
            },
            {
              label: 'Function URL',
              value: fn.functionUrl ? (
                <SpaceBetween size="xxxs">
                  <span dir="ltr">{fn.functionUrl.url}</span>
                  <Box variant="small" color="text-body-secondary">
                    Auth type: {fn.functionUrl.authType}
                  </Box>
                </SpaceBetween>
              ) : (
                '—'
              ),
            },
            { label: 'Runtime', value: fn.runtime.label },
            { label: 'Architecture', value: fn.architecture },
          ]}
        />
      </SpaceBetween>
    </Container>
  );
}

function ExecutionResults({ result, ranUndeployed }) {
  if (!result) {
    return (
      <Container header={<Header variant="h2">Execution results</Header>}>
        <Box color="text-body-secondary">
          Choose Test to invoke your function with the test event. The response
          and logs will appear here.
        </Box>
      </Container>
    );
  }
  const succeeded = result.status === 'Succeeded';
  return (
    <Container
      header={
        <Header variant="h2" description={`Request ID: ${result.requestId}`}>
          Execution results
        </Header>
      }
    >
      <SpaceBetween size="l">
        {ranUndeployed && (
          <Alert type="warning">
            You have changes that aren&apos;t deployed. This test ran the last
            deployed version of your code — choose Deploy to test your latest
            changes.
          </Alert>
        )}
        <StatusIndicator type={succeeded ? 'success' : 'error'}>
          Status: {result.status}
        </StatusIndicator>
        <KeyValuePairs
          columns={4}
          items={[
            { label: 'Duration', value: `${result.durationMs.toFixed(2)} ms` },
            { label: 'Billed duration', value: `${result.billedMs} ms` },
            {
              label: 'Resources configured',
              value: `${result.memoryMb} MB`,
            },
            {
              label: 'Max memory used',
              value: `${result.maxMemoryUsedMb} MB${result.initMs !== null ? ` (init ${result.initMs.toFixed(2)} ms)` : ''}`,
            },
          ]}
        />
        <div>
          <Box variant="awsui-key-label">Response</Box>
          <pre className="lambda-logs" dir="ltr">
            {JSON.stringify(result.response, null, 2)}
          </pre>
        </div>
        <div>
          <Box variant="awsui-key-label">Function Logs</Box>
          <pre className="lambda-logs" dir="ltr">
            {result.logs}
          </pre>
        </div>
      </SpaceBetween>
    </Container>
  );
}

function CodeTab({ fn, setFn }) {
  const [draft, setDraft] = useState(fn.code);
  const [deploying, setDeploying] = useState(false);
  const [deployMessage, setDeployMessage] = useState(null);
  const [eventName, setEventName] = useState('MyEventName');
  const [eventJson, setEventJson] = useState(DEFAULT_EVENT);
  const [eventError, setEventError] = useState(null);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [ranUndeployed, setRanUndeployed] = useState(false);
  // The first invoke after creating or deploying is a cold start: Lambda
  // has to load the code first, which shows up as "Init Duration".
  const [coldStart, setColdStart] = useState(true);

  const dirty = draft !== fn.code;

  const deploy = () => {
    setDeploying(true);
    setDeployMessage(null);
    setTimeout(() => {
      setFn((f) => ({
        ...f,
        code: draft,
        lastModified: new Date().toISOString(),
      }));
      setColdStart(true);
      setDeploying(false);
      setDeployMessage(`Successfully updated the function ${fn.name}.`);
    }, 700);
  };

  const runTest = async () => {
    let event;
    try {
      event = JSON.parse(eventJson);
    } catch {
      setEventError(
        'There is an error in your JSON event. Correct it before testing.',
      );
      return;
    }
    setEventError(null);
    setRunning(true);
    const outcome = await invoke({ code: fn.code, event, fn, coldStart });
    setColdStart(false);
    setRanUndeployed(dirty);
    setResult(outcome);
    setRunning(false);
  };

  return (
    <SpaceBetween size="l">
      <div id="section-code">
        <Container
          header={
            <Header
              variant="h2"
              description="Edit your function's code. Changes take effect only after you deploy them."
              actions={
                <div id="section-deploy">
                  <SpaceBetween direction="horizontal" size="xs">
                    <Button
                      onClick={deploy}
                      loading={deploying}
                      disabled={!dirty}
                    >
                      Deploy
                    </Button>
                    <Button
                      variant="primary"
                      onClick={runTest}
                      loading={running}
                    >
                      Test
                    </Button>
                  </SpaceBetween>
                </div>
              }
            >
              Code source
            </Header>
          }
        >
          <SpaceBetween size="m">
            {dirty ? (
              <StatusIndicator type="warning">
                Changes not deployed
              </StatusIndicator>
            ) : (
              deployMessage && (
                <StatusIndicator type="success">
                  {deployMessage}
                </StatusIndicator>
              )
            )}
            <CodeEditor
              value={draft}
              onChange={setDraft}
              fileName="index.mjs"
              ariaLabel="Function code"
            />
          </SpaceBetween>
        </Container>
      </div>

      <div id="section-test-event">
        <Container
          header={
            <Header
              variant="h2"
              description="A test event is the JSON input your function receives as the event parameter."
            >
              Test event
            </Header>
          }
        >
          <SpaceBetween size="m">
            <FormField label="Event name">
              <Input
                value={eventName}
                onChange={(e) => setEventName(e.detail.value)}
                nativeInputAttributes={{ dir: 'ltr' }}
              />
            </FormField>
            <FormField label="Event JSON" errorText={eventError}>
              <CodeEditor
                value={eventJson}
                onChange={setEventJson}
                ariaLabel="Event JSON"
                small
              />
            </FormField>
          </SpaceBetween>
        </Container>
      </div>

      <div id="section-results">
        <ExecutionResults result={result} ranUndeployed={ranUndeployed} />
      </div>
    </SpaceBetween>
  );
}

function ConfigurationTab({ fn, setFn }) {
  const [editing, setEditing] = useState(false);
  const [memory, setMemory] = useState(String(fn.memory));
  const [timeout, setTimeoutValue] = useState(String(fn.timeout));
  const [errors, setErrors] = useState({});

  const save = () => {
    const m = Number(memory);
    const t = Number(timeout);
    const next = {};
    if (
      !Number.isInteger(m) ||
      m < MEMORY_LIMITS.min ||
      m > MEMORY_LIMITS.max
    ) {
      next.memory = `Memory must be between ${MEMORY_LIMITS.min} MB and ${MEMORY_LIMITS.max} MB.`;
    }
    if (
      !Number.isInteger(t) ||
      t < TIMEOUT_LIMITS.min ||
      t > TIMEOUT_LIMITS.max
    ) {
      next.timeout = `Timeout must be between ${TIMEOUT_LIMITS.min} second and 15 minutes (${TIMEOUT_LIMITS.max} seconds).`;
    }
    setErrors(next);
    if (Object.keys(next).length) return;
    setFn((f) => ({
      ...f,
      memory: m,
      timeout: t,
      lastModified: new Date().toISOString(),
    }));
    setEditing(false);
  };

  return (
    <SpaceBetween size="l">
      <Container
        header={
          <Header
            variant="h2"
            actions={
              !editing && <Button onClick={() => setEditing(true)}>Edit</Button>
            }
          >
            General configuration
          </Header>
        }
      >
        {editing ? (
          <SpaceBetween size="l">
            <FormField
              label="Memory"
              description="Your function is allocated CPU proportional to the memory configured."
              constraintText="Set memory to between 128 MB and 10240 MB."
              errorText={errors.memory}
            >
              <Input
                type="number"
                value={memory}
                onChange={(e) => setMemory(e.detail.value)}
              />
            </FormField>
            <FormField
              label="Timeout (seconds)"
              description="The maximum time your function can run per invocation."
              constraintText="Set timeout to between 1 second and 900 seconds (15 minutes)."
              errorText={errors.timeout}
            >
              <Input
                type="number"
                value={timeout}
                onChange={(e) => setTimeoutValue(e.detail.value)}
              />
            </FormField>
            <SpaceBetween direction="horizontal" size="xs">
              <Button variant="link" onClick={() => setEditing(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={save}>
                Save
              </Button>
            </SpaceBetween>
          </SpaceBetween>
        ) : (
          <KeyValuePairs
            columns={3}
            items={[
              { label: 'Description', value: '—' },
              { label: 'Memory', value: `${fn.memory} MB` },
              {
                label: 'Ephemeral storage',
                value: `${fn.ephemeralStorage} MB`,
              },
              { label: 'Timeout', value: formatTimeout(fn.timeout) },
              { label: 'SnapStart', value: 'None' },
              { label: 'Handler', value: fn.handler },
            ]}
          />
        )}
      </Container>

      <Container header={<Header variant="h2">Execution role</Header>}>
        <KeyValuePairs
          columns={2}
          items={[
            {
              label: 'Role name',
              value: fn.roleName.replace('service-role/', ''),
            },
            { label: 'Role ARN', value: fn.roleArn },
            {
              label: 'Resource summary',
              value: `Amazon CloudWatch Logs: ${fn.logGroup}`,
            },
          ]}
        />
      </Container>
    </SpaceBetween>
  );
}

export default function FunctionView({ fn, setFn, onCreateAnother }) {
  const [bannerVisible, setBannerVisible] = useState(true);
  const [activeTab, setActiveTab] = useState('code');

  return (
    <ContentLayout
      header={
        <Header
          variant="h1"
          actions={
            <Button onClick={onCreateAnother}>Create another function</Button>
          }
        >
          {fn.name}
        </Header>
      }
    >
      <SpaceBetween size="l">
        {bannerVisible && (
          <Alert
            type="success"
            dismissible
            onDismiss={() => setBannerVisible(false)}
          >
            Successfully created the function {fn.name}. You can now change its
            code and configuration. To invoke your function with a test event,
            choose &quot;Test&quot;.
          </Alert>
        )}

        <div id="section-overview">
          <Overview fn={fn} />
        </div>

        <div>
          <Tabs
            activeTabId={activeTab}
            onChange={(e) => setActiveTab(e.detail.activeTabId)}
            tabs={[
              { id: 'code', label: 'Code' },
              { id: 'configuration', label: 'Configuration' },
            ]}
          />
          {/* Both panels stay mounted (just hidden), so unsaved code, the
              test event and the last results survive switching tabs. */}
          <div hidden={activeTab !== 'code'}>
            <CodeTab fn={fn} setFn={setFn} />
          </div>
          <div hidden={activeTab !== 'configuration'}>
            <ConfigurationTab fn={fn} setFn={setFn} />
          </div>
        </div>
      </SpaceBetween>
    </ContentLayout>
  );
}
