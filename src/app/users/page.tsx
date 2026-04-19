"use client"

import DefaultLayout from "@/components/Layout/DefaultLayout"
import Loading from "@/components/Layout/Loading"
import { formatDate } from "@/util/dateformat"
import Link from "next/link"
import { useEffect, useState } from "react"

const Users = () => {

  const [users, setUsers] = useState([])

  const getDepartment = async (deptId: string) => {
    try {
      const res: any = await fetch(`/api/departments/${deptId}`)
      const deptApi = await res.json()
      if (deptApi.success) {
        return deptApi.data
      }
    } catch (error: any) {
      alert(error)
    } 
    return "";
  }

  const getUsers = async () => {
    try {
      const res = await fetch("/api/users")
      const userApi = await res.json()
      if (userApi && userApi.length) {
        const usersList: any = await Promise.all(
          userApi.map(async (use: any) => {
            const dept = await getDepartment(use.departmentId)
            return {
              ...use,
              department: dept?.name ?? ""
            }
          })
        )
        setUsers(usersList)
      }
    } catch (error: any) {
      setUsers([])
      console.error(error)
    }
  }

  const removeUser = (userId: string) => {
    if (confirm("Are you sure you want to remove this user?")) {
      fetch(`/api/users/${userId}`, { method: "DELETE" })
        .then(async (res) => {
          if (!res.ok) {
            throw new Error("Failed to remove user.")
          }
          // Only parse JSON if response has content
          const text = await res.text()
          return text ? JSON.parse(text) : {}
        })
        .then((data) => {
          if (data.success) {
            alert(data.message || "User Account removed successfully.")
            getUsers()
          } else {
            alert(data.error || "Failed to remove user.")
          }
        })
        .catch((error) => {
          console.error("Error removing user:", error)
          alert("An error occurred while removing the user.")
        })
    }
  }

  useEffect(() => {
    getUsers()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <DefaultLayout>
      {!users?.length && <Loading />}
      {users?.length && <div className="flex flex-col">
        <div className="flex flex-row justify-between">
          <h1 className="font-semibold text-2xl">Users</h1>
          <Link
            href={'/users/new'}
            className="border-blue-500 rounded px-2 py-1 bg-blue-500 text-white hover:bg-blue-600 shadow font-semibold"
          >
            Add User Account
          </Link>
        </div>
        <div className="bg-white px-2 py-3 mt-2 rounded-lg shadow-lg text-sm">
          <table className="w-full table-auto">
            <thead className="border-b">
              <tr>
                <th className="p-2 text-left">Full Name</th>
                <th className="p-2 text-left">Email</th>
                <th className="p-2 text-left">Department</th>
                <th className="p-2 text-left">Position</th>
                <th className="p-2 text-left">Date Added</th>
                <th className="p-2 w-32 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users?.map((user: any) =>
                (
                  <tr key={user._id} className="odd:bg-gray-50 hover:bg-gray-100">
                    <td className="px-2 py-1">
                      {/* <Link href={`/users/${user._id}`} className="underline text-blue-500 cursor-pointer">{`${user.lastName}, ${user.firstName} ${user.middleName}`}</Link> */}
                      {`${user.firstName} ${user.middleName} ${user.lastName}`}
                    </td>
                    <td className="px-2 py-1">{user.email}</td>
                    <td className="px-2 py-1">{user.department}</td>
                    <td className="px-2 py-1">{user.position}</td>
                    <td className="px-2 py-1">{formatDate(user.createdDate)}</td>
                    <td className="text-right px-2 py-1">
                      <div className="flex gap-x-1 justify-end w-full">
                        <Link
                          href={`/users/edit/${user._id}`}
                          className="text-[11px] border-yellow-500 rounded px-2 py-1 bg-yellow-500 text-white hover:bg-yellow-600 shadow cursor-pointer"
                        >
                            Edit
                        </Link>
                        <button
                          className="text-[11px] border-red-500 rounded px-2 py-1 bg-red-500 text-white hover:bg-red-600 shadow cursor-pointer"
                          onClick={() => removeUser(user._id)}
                        >
                            Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>}
    </DefaultLayout>
  )
}

export default Users