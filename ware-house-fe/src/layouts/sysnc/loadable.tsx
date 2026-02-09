import { LoadingOutlined } from '@ant-design/icons';
import {Spin } from 'antd';
import { Suspense, type ReactNode } from 'react';
import type { CSSProperties } from "react";

const centerStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  minHeight: 120, // tránh bị dính lên trên
  display: "flex",
  alignItems: "center",
  justifyContent: "center",

};

const CenterLoading = () => {
  return (
    <div style={centerStyle}>
       {/* <Progress strokeLinecap="butt" type="circle" percent={75} /> */}
      {/* <Spin
        indicator={<LoadingOutlined spin style={{ fontSize: 32 }} />}
        size="large"
      /> */}
    </div>
  );
};

const Loadable = (Component:ReactNode | any) => (props:any) => {
  return (
    <Suspense fallback={<CenterLoading /> }>
      <Component {...props} />
    </Suspense>
  );
};

export default Loadable;