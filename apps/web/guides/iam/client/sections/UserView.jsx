import React, { useState } from 'react';
import ContentLayout from '@cloudscape-design/components/content-layout';
import Header from '@cloudscape-design/components/header';
import Container from '@cloudscape-design/components/container';
import KeyValuePairs from '@cloudscape-design/components/key-value-pairs';
import CopyToClipboard from '@cloudscape-design/components/copy-to-clipboard';
import Table from '@cloudscape-design/components/table';
import Button from '@cloudscape-design/components/button';
import Modal from '@cloudscape-design/components/modal';
import Alert from '@cloudscape-design/components/alert';
import Box from '@cloudscape-design/components/box';
import SpaceBetween from '@cloudscape-design/components/space-between';
import PolicyTable from './PolicyTable';
import PolicySimulator from './PolicySimulator';
import { getGroup, getPolicy } from '../data';
import { effectivePolicies } from '../policyEval';

function SignInDetails({ user }) {
  const [revealed, setRevealed] = useState(false);

  if (!user.consoleAccess) {
    return (
      <Container header={<Header variant="h2">Console sign-in details</Header>}>
        <Box color="text-body-secondary">
          Console access is disabled for this user, so they can&apos;t sign in
          to the AWS Management Console. You can still give them programmatic
          access later by creating access keys.
        </Box>
      </Container>
    );
  }

  return (
    <Container
      header={
        <Header
          variant="h2"
          description="Share these details with the user through a secure channel."
        >
          Console sign-in details
        </Header>
      }
    >
      <SpaceBetween size="l">
        <KeyValuePairs
          columns={3}
          items={[
            {
              label: 'Console sign-in URL',
              value: (
                <CopyToClipboard
                  variant="inline"
                  textToCopy={user.signInUrl}
                  copySuccessText="URL copied"
                  copyErrorText="URL failed to copy"
                />
              ),
            },
            { label: 'User name', value: user.userName },
            {
              label: 'Console password',
              value: (
                <SpaceBetween direction="horizontal" size="xs">
                  <span style={{ fontFamily: 'monospace' }} dir="ltr">
                    {revealed ? user.password : '•'.repeat(14)}
                  </span>
                  <Button
                    variant="inline-link"
                    onClick={() => setRevealed((r) => !r)}
                  >
                    {revealed ? 'Hide' : 'Show'}
                  </Button>
                </SpaceBetween>
              ),
            },
          ]}
        />
        <Alert type="warning">
          This is the only time you can view this password. If you lose it, you
          will need to reset the user&apos;s password.
          {user.requireReset &&
            ' The user will be asked to create a new password the first time they sign in.'}
        </Alert>
      </SpaceBetween>
    </Container>
  );
}

function PermissionsPolicies({ user, setUser }) {
  const [selected, setSelected] = useState([]);
  const [adding, setAdding] = useState(false);
  const [toAdd, setToAdd] = useState([]);

  const rows = effectivePolicies(user).map((p, i) => ({
    ...p,
    id: `${p.name}-${p.attachedVia}-${i}`,
    type: getPolicy(p.name)?.type || 'AWS managed',
  }));
  const removable =
    selected.length > 0 && selected.every((r) => r.attachedVia === 'Directly');

  const remove = () => {
    const names = selected.map((r) => r.name);
    setUser((u) => ({
      ...u,
      policies: u.policies.filter((p) => !names.includes(p)),
    }));
    setSelected([]);
  };

  const add = () => {
    setUser((u) => ({ ...u, policies: [...u.policies, ...toAdd] }));
    setToAdd([]);
    setAdding(false);
  };

  return (
    <>
      <Table
        selectionType="multi"
        trackBy="id"
        items={rows}
        selectedItems={selected}
        onSelectionChange={(e) => setSelected(e.detail.selectedItems)}
        ariaLabels={{
          selectionGroupLabel: 'Policy selection',
          itemSelectionLabel: (_, item) => item.name,
          allItemsSelectionLabel: () => 'Select all',
        }}
        header={
          <Header
            variant="h2"
            counter={`(${rows.length})`}
            description="Permissions are defined by policies attached to the user directly or through groups."
            actions={
              <SpaceBetween direction="horizontal" size="xs">
                <Button disabled={!removable} onClick={remove}>
                  Remove
                </Button>
                <Button variant="primary" onClick={() => setAdding(true)}>
                  Add permissions
                </Button>
              </SpaceBetween>
            }
          >
            Permissions policies
          </Header>
        }
        columnDefinitions={[
          { id: 'name', header: 'Policy name', cell: (r) => r.name },
          { id: 'type', header: 'Type', cell: (r) => r.type },
          { id: 'via', header: 'Attached via', cell: (r) => r.attachedVia },
        ]}
        empty={
          <Box textAlign="center" color="inherit">
            No permissions. This user can&apos;t do anything yet.
          </Box>
        }
      />
      {selected.length > 0 && !removable && (
        <Box variant="small" color="text-body-secondary" margin={{ top: 'xs' }}>
          Policies attached through a group can only be removed by removing the
          user from that group, or the policy from the group.
        </Box>
      )}

      <Modal
        visible={adding}
        onDismiss={() => setAdding(false)}
        size="large"
        header="Add permissions — attach policies directly"
        footer={
          <Box float="right">
            <SpaceBetween direction="horizontal" size="xs">
              <Button variant="link" onClick={() => setAdding(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                disabled={toAdd.length === 0}
                onClick={add}
              >
                Add permissions
              </Button>
            </SpaceBetween>
          </Box>
        }
      >
        <PolicyTable
          variant="embedded"
          headerVariant="h3"
          selectedNames={toAdd}
          onChange={setToAdd}
          exclude={user.policies}
        />
      </Modal>
    </>
  );
}

export default function UserView({
  user,
  setUser,
  showBanner,
  onDismissBanner,
  onCreateAnother,
}) {
  return (
    <ContentLayout
      header={
        <Header
          variant="h1"
          actions={
            <Button onClick={onCreateAnother}>Create another user</Button>
          }
        >
          {user.userName}
        </Header>
      }
    >
      <SpaceBetween size="l">
        {showBanner && (
          <Alert
            type="success"
            dismissible
            onDismiss={onDismissBanner}
            header="User created successfully"
          >
            {user.consoleAccess
              ? "You can view the user's console sign-in details below."
              : `${user.userName} was created without console access.`}
          </Alert>
        )}

        <div id="section-sign-in">
          <SignInDetails user={user} />
        </div>

        <Container header={<Header variant="h2">Summary</Header>}>
          <KeyValuePairs
            columns={3}
            items={[
              {
                label: 'ARN',
                value: (
                  <CopyToClipboard
                    variant="inline"
                    textToCopy={user.arn}
                    copySuccessText="ARN copied"
                    copyErrorText="ARN failed to copy"
                  />
                ),
              },
              {
                label: 'Console access',
                value: user.consoleAccess ? 'Enabled without MFA' : 'Disabled',
              },
              { label: 'Access key 1', value: 'Not created' },
              {
                label: 'Created',
                value: new Date(user.createdAt).toUTCString(),
              },
              { label: 'Last console sign-in', value: 'Never' },
              { label: 'User ID', value: user.userId },
            ]}
          />
        </Container>

        <div id="section-user-permissions">
          <PermissionsPolicies user={user} setUser={setUser} />
        </div>

        <Table
          header={
            <Header variant="h2" counter={`(${user.groups.length})`}>
              User groups membership
            </Header>
          }
          items={user.groups.map((name) => getGroup(name))}
          columnDefinitions={[
            { id: 'name', header: 'Group name', cell: (g) => g.name },
            {
              id: 'policies',
              header: 'Attached policies',
              cell: (g) => g.policies.join(', '),
            },
          ]}
          empty={
            <Box textAlign="center" color="inherit">
              This user isn&apos;t a member of any groups.
            </Box>
          }
        />

        {user.tags.length > 0 && (
          <Table
            header={
              <Header variant="h2" counter={`(${user.tags.length})`}>
                Tags
              </Header>
            }
            items={user.tags}
            columnDefinitions={[
              { id: 'key', header: 'Key', cell: (t) => t.key },
              { id: 'value', header: 'Value', cell: (t) => t.value || '—' },
            ]}
          />
        )}

        <div id="section-simulator">
          <PolicySimulator user={user} />
        </div>
      </SpaceBetween>
    </ContentLayout>
  );
}
