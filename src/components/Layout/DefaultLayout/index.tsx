"use client"
import Loading from "../Loading";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import Header from "../Header";
import Menu from "../Menu";
import { useEffect } from "react";

type DefaultLayoutProps = {
  children: React.ReactNode
}

const DefaultLayout = ({children}: DefaultLayoutProps) => {
  const router = useRouter();
  const { data: session, status } = useSession();
  
  useEffect(() => {
    if (!session) router.push("/login");
  }, [session, router]);

  if (status === "loading") return <Loading />;
  return (
    <div className="flex flex-col bg-blue-50">
      <div className="flex flex-row">
        <Menu/>
        <main className="ml-[250px] w-full min-h-screen">
          <Header/>
          <div className="mx-auto w-full p-4 md:p-6 2xl:p-10 relative min-h-[calc(100vh-52px)]">
            <div className="absolute opacity-30 inset-0 bg-cover bg-center bg-[url('/images/06ec5c74-c4f8-4ecd-aa48-f57dce80e4a3.jpeg')]" />
            <div className="z-40 relative">
            {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default DefaultLayout;