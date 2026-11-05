import { useState } from 'react';
import { CreateBucketCommand } from '@aws-sdk/client-s3';
import Alert from '@cloudscape-design/components/alert';
import Button from '@cloudscape-design/components/button';
import Checkbox from '@cloudscape-design/components/checkbox';
import Container from '@cloudscape-design/components/container';
import ContentLayout from '@cloudscape-design/components/content-layout';
import Form from '@cloudscape-design/components/form';
import FormField from '@cloudscape-design/components/form-field';
import Header from '@cloudscape-design/components/header';
import Input from '@cloudscape-design/components/input';
import SpaceBetween from '@cloudscape-design/components/space-between';
import { REGION, errorMessage, s3 } from '../../lib/aws';
import { href, navigate } from '../../lib/router';
import { useNotifications } from '../../lib/notifications';
import { validateBucketName } from '../../lib/s3-naming';

export function CreateBucketPage() {
  const { notify } = useNotifications();
  const [name, setName] = useState('');
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validation = validateBucketName(name);

  const submit = async () => {
    setTouched(true);
    if (validation) return;
    setSubmitting(true);
    setError(null);
    try {
      await s3.send(new CreateBucketCommand({ Bucket: name }));
      notify({
        type: 'success',
        content: `Successfully created bucket "${name}".`,
      });
      navigate(href.bucket(name));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ContentLayout header={<Header variant="h1">Create bucket</Header>}>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <Form
          actions={
            <SpaceBetween direction="horizontal" size="xs">
              <Button
                formAction="none"
                variant="link"
                onClick={() => navigate(href.buckets())}
              >
                Cancel
              </Button>
              <span id="btn-create-bucket-submit">
                <Button variant="primary" loading={submitting}>
                  Create bucket
                </Button>
              </span>
            </SpaceBetween>
          }
          errorText={error}
        >
          <SpaceBetween size="l">
            <Container
              header={<Header variant="h2">General configuration</Header>}
            >
              <SpaceBetween size="l">
                <FormField label="AWS Region">
                  <Input value={`US East (N. Virginia) ${REGION}`} readOnly />
                </FormField>
                <div id="field-bucket-name">
                  <FormField
                    label="Bucket name"
                    description="Bucket names must be unique across all AWS accounts in all the AWS Regions within a partition."
                    constraintText="Must be 3-63 characters: lowercase letters, numbers, dots, and hyphens. Must begin and end with a letter or number."
                    errorText={touched ? validation : null}
                  >
                    <Input
                      value={name}
                      placeholder="myawsbucket"
                      onChange={({ detail }) => setName(detail.value)}
                      onBlur={() => setTouched(true)}
                    />
                  </FormField>
                </div>
              </SpaceBetween>
            </Container>
            <div id="section-block-public-access">
              <Container
                header={
                  <Header
                    variant="h2"
                    description="Public access is granted to buckets and objects through access control lists (ACLs), bucket policies, access point policies, or all."
                  >
                    Block Public Access settings for this bucket
                  </Header>
                }
              >
                <SpaceBetween size="s">
                  <Checkbox checked disabled>
                    Block <i>all</i> public access
                  </Checkbox>
                  <Alert type="info">
                    New buckets block all public access by default. Leave this
                    on unless you have a specific reason (such as static website
                    hosting) to make objects public.
                  </Alert>
                </SpaceBetween>
              </Container>
            </div>
          </SpaceBetween>
        </Form>
      </form>
    </ContentLayout>
  );
}
