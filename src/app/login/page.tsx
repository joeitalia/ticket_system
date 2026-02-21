"use client"

import Form from "next/form"
import { useRouter, useSearchParams } from "next/navigation";
import { ChangeEvent, useEffect, useState } from "react"
import { isValidEmail } from "../../util/email-validation"
import { signIn, useSession  } from "next-auth/react";
import Loading from "@/components/Layout/Loading";
import Image from "next/image";
import Link from "next/link";

const Login = () => {
  const router = useRouter();
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();
  const searchParams = useSearchParams();

  const callback = searchParams.get("callback") || "/";

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
        email,
        password,
        callbackUrl: searchParams.get("callback") || "/"
      });

      if (res?.error) {
        setLoading(false)
        return setError(res.error);
      } else {
        router.push(callback)
        return setLoading(false)
      }
    } catch {
      setLoading(false)
      return setError("Error found!")
    }
  }

  useEffect(() => {
    if (session) router.push(callback);
  }, [searchParams])

  if (loading) {
    return (<Loading/>)
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <Image src="/images/4ef5a33b-7039-4f26-932f-48ce9cdf479c.jpeg" alt="Logo" width={300} height={100} className="mx-auto"/>
      <Form
        action="#"
        formMethod="POST"
        id="login-form" 
        className="flex flex-col bg-white min-w-96 justify-center p-10 gap-y-4 shadow-lg border border-gray-100 rounded-lg">
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
        <div className="flex flex-col gap-2">
          <button
            className="flex-1 bg-blue-700 text-white text-lg py-2 rounded hover:bg-blue-500 cursor-pointer font-semibold"
            onClick={handleLogin}
          >
            Login
          </button>
          <Link href="/forgot-password" className="text-sm text-blue-700 hover:underline">
            Forgot Password?
          </Link>
        </div>
      </Form>
    </div>
  )
}

export default Login