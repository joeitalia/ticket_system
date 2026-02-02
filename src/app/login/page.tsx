"use client"

import Form from "next/form"
import { useRouter } from "next/navigation";
import { ChangeEvent, useState } from "react"
import { isValidEmail } from "../../util/email-validation"
import { signIn  } from "next-auth/react";
import Loading from "@/components/Layout/Loading";
import Image from "next/image";

const Login = () => {
  const router = useRouter();
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true)
    
    if (!email || !password) {
      setLoading(false)
      return setError("Please insert a valid email or password.")
    }
    if (!isValidEmail(email)) {
      setLoading(false)
      return setError("Please insert a valid email.")
    }

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setLoading(false)
        return setError(res.error);
      } else {
        router.push("/")
        return setLoading(false)
      }
    } catch {
      setLoading(false)
      return setError("Error found!")
    }
  }

  if (loading) {
    return (<Loading/>)
  }

  return (
    <div className="flex">
      <div id="login-content" className="flex bg-blue-50 h-screen w-3/4 items-center">
        <div className="w-full p-32">
          <h1 className="text-6xl text-center flex flex-col gap-y-3">
            <span>Web-based Ticketing</span>
            <span className="text-4xl">and</span>
            <span>QR Code Management</span>
            <span>System</span>
            <span className="text-4xl">for</span>
            <span>Nagase Philippines</span>
          </h1>
        </div>
      </div>
      <Form
        action="#"
        formMethod="POST"
        id="login-form" 
        className="flex flex-col bg-white min-w-96 justify-center p-10 gap-y-4 shadow-lg">
        <Image src="/images/4ef5a33b-7039-4f26-932f-48ce9cdf479c.jpeg" alt="Logo" width={300} height={100} className="mx-auto w-full"/>
        {error && (<span className="text-sm text-red-500">{error}</span>)}
        <div className="flex flex-col w-full">
          <label>Email:</label>
          <div className="flex w-full">
            <input 
              type="text" 
              className="border border-gray-100 py-2 px-3 rounded w-full outline-gray-200"
              defaultValue={email}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setEmail(e.target.value)
              }}
            />
          </div>
        </div>
        <div className="flex flex-col w-full">
          <label>Password:</label>
          <div className="flex w-full">
            <input 
              type="password" 
              className="border border-gray-100 py-2 px-3 rounded w-full outline-gray-200"
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setPassword(e.target.value)
              }}
            />
          </div>
        </div>
        <div className="flex flex-row gap-2">
          <button 
            className="flex-1 bg-blue-700 text-white text-lg py-2 rounded hover:bg-blue-500 cursor-pointer font-semibold"
            onClick={handleLogin}
          >
            Login
          </button>
        </div>
      </Form>
    </div>
  )
}

export default Login