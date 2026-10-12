import { useState } from 'react';
import { CreateFunctionCommand } from '@aws-sdk/client-lambda';
import Button from '@cloudscape-design/components/button';
import Container from '@cloudscape-design/components/container';
import ContentLayout from '@cloudscape-design/components/content-layout';
import Form from '@cloudscape-design/components/form';
import FormField from '@cloudscape-design/components/form-field';
import Header from '@cloudscape-design/components/header';
import Input from '@cloudscape-design/components/input';
import Select from '@cloudscape-design/components/select';
import SpaceBetween from '@cloudscape-design/components/space-between';
import { DEFAULT_LAMBDA_ROLE, errorMessage, lambda } from '../../lib/aws';
import { href, navigate } from '../../lib/router';
import { useNotifications } from '../../lib/notifications';
import { buildLambdaZip } from '../../lib/zip';
import { CodeEditor } from './CodeEditor';
import {
  CODE_FILE,
  HANDLER,
  RUNTIMES,
  STARTER_CODE,
  waitForFunctionReady,
} from './lambda-helpers';

const FUNCTION_NAME_PATTERN = /^[a-zA-Z0-9_-]{1,64}$/;

export function CreateFunctionPage() {
  const { notify } = useNotifications();
  const [name, setName] = useState('');
  const [runtime, setRuntime] = useState(RUNTIMES[0]);
  const [code, setCode] = useState(STARTER_CODE);
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nameError = FUNCTION_NAME_PATTERN.test(name)
    ? null
    : 'Function name must be 1 to 64 characters: letters, numbers, hyphens, or underscores.';

  const submit = async () => {
    setTouched(true);
    if (nameError) return;
    setSubmitting(true);
    setError(null);
    try {
      await lambda.send(
        new CreateFunctionCommand({
          FunctionName: name,
          Runtime: runtime.value as 'nodejs22.x',
          Handler: HANDLER,
          Role: DEFAULT_LAMBDA_ROLE,
          Code: { ZipFile: buildLambdaZip(CODE_FILE, code) },
          Timeout: 10,
        }),
      );
      await waitForFunctionReady(name);
      notify({
        type: 'success',
        content: `Successfully created the function "${name}".`,
      });
      navigate(href.fn(name));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ContentLayout header={<Header variant="h1">Create function</Header>}>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <Form
          errorText={error}
          actions={
            <SpaceBetween direction="horizontal" size="xs">
              <Button
                formAction="none"
                variant="link"
                onClick={() => navigate(href.functions())}
              >
                Cancel
              </Button>
              <span id="btn-create-function-submit">
                <Button variant="primary" loading={submitting}>
                  Create function
                </Button>
              </span>
            </SpaceBetween>
          }
        >
          <SpaceBetween size="l">
            <Container
              header={
                <Header
                  variant="h2"
                  description="Author from scratch: start with a simple Hello World example."
                >
                  Basic information
                </Header>
              }
            >
              <SpaceBetween size="l">
                <div id="field-function-name">
                  <FormField
                    label="Function name"
                    description="Enter a name that describes the purpose of your function."
                    errorText={touched ? nameError : null}
                  >
                    <Input
                      value={name}
                      placeholder="myFunctionName"
                      onChange={({ detail }) => setName(detail.value)}
                      onBlur={() => setTouched(true)}
                    />
                  </FormField>
                </div>
                <div id="field-runtime">
                  <FormField
                    label="Runtime"
                    description="Choose the language to use to write your function."
                  >
                    <Select
                      selectedOption={runtime}
                      options={RUNTIMES}
                      onChange={({ detail }) =>
                        setRuntime(
                          RUNTIMES.find(
                            (r) => r.value === detail.selectedOption.value,
                          ) ?? RUNTIMES[0],
                        )
                      }
                    />
                  </FormField>
                </div>
                <div id="field-role">
                  <FormField
                    label="Execution role"
                    description="The IAM role your function assumes when it runs — it decides which AWS resources the code may access."
                  >
                    <Input value={DEFAULT_LAMBDA_ROLE} readOnly />
                  </FormField>
                </div>
              </SpaceBetween>
            </Container>
            <div id="field-function-code">
              <Container
                header={
                  <Header variant="h2" description={`Handler: ${HANDLER}`}>
                    Code source — {CODE_FILE}
                  </Header>
                }
              >
                <CodeEditor value={code} onChange={setCode} />
              </Container>
            </div>
          </SpaceBetween>
        </Form>
      </form>
    </ContentLayout>
  );
}
