import React from 'react';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import Tiles from '@cloudscape-design/components/tiles';
import Table from '@cloudscape-design/components/table';
import Box from '@cloudscape-design/components/box';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Alert from '@cloudscape-design/components/alert';
import PolicyTable from './PolicyTable';
import { EXISTING_USERS, USER_GROUPS } from '../data';

const usersInGroup = (groupName) =>
  EXISTING_USERS.filter((u) => u.groups.includes(groupName)).length;

function GroupsTable({ state, setState }) {
  return (
    <Table
      selectionType="multi"
      trackBy="name"
      items={USER_GROUPS}
      selectedItems={USER_GROUPS.filter((g) =>
        state.selectedGroups.includes(g.name),
      )}
      onSelectionChange={(e) =>
        setState((s) => ({
          ...s,
          selectedGroups: e.detail.selectedItems.map((g) => g.name),
        }))
      }
      ariaLabels={{
        selectionGroupLabel: 'Group selection',
        itemSelectionLabel: (_, item) => item.name,
        allItemsSelectionLabel: () => 'Select all',
      }}
      header={
        <Header
          variant="h2"
          counter={`(${USER_GROUPS.length})`}
          description="Choose one or more groups to add your user to."
        >
          User groups
        </Header>
      }
      columnDefinitions={[
        { id: 'name', header: 'Group name', cell: (g) => g.name },
        { id: 'users', header: 'Users', cell: (g) => usersInGroup(g.name) },
        {
          id: 'policies',
          header: 'Attached policies',
          cell: (g) => g.policies.join(', '),
        },
        { id: 'created', header: 'Created', cell: (g) => g.created },
      ]}
    />
  );
}

function CopyFromUserTable({ state, setState }) {
  const selected = EXISTING_USERS.filter((u) => u.name === state.copyFrom);
  return (
    <Table
      selectionType="single"
      trackBy="name"
      items={EXISTING_USERS}
      selectedItems={selected}
      onSelectionChange={(e) =>
        setState((s) => ({
          ...s,
          copyFrom: e.detail.selectedItems[0]?.name || null,
        }))
      }
      ariaLabels={{
        selectionGroupLabel: 'User selection',
        itemSelectionLabel: (_, item) => item.name,
      }}
      header={
        <Header
          variant="h2"
          counter={`(${EXISTING_USERS.length})`}
          description="Choose a user to copy their group memberships and attached managed policies."
        >
          Users
        </Header>
      }
      columnDefinitions={[
        { id: 'name', header: 'User name', cell: (u) => u.name },
        {
          id: 'groups',
          header: 'Groups',
          cell: (u) => (u.groups.length ? u.groups.join(', ') : '—'),
        },
        {
          id: 'policies',
          header: 'Attached policies',
          cell: (u) => (u.policies.length ? u.policies.join(', ') : '—'),
        },
      ]}
    />
  );
}

export default function SetPermissions({ state, setState, error }) {
  return (
    <SpaceBetween size="l">
      <div id="section-permissions-options">
        <Container
          header={
            <Header
              variant="h2"
              description="Add user to an existing group or create a new one. Using groups is a best-practice way to manage user's permissions by job functions."
            >
              Permissions options
            </Header>
          }
        >
          <Tiles
            value={state.permissionsOption}
            onChange={(e) =>
              setState((s) => ({ ...s, permissionsOption: e.detail.value }))
            }
            columns={3}
            items={[
              {
                value: 'groups',
                label: 'Add user to group',
                description:
                  'Add user to an existing group, or create a new group. We recommend using groups to manage user permissions by job function.',
              },
              {
                value: 'copy',
                label: 'Copy permissions',
                description:
                  'Copy all group memberships, attached managed policies, and inline policies from an existing user.',
              },
              {
                value: 'attach',
                label: 'Attach policies directly',
                description:
                  'Attach a managed policy directly to a user. As a best practice, we recommend attaching policies to a group instead. Then, add the user to the appropriate group.',
              },
            ]}
          />
        </Container>
      </div>

      <div id="section-permissions-list">
        <SpaceBetween size="m">
          {state.permissionsOption === 'groups' && (
            <GroupsTable state={state} setState={setState} />
          )}
          {state.permissionsOption === 'copy' && (
            <CopyFromUserTable state={state} setState={setState} />
          )}
          {state.permissionsOption === 'attach' && (
            <PolicyTable
              selectedNames={state.selectedPolicies}
              onChange={(names) =>
                setState((s) => ({ ...s, selectedPolicies: names }))
              }
            />
          )}
          {error && <Alert type="error">{error}</Alert>}
          <Box variant="small" color="text-body-secondary">
            A user with no permissions can sign in, but can't do anything until
            you grant permissions to them.
          </Box>
        </SpaceBetween>
      </div>
    </SpaceBetween>
  );
}
