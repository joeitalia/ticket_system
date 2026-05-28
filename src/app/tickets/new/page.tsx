/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import Editor from 'react-simple-wysiwyg'
import Form from "next/form"
import Link from "next/link"
import { useEffect, useState } from "react"
import DefaultLayout from "@/components/Layout/DefaultLayout"
import { IMPORTANCE } from '../constant'
import { useParams, useRouter } from 'next/navigation'
// import Autocompleter from '@/components/Autocompleter'
import { useSession } from 'next-auth/react'
import { sendEmail } from '@/util/send-email'
import Loading from '@/components/Layout/Loading'
import Image from 'next/image'
import { convertToBase64 } from '@/util/image-to-base64'
import Modal from '@/components/Modal'
import { formatDateDisplay, formatDateInput } from '@/util/dateformat'

const CreateTicket = () => {
  const router = useRouter();
  const { data }: any = useSession()
  const params = useParams();
  const [title, setTitle] = useState('')
  const [ticketImportance, setTicketImportance] = useState('')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [departments, setDepartments] = useState<any[]>([])
  const [department, setDepartment] = useState('')
  const [managers, setManagers] = useState<any[]>([])
  const [attachments, setAttachments] = useState<any[]>([])
  const [selectedImage, setSelectedImage] = useState<any>('')

  const [fieldErrors, setFieldErrors] = useState<string[]>([])

  /**
   * save new ticket
   */
  const onSaveTicket = async () => {
    setLoading(true)
    const error = [];
    if (!title) error.push("Please insert Title.");
    if (!ticketImportance) error.push("Please select Importance.");
    if (!department) error.push("Please select Department.");
    if (!startDate) error.push("Please select Start Date.");
    if (!targetDate) error.push("Please select Target Date.");
    if (!description) error.push("Please insert Issue Content.");
    if (error.length > 0) {
      setLoading(false);
      setFieldErrors(error);
      return
    }
    try {
      const getTotalTicket = await fetch(`/api/tickets/totalCount`);
      const totalTicketData = await getTotalTicket.json();
      const newTicketNumber = totalTicketData.returnValue + 1;  

      const res = await fetch(`/api/tickets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          issueNo: newTicketNumber,
          departmentId: department,
          status: "New",
          title, 
          importance: ticketImportance,
          description,
          startDate,
          targetDate,
          attachments,
          createdDate: new Date(),
          createdBy: data.user.id,
        }),
      });
      const apiData = await res.json();

      await saveNotification({
        message: `#${newTicketNumber}: ${title} created`,
        ticketId: newTicketNumber,
        status: "New",
        managers,
      });
      
      const emails: string[] = [data.user.email];

      // / get managers user details to send email
      if (managers.length > 0) {
        emails.push(...managers.map((m) => m.email));
      }
      
      if (apiData.success) {
        const data = {
          emailTo: emails,
          subject: `#${newTicketNumber}: ${title}`,
          message: `
            <p>Project: </p>
            <p>Ticket no: #${newTicketNumber}</p>
            <p>Importance: ${ticketImportance}</p>
            <p>Issue Content: ${description}</p>
            <p><a href="${location.origin}/login?callback=${location.href.replace("new", "edit/"+newTicketNumber)}" target="_blank">View Ticket</a></p>
          `,
          qrcodeText: `${location.origin}/login?callback=${location.href.replace("new", "edit/"+newTicketNumber)}`
        };
        await sendEmail(data);
        alert("New ticket has been created successfully.")
        setLoading(false)
        router.push(`/tickets`)
      } else {
        throw "Failed to create new Ticket."
      }
    } catch (error: any) {
      setLoading(false)
      alert(error)
    }
  }

  /**
   * fetch created by user info
   * @param ticket 
   * @returns 
   */
  const getUserByDepartment = async (departmentId: string) => {
    try {
      const res = await fetch(`/api/users/department/${departmentId}`)
      const userApi = await res.json()
      if (userApi) {
        return userApi.map((user: any) => {
          return {
            label: `${user.firstName} ${user.middleName} ${user.lastName}`,
            value: user._id,
            email: user.email
          }
        })
      }
    } catch (error: any) {
      console.error(error)
      return []
    }
    return []
  }

  const saveNotification = async (notification: any) => {
    notification.managers.forEach(async (mg: any) => {
      try {
        await fetch(`/api/notifications`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ticketId: notification.ticketId,
            message: notification.message,
            status: notification.status,
            notifiedUser: mg.email,
            read: false,
          }),
        });
      } catch (error) {
        console.error("Failed to save notification:", error);
      }
    });
  }

  const handleAttachment = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const base64Image = await convertToBase64(file);
    setAttachments(prevState => [...prevState, base64Image])
    e.target.value = ""
  }
  
  const handleRemoveImage = (e: React.MouseEvent<HTMLButtonElement>, i: number) => {
    setAttachments(prev =>
      prev.filter((_, index) => index !== i)
    );
  }
  
  const handleImageViewer = (attachment: string) => {
    setSelectedImage(attachment)
  }

  const handleImportanceSelect = (value: string) => {
    setTicketImportance(value);
    const tDate = new Date();
    
    if (value === "Critical") tDate.setDate(tDate.getDate() + 1); // 1 day
    else if (value === "High") tDate.setDate(tDate.getDate() + 1); // 1 days
    else if (value === "Medium") tDate.setDate(tDate.getDate() + 2); // 2 days
    else if (value === "Low") tDate.setDate(tDate.getDate() + 3); // 3 days
    
    let formattedTargetDate = formatDateInput(tDate.toLocaleDateString('en-GB'));
    if (!value) formattedTargetDate = ''; 
    setTargetDate(formattedTargetDate);
  }

  const handleDepartmentSelect = async (value: string) => {
    setDepartment(value);
    const userManagers = await getUserByDepartment(value)
    setManagers(userManagers)
  }

  useEffect(() => {
    // set start date to current date
    const stDate = new Date();
    const formattedStartDate = formatDateDisplay(stDate.toString());
    setStartDate(formattedStartDate);

    fetch("/api/departments")
      .then((res) => res.json())
      .then(setDepartments);
  }, []);
  
  return (
    <>
      <DefaultLayout>
        {loading && <Loading />}
        {!loading && <div className="flex flex-col gap-2">
          <h1 className="font-semibold text-2xl">Create New Ticket</h1>
          <Form
            action="#"
            formMethod="POST"
            id="login-form" 
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
              <div className="flex flex-col gap-1">
                <label className="whitespace-pre mr-3 font-semibold">Title:</label>
                <div className="flex w-full">
                  <input 
                    defaultValue={title}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
                    type="text" 
                    className="border border-gray-100 py-1.5 px-2 rounded w-full outline-gray-200 bg-white"
                  />
                </div>
              </div>
              <div className='flex flex-row gap-4 w-full'>
                <div className="flex flex-col gap-1 flex-1">
                  <label className="whitespace-pre mr-3 font-semibold">Importance:</label>
                  <div className="flex w-full">
                    <select 
                      defaultValue={ticketImportance}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleImportanceSelect(e.target.value)}
                      className='border border-gray-100 p-2 rounded w-full outline-gray-200 bg-white'
                    >
                      <option value=''>Select...</option>
                      {
                        IMPORTANCE.map((stat: string) => (
                          <option key={stat} value={stat}>{stat}</option>
                        ))
                      }
                    </select>
                  </div>
                </div>
                <div className="flex flex-col gap-1 flex-1">
                  <label className="whitespace-pre mr-3 font-semibold">Department:</label>
                  <div className="flex w-full">
                    <select 
                      defaultValue={department}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleDepartmentSelect(e.target.value)}
                      className='border border-gray-100 p-2 rounded w-full outline-gray-200 bg-white'
                    >
                      <option value=''>Select...</option>
                      {
                        departments.map((dept: any) => (
                          <option key={dept._id} value={dept._id}>{dept.name}</option>
                        ))
                      }
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex flex-row gap-4 w-full">
                <div className="flex flex-col gap-1 flex-1">
                  <label className="whitespace-pre mr-3 font-semibold">Start Date:</label>
                  <div className="flex w-full">
                    <input
                      type="date"
                      disabled={true} 
                      defaultValue={startDate}
                      className="border border-gray-100 py-1 px-2 rounded w-full outline-gray-200 bg-white disabled:bg-gray-100 h-9"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1 flex-1">
                  <label className="whitespace-pre mr-3 font-semibold">Target Date:</label>
                  <div className="flex w-full">
                    <input
                      type="date"
                      defaultValue={targetDate}
                      disabled={true}
                      className="border border-gray-100 py-1 px-2 rounded w-full outline-gray-200 bg-white disabled:bg-gray-100 h-9"
                    />
                  </div>
                </div>
              </div>
              <div className="flex flex-col w-full gap-1">
                <label className="w-1/6 font-semibold">Issue Content:</label>
                <div>
                  <Editor 
                    value={description} 
                    onChange={(e: any) => setDescription(e.target.value)}
                    className="border border-gray-100 py-1 px-2 rounded w-full outline-gray-200 bg-white p-4 min-h-40"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="whitespace-pre mr-3 font-semibold">Attachment:</label>
                <div className="flex flex-col w-full">
                  <input
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleAttachment(e)}
                    type="file" 
                    className="border border-gray-100 py-1.5 px-2 rounded w-full outline-gray-200 bg-white"
                  />
                </div>
                {
                  attachments.length > 0 && <div className="grid 2xl:grid-cols-7 xl:grid-cols-6 lg:grid-cols-5 md:grid-cols-4 sm:grid-cols-3 grid-cols-1 gap-2 pt-2">
                    {attachments.map((attachment: any, index: number) => {
                      return (
                        <div key={attachment} className="p-2 shadow-xl rounded-md border border-gray-100 w-full max-h-60 flex items-center relative group">
                          <span onClick={() => handleImageViewer(attachment)} className="group-hover:flex hidden absolute inset-0 bg-gray-100/70 cursor-pointer justify-center items-center text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                            </svg>
                          </span>
                          <div className="h-full w-full overflow-hidden flex items-center">
                            <Image id={`attachment-${index}`} src={attachment} alt="Slide 1" width={800} height={400} className="w-full" />
                          </div>
                          <button className="rounded-full bg-red-400 p-1 text-white font-medium absolute -top-1 -right-1 border border-white cursor-pointer" onClick={(event: React.MouseEvent<HTMLButtonElement>) => handleRemoveImage(event, index)}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      )
                    })}
                  </div>
                }
              </div>
              <div className="flex flex-row gap-3 mt-5">
                <button
                  type="button"
                  className="bg-green-700 text-white font-semibold px-10 py-1 rounded border border-green-700 cursor-pointer hover:bg-green-600"
                  onClick={onSaveTicket}
                >
                  Save
                </button>
                <Link 
                  href={`/departments/${params.id}`} 
                  className="bg-white text-gray-500 font-semibold px-10 py-1 rounded border border-gray-300 cursor-pointer hover:bg-gray-100"
                >
                  Back
                </Link>
              </div>
            </div>
          </Form>
        </div>}
      </DefaultLayout>
      {
        selectedImage &&
          <Modal onClose={() => setSelectedImage('')}>
            <div className="max-h-[600px] p-4">
              <Image src={selectedImage} alt="Image Attachment Viewer" width="600" height="400" className="max-h-[500px] w-full object-contain" />
            </div>
          </Modal>
      }
    </>
  )
}

export default CreateTicket