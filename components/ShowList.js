import React from "react";
import Link from "next/link";
import { useTable } from "react-table";

export default function ShowList({ columns, data }) {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow
  } = useTable({
    columns,
    data
  });
  
  return (
    <div className="table">
      <style jsx>
        {`
          table {
            margin: 0;
            width: 100%;
            border-spacing: 0;
            border: 1px solid black;
          }
          tr :last-child td {
            border-bottom: 0;
          }
          th,
          td {
            margin: 0;
            text-align: center;
            padding: 1.2rem 8rem;
            border-bottom: 1px solid black;
            border-right: 1px solid black;
          }
          th :last-child,
          td :last-child {
            border-right: 0;
          }
        `}
      </style>
      <table {...getTableProps()}>
        <thead>
          {headerGroups.map(headerGroup => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map(column => (
                <th {...column.getHeaderProps()}>{column.render("Header")}</th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map((row, i) => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()}>
                <td>{row.original.id}</td>
                <td>
                  <Link href="#">
                    <a>{
                        row.original.data.details
                        ? row.original.data.details.volumeInfo.title
                        : "NOT AVAILABLE"
                    }</a>
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
