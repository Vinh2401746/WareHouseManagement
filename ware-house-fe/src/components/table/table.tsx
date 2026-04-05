import { Table, type TableProps } from "antd";
import { memo } from "react";
import "./table.css";
type TableCommonProps = {} & TableProps;


const styles: TableProps<any[]>["styles"] = {
  root: {
    // padding: 10,
    border: "2px solid #E5E7EB",
    borderRadius: 8,
    overflow:'hidden'
  },
  content:{
    
  },
  body:{
    row:{
      // borderRadius:10,
      // backgroundColor:'transparent',
    }
  }

};

export const TableCommon = memo((props: TableCommonProps) => {
  const { scroll, ...rest } = props;
  return (
    <Table
      pagination={false}
      rowKey={"id"}
      size="middle"
      styles={styles}
      scroll={{ x: "max-content", ...scroll }}
      // bordered
      {...rest}
    />
  );
});
