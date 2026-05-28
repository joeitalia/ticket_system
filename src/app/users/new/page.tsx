"use client"

import DefaultLayout from "@/components/Layout/DefaultLayout"
import { isValidEmail } from "@/util/email-validation"
import { useSession } from "next-auth/react"
import Form from "next/form"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation";
import { generatePassword } from "@/util/generate-password"
import { hashText } from "@/util/hash"
import { userTypeList } from "@/app/constant"

const AddUser = () => {
  const { data } = useSession()
  const router = useRouter()

  const [lastName, setLastName] = useState("")
  const [firstName, setFirstName] = useState("")
  const [middleName, setMiddleName] = useState("")
  const [department, setDepartment] = useState("")
  const [email, setEmail] = useState("")
  const [userType, setUserType] = useState("")
  const [password, setPassword] = useState("")
  const [isAdmin, setIsAdmin] = useState(false)
  const [departmentList, setDepartmentList] = useState([])
  const [fieldErrors, setFieldErrors] = useState<string[]>([])

  /**
   * validate and save new user
   */
  const onAddUser = async () => {
    const errors: any = []
    try {
      if (!lastName) errors.push("Please insert Last Name.")
      if (!firstName) errors.push("Please insert First Name.")
      if (!department) errors.push("Please select Department.")
      if (!userType) errors.push("Please select User Type.")
      if (!email) {
        errors.push("Please insert Email Address.")
      } else if(!isValidEmail(email)) errors.push("Please insert a valid Email Address.")
      if (!password) errors.push("Please insert password.")

      if (errors.length == 0) {
        // check if email is not existing
        const res:any = await fetch(`/api/users/email/${email}`)
        const userData = await res.json();
        if (userData.data) {
          errors.push("Email Address is already existing.")
        } else {
          const saveUserRes = await fetch("/api/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              firstName, 
              lastName,
              middleName,
              departmentId: department,
              userType,
              email,
              password: await hashText(password),
              isAdmin,
              createdBy: data?.user?.email,
              createdDate: new Date()
            }),
          })
          const userApiData = await saveUserRes.json();
          if (userApiData.success) {
            alert("New user has been added successfully.")
            router.push("/users")
          } else {
            throw "Failed to add new User."
          }
        }
      }
      setFieldErrors(errors)
    } catch (error: any) {
      setFieldErrors([])
      alert(error)
    }
  }

  useEffect(() => {
    fetch("/api/departments")
      .then((res) => res.json())
      .then(setDepartmentList);
    const initialPassword = generatePassword();
    setPassword(initialPassword);
  }, [])

  return (
    <DefaultLayout>
      <div className="flex flex-col gap-2">
        <h1 className="font-semibold text-2xl">Add User</h1>
        <Form
        action="#"
        formMethod="POST"
        id="addUser-form" 
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
                <label className="font-semibold">User Type:</label>
                <div className="flex w-full">
                  <select
                    defaultValue={userType}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setUserType(e.target.value)}
                    className='border border-gray-100 p-2 rounded w-full outline-gray-200 bg-white'
                  >
                    <option>Select...</option>
                    {
                      userTypeList.map((type: string, i: number) => (
                        <option key={`userType-${i}`} value={type}>{type}</option>
                      ))
                    }
                  </select>
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
                    type="text" 
                    className="border border-gray-100 px-2 py-1.5 rounded w-full outline-gray-200 bg-white"
                  />
                </div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    onChange={() => {
                      setIsAdmin(!isAdmin);
                    }}
                  />
                  &nbsp; Administrator
                </label>
              </div>
              <div className="flex flex-col w-full gap-1">
                <label className="font-semibold">Password:</label>
                <div className="flex w-full">
                  <input
                    defaultValue={password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                    type="text"
                    className="border border-gray-100 px-2 py-1.5 rounded w-full outline-gray-200 bg-white"
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-row gap-3 mt-5">
              <button
                className="bg-green-700 text-white font-semibold px-10 py-1 rounded border border-green-700 cursor-pointer hover:bg-green-600"
                onClick={onAddUser}
              >
                Save
              </button>
              <Link
                href={'/users'} 
                className="bg-white text-gray-500 font-semibold px-10 py-1 rounded border border-gray-300 cursor-pointer hover:bg-gray-100"
              >
                Back
              </Link>
            </div>
          </div>
        </Form>
      </div>
    </DefaultLayout>
  )
}

export default AddUser