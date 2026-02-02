"use client"

import DefaultLayout from "@/components/Layout/DefaultLayout"
import Form from "next/form"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation";
import { generatePassword } from "@/util/generate-password"
import { hashText } from "@/util/hash"
import Loading from "@/components/Layout/Loading"

const AddUser = () => {
  const params = useParams()
  const router = useRouter()

  const [lastName, setLastName] = useState("")
  const [firstName, setFirstName] = useState("")
  const [middleName, setMiddleName] = useState("")
  const [department, setDepartment] = useState("")
  const [position, setPosition] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [departmentList, setDepartmentList] = useState([])
  const [editPassword, setEditPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  /**
   * validate and save new user
   */
  const onUpdateUser = async () => {
    const errors: any = []
    try {
      if (!lastName) errors.push("Please insert Last Name.")
      if (!firstName) errors.push("Please insert First Name.")
      if (!department) errors.push("Please select Department.")
      if (!position) errors.push("Please insert Position.")
      if (!password && editPassword) errors.push("Please insert password.")
        
      if (errors.length == 0) {
        const userId: any = params.id
        const saveUserRes = await fetch(`/api/users/${userId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firstName, 
            lastName,
            middleName,
            departmentId: department,
            position,
            ...(password && editPassword ? { password: await hashText(password) } : {})
          }),
        })
        const userApiData = await saveUserRes.json();
        if (userApiData.success) {
          alert("User has been updated successfully.")
          router.push("/users")
        } else {
          throw "Failed to update User account."
        }
      }
      setFieldErrors(errors)
    } catch (error: any) {
      setFieldErrors([])
      alert(error)
    }
  }

  const onGeneratePassword = () => {
    const newPassword = generatePassword();
    setPassword(newPassword);
  }

  const fetchUserAccount = async (userId: string) => {
    try {
      const res = await fetch(`/api/users/${userId}`)
      const userApi = await res.json()
      if (userApi && userApi._id) {
        setLastName(userApi.lastName)
        setFirstName(userApi.firstName)
        setMiddleName(userApi.middleName)
        setDepartment(userApi.departmentId)
        setPosition(userApi.position)
        setEmail(userApi.email)
      }
    } catch (error: any) {
      alert(error)
    }
    setIsLoading(false);
  }

  useEffect(() => {
    setIsLoading(true);
    fetch("/api/departments")
      .then((res) => res.json())
      .then(setDepartmentList);
  }, [])

  useEffect(() => {
    const userId: any = params.id
    fetchUserAccount(userId);
  }, [params.id])

  return (
    <DefaultLayout>
      {isLoading && <Loading/>}
      {!isLoading && <div className="flex flex-col gap-2">
        <h1 className="font-semibold text-2xl">Edit User</h1>
        <Form
        action="#"
        formMethod="POST"
        id="updateUser-form" 
        className="flex flex-col bg-white min-w-96 justify-center py-5 px-10 shadow-lg rounded-lg text-sm">
          <div className="flex flex-col gap-y-4">
            {
              fieldErrors && (
                <div className="flex flex-col">
                { 
                  fieldErrors.map((err: string) => (
                    <span key={err} className="text-xs text-red-500">{err}</span>
                  ))
                }
                </div>
              )
            }
            <div className="flex flex-row gap-4">
              <div className="flex flex-col w-full gap-1">
                <label className="font-semibold">Last Name:</label>
                <div className="flex w-full">
                  <input
                    defaultValue={lastName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLastName(e.target.value)}
                    type="text" 
                    className="border border-gray-100 px-2 py-1.5 rounded w-full outline-gray-200 bg-white"
                  />
                </div>
              </div>
              <div className="flex flex-col w-full gap-1">
                <label className="font-semibold">First Name:</label>
                <div className="flex w-full">
                  <input
                    defaultValue={firstName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFirstName(e.target.value)}
                    type="text" 
                    className="border border-gray-100 px-2 py-1.5 rounded w-full outline-gray-200 bg-white"
                  />
                </div>
              </div>
              <div className="flex flex-col w-full gap-1">
                <label className="font-semibold">Middle Name:</label>
                <div className="flex w-full">
                  <input
                    defaultValue={middleName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMiddleName(e.target.value)}
                    type="text" 
                    className="border border-gray-100 px-2 py-1.5 rounded w-full outline-gray-200 bg-white"
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-row gap-4">
              <div className="flex flex-col w-full gap-1">
                <label className="font-semibold">Department:</label>
                <div className="flex w-full">
                  <select 
                    defaultValue={department}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setDepartment(e.target.value)}
                    className='border border-gray-100 p-2 rounded w-full outline-gray-200 bg-white'
                  >
                    <option>Select...</option>
                    {
                      departmentList.map((dept: any, i:number) => (
                        <option key={`project-${i}`} value={dept._id}>{dept.name}</option>
                      ))
                    }
                  </select>
                </div>
              </div>
              <div className="flex flex-col w-full gap-1">
                <label className="font-semibold">Position:</label>
                <div className="flex w-full">
                  <input
                    defaultValue={position}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPosition(e.target.value)}
                    type="text" 
                    className="border border-gray-100 px-2 py-1.5 rounded w-full outline-gray-200 bg-white"
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-row gap-4">
              <div className="flex flex-col w-full gap-1">
                <label className="font-semibold">Email Address:</label>
                <div className="flex w-full">
                  <input
                    defaultValue={email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                    disabled
                    type="text" 
                    className="border border-gray-100 px-2 py-1.5 rounded w-full outline-gray-200 bg-gray-100"
                  />
                </div>
              </div>
              <div className="flex flex-col w-full gap-1">
                <label className="font-semibold">Password:</label>
                <div className="flex flex-col w-full gap-2">
                  <input
                    defaultValue={password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                    {...editPassword ? {} : {disabled: true}}
                    type="text"
                    className={`border border-gray-100 px-2 py-1.5 rounded w-full outline-gray-200 ${editPassword ? 'bg-white' : 'bg-gray-100'}`}
                  />
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      onChange={() => {
                        setEditPassword(!editPassword);
                      }}
                    />
                    &nbsp; Edit Password
                  </label>
                </div>
              </div>
            </div>
            <div className="flex flex-row gap-3 mt-5">
              <button
                className="bg-green-700 text-white font-semibold px-10 py-1 rounded border border-green-700 cursor-pointer hover:bg-green-600"
                onClick={onUpdateUser}
              >
                Save
              </button>
              <Link
                href={'/users'} 
                className="bg-white text-gray-500 font-semibold px-10 py-1 rounded border border-gray-300 cursor-pointer hover:bg-gray-100"
              >
                Back
              </Link>
              {editPassword && <button
                className="bg-green-700 text-white font-semibold px-10 py-1 rounded border border-green-700 cursor-pointer hover:bg-green-600"
                onClick={onGeneratePassword}
              >
                Generate Password
              </button>}
            </div>
          </div>
        </Form>
      </div>}
    </DefaultLayout>
  )
}

export default AddUser