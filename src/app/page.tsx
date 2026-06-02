"use client"

import DefaultLayout from "@/components/Layout/DefaultLayout"
import MyPieChart from "@/components/PieChart/PieChart";
import { formatDate } from "@/util/dateformat";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const { data }: any = useSession();
  const [recentlyAdded, setRecentlyAdded] = useState([]);
  const [agingTickets, setAgingTickets] = useState([]);

  const getRecentlyAdded = async () => {
    const params = new URLSearchParams({
      page: "1",
      limit: "5",
      departmentId: data?.user?.department.id,
    });

    const res = await fetch(`/api/tickets?${params}`)
    const recentAdded = await res.json();
    setRecentlyAdded(recentAdded.data);
  }

  const getAgingTickets = async () => {
    const params = new URLSearchParams({
      page: "1",
      limit: "5",
      departmentId: data?.user?.department.id,
      aging: "true",
    });

    const res = await fetch(`/api/tickets?${params}`)
    const agingTickets = await res.json();
    setAgingTickets(agingTickets.data);
  }

  useEffect(() => {
    getRecentlyAdded();
    getAgingTickets();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <DefaultLayout>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                    <th className="p-2 text-left">Created Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {recentlyAdded.length === 0 && (
                    <tr>
                      <td colSpan={8} className="p-2 text-center">
                        No tickets found.
                      </td>
                    </tr>
                  )}
                  {recentlyAdded.map((ticket: any) => (
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
                      <td className="px-2 py-1">{formatDate(ticket.createdDate)}</td>
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
        <div className="flex flex-col flex-1 min-w-1/2">
          <div className="flex flex-row justify-between">
            <h1 className="font-semibold text-xl">Status</h1>
          </div>
          <div className="bg-white px-2 py-3 mt-2 rounded-lg shadow-lg text-sm">
            <p className="text-gray-500">Status overview will be here.</p>
            <MyPieChart />
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
}
