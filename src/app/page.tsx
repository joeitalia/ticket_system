"use client"

import DefaultLayout from "@/components/Layout/DefaultLayout"

export default function Home() {
  return (
    <DefaultLayout>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="flex flex-col flex-1 min-w-1/2">
          <div className="flex flex-row justify-between">
            <h1 className="font-semibold text-xl">Latest Tickets</h1>
          </div>
          <div className="bg-white px-2 py-3 mt-2 rounded-lg shadow-lg text-sm">For construction</div>
        </div>
        <div className="flex flex-col flex-1 min-w-1/2">
          <div className="flex flex-row justify-between">
            <h1 className="font-semibold text-xl">Latest Tickets</h1>
          </div>
          <div className="bg-white px-2 py-3 mt-2 rounded-lg shadow-lg text-sm">For construction</div>
        </div>
        <div className="flex flex-col flex-1 min-w-1/2">
          <div className="flex flex-row justify-between">
            <h1 className="font-semibold text-xl">Latest Tickets</h1>
          </div>
          <div className="bg-white px-2 py-3 mt-2 rounded-lg shadow-lg text-sm">For construction</div>
        </div>
      </div>
    </DefaultLayout>
  );
}
