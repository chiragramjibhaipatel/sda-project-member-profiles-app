import { GetAllMembersQuery } from "~/types/admin.generated";
import {
  IndexTable,
  IndexFilters,
  useSetIndexFiltersMode,
  Text,
  IndexFiltersMode,
  useBreakpoints,
  Card,
  Link,
} from "@shopify/polaris";
import type { IndexFiltersProps, TabProps } from "@shopify/polaris";
import { useState, useCallback, useEffect } from "react";
import { useFetcher } from "@remix-run/react";
import { Maybe } from "~/types/admin.types";

export function MembersListTable({
  members: initialMembers,
}: {
  members: GetAllMembersQuery;
}) {
  const [members, setMembers] = useState(initialMembers);
  const fetcher = useFetcher();
  const isPending = ["loading", "submitting"].includes(fetcher.state);
  useEffect(() => {
    if (fetcher.data) {
      setMembers(fetcher.data.members);
    }
  }, [fetcher.data]);
  
  const [itemStrings, setItemStrings] = useState([
    "All",
    "Founders",
    "Founding Members",
    "Members", 
  ]);
  
  const [selectedTab, setSelectedTab] = useState(itemStrings[0]);
  
  const tabs: TabProps[] = itemStrings.map((item, index) => ({
    content: item,
    index,
    onAction: () => handleTabChange(item),
    id: `${item}-${index}`,
    isLocked: index === 0,
    
  }));
  const [selected, setSelected] = useState(0);
  
  const sortOptions: IndexFiltersProps["sortOptions"] = [
    { label: "Member", value: "display_name asc", directionLabel: "A-Z" },
    { label: "Member", value: "display_name desc", directionLabel: "Z-A" },
    { label: "Update Date", value: "updated_at asc", directionLabel: "A-Z" },
    { label: "Update Date", value: "updated_at desc", directionLabel: "Z-A" },
  ];
  const [sortSelected, setSortSelected] = useState(["updated_at asc"]);
  const { mode, setMode } = useSetIndexFiltersMode(IndexFiltersMode.Filtering);
  const onHandleCancel = () => {
    setQueryValue("");
  };

  const [taggedWith, setTaggedWith] = useState<string | undefined>("");
  const [queryValue, setQueryValue] = useState<string>("");

  const handleQueryValueChange = useCallback(
    (value: string) => setQueryValue(value),
    [],
  );
  
  const handleTaggedWithRemove = useCallback(() => setTaggedWith(""), []);
  const handleQueryValueRemove = useCallback(() => setQueryValue(""), []);
  const handleFiltersClearAll = useCallback(() => {
    handleTaggedWithRemove();
    handleQueryValueRemove();
  }, [
    handleQueryValueRemove,
    handleTaggedWithRemove,
  ]);

  const appliedFilters =
    taggedWith && !isEmpty(taggedWith)
      ? [
          {
            key: "taggedWith",
            label: disambiguateLabel("taggedWith", taggedWith),
            onRemove: handleTaggedWithRemove,
          },
        ]
      : [];

  const resourceName = {
    singular: "order",
    plural: "orders",
  };

  const rowMarkup = members.metaobjects.edges.map(
    ({ node: { id, name, email, updatedAt, handle } }, index) => (
      <IndexTable.Row id={id} key={id} position={index}>
        <IndexTable.Cell>
          <Link url={`/app/members/${handle}`}>
            <Text variant="bodyMd" fontWeight="bold" as="span">
              {name?.value}
            </Text>
          </Link>
        </IndexTable.Cell>
        <IndexTable.Cell>{email?.value}</IndexTable.Cell>
        <IndexTable.Cell>
          {new Date(updatedAt).toLocaleString()}
        </IndexTable.Cell>
      </IndexTable.Row>
    ),
  );

  const handleOnNext = async ({
    endCursor,
  }: {
    endCursor: Maybe<string> | undefined;
  }) => {
    if (!endCursor) return;
    await fetcher.submit({ endCursor, queryValue, direction: "next", selectedTab, _action: "next", sortSelected: sortSelected[0] }, { method: "POST" });
  };

  const handleOnPrevious = async ({
    startCursor,
  }: {
    startCursor: Maybe<string> | undefined;
  }) => {
    if (!startCursor) return;
    await fetcher.submit(
      { startCursor, queryValue, direction: "previous", selectedTab, _action: "prev", sortSelected: sortSelected[0] },
      { method: "POST" },
    );
  };

  function handleTabChange(item: string) {
    setSelectedTab(item);
    fetcher.submit(
      { selectedTab: item, _action: "tab_changed", sortSelected: sortSelected[0] },
      { method: "POST" },
    );
  }

  const handleSortChange = async (selected: string[]) => {
    console.log("sort changed to: ", selected);
    setSortSelected(selected);
    await fetcher.submit(
      { selectedTab, queryValue, sortSelected: selected[0], _action: "sort_changed" },
      { method: "POST" },
    );
  };

  useEffect(() => {
    fetcher.submit(
      { selectedTab, queryValue, _action: "query_changed", sortSelected: sortSelected[0] },
      { method: "POST" },
    );
  } , [queryValue]);

  return (
    <Card padding={"0"}>
      <IndexFilters
        loading={isPending}
        sortOptions={sortOptions}
        sortSelected={sortSelected}
        queryValue={queryValue}
        queryPlaceholder="Searching in all members"
        onQueryChange={handleQueryValueChange}
        onQueryClear={() => setQueryValue("")}
        onSort={handleSortChange}
        cancelAction={{
          onAction: onHandleCancel,
          disabled: false,
          loading: false,
        }}
        tabs={tabs}
        selected={selected}
        onSelect={setSelected}
        canCreateNewView={false}
        filters={[]}
        appliedFilters={appliedFilters}
        onClearAll={handleFiltersClearAll}
        mode={mode}
        setMode={setMode}
      />
      <IndexTable
        condensed={useBreakpoints().smDown}
        resourceName={resourceName}
        itemCount={members.metaobjects.edges.length}
        headings={[
          { title: "Members" },
          { title: "Email" },
          { title: "Updated" },
        ]}
        selectable={false}
        pagination={{
          hasNext: members.metaobjects.pageInfo.hasNextPage,
          hasPrevious: members.metaobjects.pageInfo.hasPreviousPage,
          onNext: () =>
            handleOnNext({ endCursor: members.metaobjects.pageInfo.endCursor }),
          onPrevious: () =>
            handleOnPrevious({
              startCursor: members.metaobjects.pageInfo.startCursor,
            }),
        }}
      >
        {rowMarkup}
      </IndexTable>
    </Card>
  );

  function disambiguateLabel(key: string, value: string | string[]): string {
    switch (key) {
      case "moneySpent":
        return `Money spent is between $${value[0]} and $${value[1]}`;
      case "taggedWith":
        return `Tagged with ${value}`;
      case "accountStatus":
        return (value as string[]).map((val) => `Customer ${val}`).join(", ");
      default:
        return value as string;
    }
  }

  function isEmpty(value: string): boolean {
    if (Array.isArray(value)) {
      return value.length === 0;
    } else {
      return value === "" || value == null;
    }
  }
}

