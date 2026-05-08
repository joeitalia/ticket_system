"use client"

import DefaultLayout from "@/components/Layout/DefaultLayout"
import Loading from "@/components/Layout/Loading"
import LoadingOverlay from "@/components/Layout/LoadingOverlay"
import Modal from "@/components/Modal"
import { formatDate } from "@/util/dateformat"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useCallback, useEffect, useState } from "react"

const ShowDepartment = () => {
  const params = useParams()
  const [deptId, setDeptId] = useState("")
  const [ticketCreators, setTicketCreators] = useState([]);
  const [tickets, setTickets] = useState([])
  const [departmentName, setDepartmentName] = useState("")
  const [loading, setLoading] = useState(false)
  const [isOverlayOpen, setIsOverlayOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [searchBy, setSearchBy] = useState("Created By");
  const [searchTerm, setSearchTerm] = useState("")
  const [totalPages, setTotalPages] = useState(1)

  /**
   * fetch tickets by department id
   * @param deptId 
   */
  const getTickets = async (deptId: string, pageNumber: number) => {
    try {
      const res = await fetch(`/api/tickets/department/${deptId}?page=${pageNumber}&limit=10`)
      const ticketsApi = await res.json()
      setLoading(false)
      if (ticketsApi?.data?.length) {
        setTotalPages(ticketsApi?.totalPages)
        setTickets(ticketsApi?.data ?? [])
        const ticketsWithReporter: any = await Promise.all(
          ticketsApi?.data?.map(async (ticket: any) => {
            const reportedBy = await getReportedBy(ticket)
            return {
              userId: ticket.createdBy,
              createdBy: reportedBy
            }
          })
        )
        setTicketCreators(ticketsWithReporter)
      }
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
      if (userApi && userApi.firstName && userApi.lastName) {
        return `${userApi.firstName} ${userApi.middleName} ${userApi.lastName}`
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

  const displayCreator = useCallback((creatorId: string) => {
    if (!ticketCreators.length) return <span className="text-blue-300">Loading...</span>
    const creator: any = ticketCreators?.filter((crtr: any) => crtr.userId === creatorId)
    return creator?.[0]?.createdBy ?? ''
  }, [ticketCreators])

  const generateReport = async () => {
    if (!dateFrom || !dateTo) {
      alert("Please select date range for the report.")
      return
    }
    if (dateFrom && dateTo && new Date(dateFrom) > new Date(dateTo)) {
      alert("Invalid date range: 'From' date cannot be later than 'To' date.")
      return
    }
    setIsOverlayOpen(true)
    setReportModalOpen(false)
    try {
      const params = new URLSearchParams({
        search: searchTerm,
        searchBy: searchBy,
        startDate: dateFrom,
        endDate: dateTo,
        report: "true",
      });

      const res = await fetch(`/api/tickets/department/${deptId}?${params}`)
      const reportApi = await res.json()
      if (reportApi?.data?.length) {
        const ticketsWithReporter: any = await Promise.all(
          reportApi?.data?.map(async (ticket: any) => {
            const reportedBy = await getReportedBy(ticket)
            return {
              issueNo: ticket.issueNo,
              title: ticket.title,
              description: ticket.description,
              importance: ticket.importance,
              status: ticket.status,
              type: ticket.type,
              startDate: formatDate(ticket.startDate),
              targetDate: formatDate(ticket.targetDate),
              createdDate: formatDate(ticket.createdDate),
              createdBy: reportedBy
            }
          })
        )
        // 2️⃣ CSV headers
        const headers = ["Issue No.", "Title", "Description", "Importance", "Status", "Type", "Start Date", "Target Date", "Created Date", "Created By"];
        const fields = ["issueNo", "title", "description", "importance", "status", "type", "startDate", "targetDate", "createdDate", "createdBy"];
        const rows = [
          headers.join(","), // header row
          ...ticketsWithReporter.map((row: any) =>
            fields.map((field: any) => `"${row[field]}"`).join(",")
          ),
        ];
        const csv = rows.join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${departmentName}-report.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setIsOverlayOpen(false)
      } else {
        setIsOverlayOpen(false)
        alert(reportApi.message || "Error generating report")
      }
    } catch (error: any) {
      setIsOverlayOpen(false)
      alert(error.message || "Error generating report")
    }
  }
  
  useEffect(() => {
    const departmentId:any = params.id
    setLoading(true)
    setDeptId(departmentId)
    getDepartment(departmentId)
    if (departmentId && page) getTickets(departmentId, page)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (deptId && page) getTickets(deptId, page)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  return (
    <DefaultLayout>
      {isOverlayOpen && <LoadingOverlay />}
      {loading && <Loading />}
      {!loading && <div className="flex flex-col">
        <div className="flex flex-row justify-between items-center">
          <h1 className="font-semibold text-2xl">{departmentName} Department</h1>
          <div className="flex gap-1">
            <button onClick={() => setReportModalOpen(true)} className="border-green-500 rounded px-2 py-1 bg-green-500 text-white hover:bg-green-600 shadow font-semibold cursor-pointer">
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
                  <td className="px-2 py-1">{displayCreator(ticket.createdBy)}</td>
                  <td className="px-2 py-1">{formatDate(ticket.createdDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-between text-sm mt-2">
          <Link 
            href={`/departments`} 
            className="bg-white text-gray-500 font-semibold px-10 py-1 rounded border border-gray-300 cursor-pointer hover:bg-gray-100"
          >
            Back
          </Link>
          {totalPages > 1 && (
            <div className="flex gap-x-2 items-center">
              <button
                onClick={() => {
                  setTicketCreators([])
                  setPage((prev) => Math.max(prev - 1, 1))
                }}
                type="button"
                className={`py-1 px-2 shadow rounded border border-gray-300 ${page === 1 ? "bg-gray-100 text-gray-400" : "cursor-pointer bg-white hover:bg-gray-100"}`}
                disabled={page === 1}
              >
                Prev
              </button>
              <span>Page {page} of {totalPages}</span>
              <button
                onClick={() => {
                  setTicketCreators([])
                  setPage((prev) => Math.min(prev + 1, totalPages))
                }}
                type="button"
                className={`py-1 px-2 shadow rounded border border-gray-300 ${page === totalPages ? "bg-gray-100 text-gray-400" : "cursor-pointer bg-white hover:bg-gray-100"}`}
                disabled={page === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>}
      {reportModalOpen &&
        <Modal onClose={() => setReportModalOpen(false)}>
          <div className="max-h-[600px]">
            <div className="border-b border-gray-200 py-2 px-4">
              <h2 className="text-lg font-semibold">Generate Report</h2>
            </div>
            <div className="p-4 flex flex-col gap-4">
              <div className="flex flex-col">
                <label>Search date created:</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="border border-gray-300 rounded py-1 px-2"
                  />
                  <span> to </span>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="border border-gray-300 rounded py-1 px-2"
                  />
                </div>
              </div>
              <div className="flex flex-col">
                <label>Search by:</label>
                <div className="flex flex-col gap-2">
                  <select
                    value={searchBy}
                    onChange={(e) => setSearchBy(e.target.value)}
                    className="border border-gray-300 rounded py-1 px-2"
                  >
                    <option value="title">Title</option>
                    <option value="createdBy">Reported By</option>
                    <option value="assignee">Assignee</option>
                    <option value="status">Status</option>
                    <option value="type">Type</option>
                  </select>
                  <input
                    type="text"
                    placeholder={`Search by ${searchBy}`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border border-gray-300 rounded py-1 px-2"
                  />
                </div>
              </div>
            </div>
            <div className="border-t border-gray-200 py-2 px-4 flex justify-end">
              <button 
                onClick={generateReport}
                className="bg-green-500 text-white font-semibold px-4 py-2 rounded hover:bg-green-600 cursor-pointer"
              >
                Generate
              </button>
            </div>
          </div>
        </Modal>
      }
    </DefaultLayout>
  )
}

export default ShowDepartment