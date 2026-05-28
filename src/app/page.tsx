"use client"

import DefaultLayout from "@/components/Layout/DefaultLayout"
import MyPieChart from "@/components/PieChart/PieChart";
import { formatDate } from "@/util/dateformat";
import Link from "next/link";

export default function Home() {

  const ticketsAssigned = [
    {
      issueNo: 123,
      title: "Fix login bug",
      importance: "High",
      status: "In Progress",
      startDate: "2024-06-01T10:00:00Z",
      targetDate: "2024-06-05T17:00:00Z",
      createdBy: { name: "Alice" },
      createdDate: "2024-05-30T09:00:00Z"
    },
    {
      issueNo: 124,
      title: "Update user profile page",
      importance: "Medium",
      status: "New",
      startDate: "2024-06-02T11:00:00Z",
      targetDate: "2024-06-10T17:00:00Z",
      createdBy: { name: "Bob" },
      createdDate: "2024-05-31T14:30:00Z"
    }
  ];

  const agingTickets = [
    {
      issueNo: 125,
      title: "Implement search feature",
      importance: "High",
      status: "In Progress",
      startDate: "2024-05-20T09:00:00Z",
      targetDate: "2024-06-01T17:00:00Z",
      createdBy: { name: "Charlie" },
      createdDate: "2024-05-15T08:00:00Z"
    },
    {
      issueNo: 126,
      title: "Optimize database queries",
      importance: "Low",
      status: "New",
      startDate: "2024-05-25T10:30:00Z",
      targetDate: "2024-06-05T17:00:00Z",
      createdBy: { name: "Dave" },
      createdDate: "2024-05-20T12:45:00Z"
    },
    {
      issueNo: 127,
      title: "Update documentation",
      importance: "Medium",
      status: "In Progress",
      startDate: "2024-05-28T11:00:00Z",
      targetDate: "2024-06-10T17:00:00Z",
      createdBy: { name: "Eve" },
      createdDate: "2024-05-25T14:30:00Z"
    }
  ];

  return (
    <DefaultLayout>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="flex flex-col flex-1 min-w-1/2">
          <div className="flex flex-row justify-between">
            <h1 className="font-semibold text-xl">Status</h1>
          </div>
          <div className="bg-white px-2 py-3 mt-2 rounded-lg shadow-lg text-sm">
            <p className="text-gray-500">Status overview will be here.</p>
            <MyPieChart />
          </div>
        </div>
        <div className="flex flex-col flex-1 min-w-1/2 gap-5">
          <div className="flex flex-col">
            <div className="flex flex-row justify-between">
              <h1 className="font-semibold text-xl">Recently added</h1>
            </div>
            <div className="bg-white px-2 py-3 mt-2 rounded-lg shadow-lg text-sm">
              <table className="w-full table-auto">
                <thead className="border-b">
                  <tr>
                    <th className="p-2 text-left">Ticket</th>
                    <th className="p-2 text-left">Title</th>
                    <th className="p-2 text-left">Importance</th>
                    <th className="p-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {ticketsAssigned.length === 0 && (
                    <tr>
                      <td colSpan={8} className="p-2 text-center">
                        No tickets found.
                      </td>
                    </tr>
                  )}
                  {ticketsAssigned.map((ticket: any) => (
                    <tr key={ticket.issueNo} className="odd:bg-gray-50 hover:bg-gray-100">
                      <td className="px-2 py-1">
                        <Link 
                          href={`../tickets/edit/${ticket.issueNo}`}
                          className="underline text-blue-500 cursor-pointer"
                        >
                          TN-{ticket.issueNo}
                        </Link>
                      </td>
                      <td className="px-2 py-1">{ticket.title}</td>
                      <td className="px-2 py-1">{ticket.importance}</td>
                      <td className="px-2 py-1">{ticket.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex flex-row justify-between">
              <h1 className="font-semibold text-xl">Aging Tickets</h1>
            </div>
            <div className="bg-white px-2 py-3 mt-2 rounded-lg shadow-lg text-sm">
              <table className="w-full table-auto">
                <thead className="border-b">
                  <tr>
                    <th className="p-2 text-left">Ticket</th>
                    <th className="p-2 text-left">Title</th>
                    <th className="p-2 text-left">Importance</th>
                    <th className="p-2 text-left">Status</th>
                    <th className="p-2 text-left">Target Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {agingTickets.length === 0 && (
                    <tr>
                      <td colSpan={8} className="p-2 text-center">
                        No tickets found.
                      </td>
                    </tr>
                  )}
                  {agingTickets.map((ticket: any) => (
                    <tr key={ticket.issueNo} className="odd:bg-gray-50 hover:bg-gray-100">
                      <td className="px-2 py-1">
                        <Link 
                          href={`../tickets/edit/${ticket.issueNo}`}
                          className="underline text-blue-500 cursor-pointer"
                        >
                          TN-{ticket.issueNo}
                        </Link>
                      </td>
                      <td className="px-2 py-1">{ticket.title}</td>
                      <td className="px-2 py-1">{ticket.importance}</td>
                      <td className="px-2 py-1">{ticket.status}</td>
                      <td className="px-2 py-1">{formatDate(ticket.targetDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
}
