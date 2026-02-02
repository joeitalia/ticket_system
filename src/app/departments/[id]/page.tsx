"use client"

import DefaultLayout from "@/components/Layout/DefaultLayout"
import Loading from "@/components/Layout/Loading"
import { formatDate } from "@/util/dateformat"
import { set } from "mongoose"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"

const ShowDepartment = () => {
  const params = useParams()
  const [deptId, setDeptId] = useState("")
  const [tickets, setTickets] = useState([])
  const [departmentName, setDepartmentName] = useState("")
  const [loading, setLoading] = useState(false)

  /**
   * fetch tickets by department id
   * @param deptId 
   */
  const getTickets = async (deptId: string) => {
    try {
      const res = await fetch(`/api/tickets/department/${deptId}`)
      const ticketsApi = await res.json()
      if (ticketsApi && ticketsApi.length) {
        const ticketsWithReporter: any = await Promise.all(
          ticketsApi.map(async (ticket: any) => {
            const reportedBy = await getReportedBy(ticket)
            return {
              ...ticket,
              createdBy: reportedBy
            }
          })
        )
        setTickets(ticketsWithReporter)
      }
      setLoading(false)
    } catch (error: any) {
      setTickets([])
      setLoading(false)
      alert(error)
    }
  }

  /**
   * fetch reported by user info
   * @param ticket 
   * @returns 
   */
  const getReportedBy = async (ticket: any) => {
    try {
      const res = await fetch(`/api/users/${ticket.createdBy}`)
      const userApi = await res.json()
      if (userApi) {
        return `${userApi.lastName}, ${userApi.firstName} ${userApi.middleName}`
      }
    } catch (error: any) {
      console.error(error)
      return ''
    }
    return ''
  }

  /**
   * fetch department info
   * @param deptId 
   */
  const getDepartment = async (deptId: string) => {
    try {
      const res: any = await fetch(`/api/departments/${deptId}`)
      const deptApi = await res.json()
      if (deptApi.success) {
        setDepartmentName(deptApi.data?.name ?? "")
      }
    } catch (error: any) {
      alert(error)
    }
  }

  useEffect(() => {
    setLoading(true)
    const deptId:any = params.id
    setDeptId(deptId)
    getDepartment(deptId)
    getTickets(deptId)
  }, [params.id])

  return (
    <DefaultLayout>
      {loading && <Loading />}
      {!loading && <div className="flex flex-col">
        <div className="flex flex-row justify-between items-center">
          <h1 className="font-semibold text-2xl">{departmentName} Department</h1>
          <div className="flex gap-1">
            <button className="border-green-500 rounded px-2 py-1 bg-green-500 text-white hover:bg-green-600 shadow font-semibold cursor-pointer">
              Generate Report
            </button>
            <Link
              href={`${deptId}/tickets/new`}
              className="border-blue-500 rounded px-2 py-1 bg-blue-500 text-white hover:bg-blue-600 shadow font-semibold"
            >
              Create Ticket
            </Link>
          </div>
        </div>
        <div className="bg-white px-2 py-3 mt-2 rounded-lg shadow-lg text-sm">
          <table className="w-full table-auto">
            <thead className="border-b">
              <tr>
                <th className="p-2 text-left">Ticket</th>
                <th className="p-2 text-left">Title</th>
                <th className="p-2 text-left">Importance</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-left">Start Date</th>
                <th className="p-2 text-left">Target Date</th>
                <th className="p-2 text-left">Reported By</th>
                <th className="p-2 text-left">Reported Date</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {tickets.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-2 text-center">
                    No tickets found for this department.
                  </td>
                </tr>
              )}
              {tickets.map((ticket: any) => (
                <tr key={ticket.issueNo} className="odd:bg-gray-50 hover:bg-gray-100">
                  <td className="px-2 py-1">
                    <Link 
                      href={`../departments/${deptId}/tickets/edit/${ticket.issueNo}`}
                      className="underline text-blue-500 cursor-pointer"
                    >
                      {departmentName}-{ticket.issueNo}
                    </Link>
                  </td>
                  <td className="px-2 py-1">{ticket.title}</td>
                  <td className="px-2 py-1">{ticket.importance}</td>
                  <td className="px-2 py-1">{ticket.status}</td>
                  <td className="px-2 py-1">{formatDate(ticket.startDate)}</td>
                  <td className="px-2 py-1">{formatDate(ticket.targetDate)}</td>
                  <td className="px-2 py-1">{ticket.createdBy}</td>
                  <td className="px-2 py-1">{formatDate(ticket.createdDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>}
    </DefaultLayout>
  )
}

export default ShowDepartment