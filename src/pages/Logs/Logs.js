import React from 'react';
import useData from '../../hooks/useData';
import { fmtDT } from '../../utils/format';
import PageHead from '../../components/PageHead/PageHead';
import Table from '../../components/Table/Table';
import Chip from '../../components/Chip/Chip';
import Loader from '../../components/Loader/Loader';
import './Logs.css';

export default function Logs() {
  const { data, loading } = useData('/logs');
  return (
    <div className="logs-page">
      <PageHead title="Recent Activity Records" sub="Who performed what action and when (all critical system changes are recorded)" />
      {loading ? <Loader /> : (
        <Table
          rows={data}
          cols={[
            { h: 'Time', r: (r) => fmtDT(r.createdAt) },
            { h: 'User', r: (r) => r.userName },
            { h: 'Action', r: (r) => <Chip danger={r.action === 'LOGIN_FAILED'}>{r.action}</Chip> },
            { h: 'Location', r: (r) => r.entity },
            { h: 'Details', r: (r) => r.details },
          ]}
        />
      )}
    </div>
  );
}
