import { Table, type TableProps } from "antd";
import { memo } from "react";
import "./table.css";
type TableCommonProps = {} & TableProps;
export const TableCommon = memo((props: TableCommonProps) => {
  return (
    <Table
      classNames={{
        root: "table-container",
        body: {
          row: "table-row",
          cell: "table-cell",
        },
        header: {
          wrapper: "table-header",
          
        },
        content: "table-content",
      }}
      pagination={false}
      rowKey={"id"}
      size="middle"
      // bordered
      {...props}
    />
  );
});
