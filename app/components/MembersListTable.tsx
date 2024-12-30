import { GetAllMembersQuery } from "~/types/admin.generated";
import {
  TextField,
  IndexTable,
  IndexFilters,
  useSetIndexFiltersMode,
  Text,
  ChoiceList,
  RangeSlider,
  Badge,
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
  
  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));
  const [itemStrings, setItemStrings] = useState([
    "All",
    "Founders",
    "Founding Members",
    "Members", 
  ]);
  
  const [selectedTab, setSelectedTab] = useState(itemStrings[0]);
  
  function handleTabChange(item: string) {
    setSelectedTab(item);
    fetcher.submit({ selectedTab: item, _action : "tab_changed" }, { method: "POST" });
  }

  const tabs: TabProps[] = itemStrings.map((item, index) => ({
    content: item,
    index,
    onAction: () => handleTabChange(item),
    id: `${item}-${index}`,
    isLocked: index === 0,
    
  }));
  const [selected, setSelected] = useState(0);
  const onCreateNewView = async (value: string) => {
    await sleep(500);
    setItemStrings([...itemStrings, value]);
    setSelected(itemStrings.length);
    return true;
  };
  const sortOptions: IndexFiltersProps["sortOptions"] = [
    { label: "Order", value: "order asc", directionLabel: "Ascending" },
    { label: "Order", value: "order desc", directionLabel: "Descending" },
    { label: "Customer", value: "customer asc", directionLabel: "A-Z" },
    { label: "Customer", value: "customer desc", directionLabel: "Z-A" },
    { label: "Date", value: "date asc", directionLabel: "A-Z" },
    { label: "Date", value: "date desc", directionLabel: "Z-A" },
    { label: "Total", value: "total asc", directionLabel: "Ascending" },
    { label: "Total", value: "total desc", directionLabel: "Descending" },
  ];
  const [sortSelected, setSortSelected] = useState(["order asc"]);
  const { mode, setMode } = useSetIndexFiltersMode(IndexFiltersMode.Filtering);
  const onHandleCancel = () => {};

  const [taggedWith, setTaggedWith] = useState<string | undefined>("");
  const [queryValue, setQueryValue] = useState<string | undefined>(undefined);

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
    await fetcher.submit({ endCursor, direction: "next", selectedTab, _action: "next" }, { method: "POST" });
  };

  const handleOnPrevious = async ({
    startCursor,
  }: {
    startCursor: Maybe<string> | undefined;
  }) => {
    if (!startCursor) return;
    await fetcher.submit(
      { startCursor, direction: "previous", selectedTab, _action: "prev" },
      { method: "POST" },
    );
  };

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
        onSort={setSortSelected}
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

