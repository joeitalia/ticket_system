"use client"
import { signOut, useSession } from "next-auth/react";
import Link from "next/link"
// import { useRef } from "react";

const Menu = () => {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return null; // or a skeleton
  }

  if (!session?.user) {
    return null; // or redirect to login
  }

  const user:any = session.user;

  // const menuRef = useRef<HTMLUListElement>(null)

  const handleLogout = () => {
    signOut({
      callbackUrl: "/login"
    })
  }

  // const showSubMenu = (id: string, target: HTMLElement) => {
  //   if (menuRef.current?.id == id) {
  //     // ["bg-gray-200", "rounded", "text-black"].forEach((cls: string) => target.classList.toggle(cls))
  //     target.querySelector(`svg#${id}-svg`)?.classList.toggle("rotate-90")
  //     menuRef.current?.classList?.toggle("hidden")
  //   }
  // }

  return (
    <div className="w-[250] bg-gray-900 h-full border-r p-5 text-gray-400 fixed flex flex-col">
      <div className="text-center border-b border-gray-400 pb-3">
        <span>Hi {`${user.lastName}, ${user.firstName} ${user.middleName}`}</span>
      </div>
      <ul className="pt-3">
        <li>
          <Link href={"/"} className="p-2 block hover:bg-gray-200 hover:rounded hover:text-black">Dashboard</Link>
        </li>
        <li>
          <Link href={"/tickets"} className="p-2 block hover:bg-gray-200 hover:rounded hover:text-black">Tickets</Link>
        </li>
        {
          user?.userType && (
            <>
              <li>
                <Link href={"/departments"} className="p-2 block hover:bg-gray-200 hover:rounded hover:text-black">Departments</Link>
              </li>
              <li>
                <Link href={"/users"} className="p-2 block hover:bg-gray-200 hover:rounded hover:text-black">Users</Link>
              </li>
            </>
          )
        }
        {/* <li>
          <span 
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => showSubMenu('ticket', e.target as HTMLElement)}
            className="p-2 flex flex-row justify-between hover:bg-gray-200 hover:rounded hover:text-black cursor-pointer items-center"
          >
            <span>Ticket</span>
            <svg id="ticket-svg" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-4 transform">
              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
          </span>
          <ul 
            className="hidden" 
            id="ticket"
            ref={menuRef}
          >
            <li>
              <Link href={"/tickets"} className="p-2 flex hover:bg-gray-200 hover:rounded hover:text-black items-center">
                <span className="rounded border border-gray-400 block-inline p-0.5 mr-2"></span>
                <span>Create Ticket</span>
              </Link>
            </li>
            <li>
              <Link href={"/view-tickets"} className="p-2 flex hover:bg-gray-200 hover:rounded hover:text-black items-center">
                <span className="rounded border border-gray-400 block-inline p-0.5 mr-2"></span>
                <span>View Tickets</span>
              </Link>
            </li>
          </ul>
        </li> */}
        <li>
          <Link href={"/login"} onClick={handleLogout} className="p-2 block hover:bg-gray-200 hover:rounded hover:text-black">Logout</Link>
        </li>
      </ul>
    </div>
  )
}

export default Menu