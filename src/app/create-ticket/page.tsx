"use client"
import SessionLayout from "@/components/Layout/SessionLayout"
import Form from "next/form"

const CreateTicket = () => {

  return (
    <SessionLayout>
      <Form
        action="#"
        formMethod="POST"
        id="login-form" 
        className="flex flex-col bg-white min-w-96 justify-center py-5 px-10 shadow-lg">
        <h2 className="font-semibold text-lg">Create New Ticket</h2>
        <div className="mt-5 flex flex-col gap-y-4">
          <div className="flex flex-col w-full gap-1">
            <label className="w-1/6">Name:</label>
            <div className="flex w-full">
              <input 
                type="text" 
                className="border border-gray-100 py-1 px-2 rounded w-full outline-gray-200 bg-white"
              />
            </div>
          </div>
          <div className="flex flex-col w-full gap-1">
            <label className="w-1/6">Description:</label>
            <div className="flex w-full">
              <textarea
                className="border border-gray-100 py-1 px-2 rounded w-full outline-gray-200 bg-white"
              ></textarea>
            </div>
          </div>
          <div className="flex flex-col w-full gap-1">
            <label className="w-1/6">Target Date:</label>
            <div className="flex w-full">
              <input 
                type="text" 
                className="border border-gray-100 py-1 px-2 rounded w-full outline-gray-200 bg-white"
              />
            </div>
          </div>
          <div className="flex flex-col w-full gap-1">
            <label className="w-1/6">Assignee:</label>
            <div className="flex w-full">
              <input 
                type="text" 
                className="border border-gray-100 py-1 px-2 rounded w-full outline-gray-200 bg-white"
              />
            </div>
          </div>
          <div className="flex flex-col w-full gap-1">
            <label className="w-1/6">Resolved by:</label>
            <div className="flex w-full">
              <input 
                type="text" 
                className="border border-gray-100 py-1 px-2 rounded w-full outline-gray-200 bg-white"
              />
            </div>
          </div>
          <div className="flex flex-row gap-3">
            <button className="bg-green-700 text-white font-semibold px-10 py-1 rounded border border-green-700 cursor-pointer hover:bg-green-600">Save</button>
            <button className="bg-white text-gray-500 font-semibold px-10 py-1 rounded border border-gray-300 cursor-pointer hover:bg-gray-100">Clear</button>
          </div>
        </div>
      </Form>
    </SessionLayout>
  )

}

export default CreateTicket