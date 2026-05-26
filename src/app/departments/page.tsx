"use client"
import DefaultLayout from "@/components/Layout/DefaultLayout"
import Loading from "@/components/Layout/Loading"
import { formatDate } from "@/util/dateformat"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { useEffect, useState } from "react"

const Departments = () => {

  const { data }: any = useSession()
  const [departments, setDepartments] = useState<any>(null)

  const onDeleteDepartment = async (deptId: string) => {
    if (deptId && confirm("Are you sure you want to remove this department?")) {
      try {
        const res = await fetch(`/api/departments/${deptId}`, {
          method: "DELETE",
        });
        const apiData = await res.json();
        if (apiData.success) {
          alert("Department has been removed successfully.")
          // refresh department list
          const updatedDepartments = departments.filter((dept: any) => dept._id !== deptId);
          setDepartments(updatedDepartments);
        } else {
          throw "Failed to remove department."
        }
      } catch (error: any) {
        alert(error)
      }
    }
  }

  useEffect(() => {
    fetch("/api/departments")
      .then((res) => res.json())
      .then(setDepartments);
  }, [])

  return (
    <DefaultLayout>
      {!departments && <Loading />}
      {
        departments && 
        <div className="flex flex-col">
          <div className="flex flex-row justify-between">
            <h1 className="font-semibold text-2xl">Departments</h1>
            {
              data?.user?.userType === "Admin" && <Link 
                href={'/departments/new'}
                className="border-blue-500 rounded px-2 py-1 bg-blue-500 text-white hover:bg-blue-600 shadow font-semibold"
              >
                Add Department
              </Link>
            }
          </div>
          <div className="bg-white px-2 py-3 mt-2 rounded-lg shadow-lg text-sm">
            <table className="w-full table-auto">
              <thead className="border-b">
                <tr>
                  <th className="p-2 text-left">Department</th>
                  <th className="p-2 text-left">Date Added</th>
                  <th className="p-2 text-left">Added By</th>
                  <th className="p-2 w-32 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                { 
                  departments?.map((dept: any, i: number) => 
                    (
                      <tr key={`project-${i}`} className="odd:bg-gray-50 hover:bg-gray-100">
                        <td className="px-2 py-1">
                          {dept.name}
                        </td>
                        <td className="px-2 py-1">{formatDate(dept.createdDate)}</td>
                        <td className="px-2 py-1">{dept.createdBy}</td>
                        <td className="text-right px-2 py-1">
                          <div className="flex gap-x-1 justify-end w-full">
                            {/* <button className="text-[11px] border-blue-500 rounded px-2 py-1 bg-blue-500 text-white hover:bg-blue-600 shadow whitespace-nowrap">Generate QRCode</button> */}
                            <Link 
                              href={`/departments/edit/${dept._id}`}
                              className="text-[11px] border-yellow-500 rounded px-2 py-1 bg-yellow-500 text-white hover:bg-yellow-600 shadow items-center flex">
                                Edit
                            </Link>
                            { data?.user?.userType === "Admin" && 
                              <button
                                onClick={() => onDeleteDepartment(dept._id)}
                                className="text-[11px] border-red-500 rounded px-2 py-1 bg-red-500 text-white hover:bg-red-600 shadow cursor-pointer">
                                  Remove
                              </button> || <span className="flex-1"></span>
                            }
                          </div>
                        </td>
                      </tr>
                    )
                  )
                }
                {
                  (!departments || departments.length == 0) &&
                  (<tr className="odd:bg-gray-50 hover:bg-gray-100">
                    <td className="px-2 py-1 text-center" colSpan={4}>No Department found.</td>
                  </tr>)
                }
              </tbody>
            </table>
          </div>
        </div>
      }
    </DefaultLayout>
  )

}

export default Departments