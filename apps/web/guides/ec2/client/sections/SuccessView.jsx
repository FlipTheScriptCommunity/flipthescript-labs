import React from 'react';
import ContentLayout from '@cloudscape-design/components/content-layout';
import Header from '@cloudscape-design/components/header';
import Alert from '@cloudscape-design/components/alert';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Container from '@cloudscape-design/components/container';
import Box from '@cloudscape-design/components/box';
import Link from '@cloudscape-design/components/link';
import ColumnLayout from '@cloudscape-design/components/column-layout';
import Button from '@cloudscape-design/components/button';

export default function SuccessView({ result, onBack }) {
  return (
    <ContentLayout header={<Header variant="h1">Launch an instance</Header>}>
      <SpaceBetween size="l">
        <Alert type="success" header="Successfully initiated launch of instance">
          The following instance launch{result.instanceIds.length > 1 ? 'es have' : ' has'} been initiated:{' '}
          {result.instanceIds.map((id, i) => (
            <React.Fragment key={id}>
              {i > 0 && ', '}
              <Link href="#" onFollow={(e) => e.preventDefault()}>
                {id}
              </Link>
            </React.Fragment>
          ))}
        </Alert>

        <Container header={<Header variant="h2">Launch log</Header>}>
          <ColumnLayout columns={3} variant="text-grid">
            <div>
              <Box variant="awsui-key-label">Request ID</Box>
              <div>{result.requestId}</div>
            </div>
            <div>
              <Box variant="awsui-key-label">AMI</Box>
              <div>{result.amiName}</div>
            </div>
            <div>
              <Box variant="awsui-key-label">Instance type</Box>
              <div>{result.instanceType}</div>
            </div>
          </ColumnLayout>
        </Container>

        <Container header={<Header variant="h2">Next steps</Header>}>
          <SpaceBetween size="m">
            <Box>
              <Link href="#" onFollow={(e) => e.preventDefault()}>
                Connect to your instance
              </Link>{' '}
              — connect via EC2 Instance Connect, SSH client, or session manager.
            </Box>
            <Box>
              <Link href="#" onFollow={(e) => e.preventDefault()}>
                View all instances
              </Link>{' '}
              — check status and manage your running instances.
            </Box>
            <Box>
              <Link href="#" onFollow={(e) => e.preventDefault()}>
                Create an alarm
              </Link>{' '}
              — monitor CPU, network, and status checks with CloudWatch.
            </Box>
          </SpaceBetween>
        </Container>

        <Button onClick={onBack}>Launch another instance</Button>
      </SpaceBetween>
    </ContentLayout>
  );
}
