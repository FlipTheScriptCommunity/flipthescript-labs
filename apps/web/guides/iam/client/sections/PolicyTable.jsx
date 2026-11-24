import React, { useState } from 'react';
import Table from '@cloudscape-design/components/table';
import Header from '@cloudscape-design/components/header';
import TextFilter from '@cloudscape-design/components/text-filter';
import Pagination from '@cloudscape-design/components/pagination';
import Box from '@cloudscape-design/components/box';
import { MANAGED_POLICIES } from '../data';

const PAGE_SIZE = 8;

// The "Permissions policies" picker used both while creating the user and
// in the "Add permissions" dialog on the user page.
export default function PolicyTable({
  selectedNames,
  onChange,
  exclude = [],
  headerVariant = 'h2',
  variant = 'container',
}) {
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);

  const available = MANAGED_POLICIES.filter((p) => !exclude.includes(p.name));
  const query = filter.trim().toLowerCase();
  const filtered = query
    ? available.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query),
      )
    : available;
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const items = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  return (
    <Table
      variant={variant}
      selectionType="multi"
      trackBy="name"
      items={items}
      selectedItems={available.filter((p) => selectedNames.includes(p.name))}
      onSelectionChange={(e) =>
        onChange(e.detail.selectedItems.map((p) => p.name))
      }
      ariaLabels={{
        selectionGroupLabel: 'Policy selection',
        itemSelectionLabel: (_, item) => item.name,
        allItemsSelectionLabel: () => 'Select all',
      }}
      header={
        <Header
          variant={headerVariant}
          counter={`(${selectedNames.length}/${available.length})`}
          description="Choose one or more policies to attach to your new user."
        >
          Permissions policies
        </Header>
      }
      filter={
        <TextFilter
          filteringText={filter}
          filteringPlaceholder="Filter by policy name or description"
          countText={`${filtered.length} matches`}
          onChange={(e) => {
            setFilter(e.detail.filteringText);
            setPage(1);
          }}
        />
      }
      pagination={
        <Pagination
          currentPageIndex={currentPage}
          pagesCount={pageCount}
          onChange={(e) => setPage(e.detail.currentPageIndex)}
        />
      }
      columnDefinitions={[
        { id: 'name', header: 'Policy name', cell: (p) => p.name },
        { id: 'type', header: 'Type', cell: (p) => p.type },
        {
          id: 'description',
          header: 'Description',
          cell: (p) => p.description,
        },
      ]}
      empty={
        <Box textAlign="center" color="inherit">
          No policies match the filter.
        </Box>
      }
    />
  );
}
