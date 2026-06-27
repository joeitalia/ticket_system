"use client"

import Editor from 'react-simple-wysiwyg'
import Form from "next/form"
import Link from "next/link"
import { useEffect, useState } from "react"
import DefaultLayout from "@/components/Layout/DefaultLayout"
import { IMPORTANCE, STATUS } from "../../constant"
import Autocompleter from '@/components/Autocompleter'
import { useParams, useRouter } from 'next/navigation'
import { formatDateDisplay } from '@/util/dateformat'
import Comments from '@/components/Comments'
import { sendEmail } from '@/util/send-email'
import Image from 'next/image'
import Modal from '@/components/Modal'
import { convertToBase64 } from '@/util/image-to-base64'
import { useSession } from 'next-auth/react'

const EditTicket = () => {
  const params = useParams()
  const router = useRouter()
  const { data }: any = useSession()

  const [ticketId, setTicketId] = useState('')
  const [issueNo, setIssueNo] = useState('0000')
  const [title, setTitle] = useState('')
  const [ticketStatus, setTicketStatus] = useState('')
  const [ticketImportance, setTicketImportance] = useState('')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [resolvedDate, setResolvedDate] = useState('')
  const [managers, setManagers] = useState<any[]>([])
  const [departments, setDepartments] = useState<any[]>([])
  const [department, setDepartment] = useState<any>('')
  const [attachments, setAttachments] = useState<any[]>([])
  const [selectedImage, setSelectedImage] = useState<any>('')
  const [createdBy, setCreatedBy] = useState<any>({
    label: "",
    value: "",
    email: "",
  })

  const [assigneeOptions, setAssigneeOptions] = useState<any[]>([])
  const [assignee, setAssignee] = useState<any>({
    label: "",
    value: "",
    email: "",
  })

  const [fieldErrors, setFieldErrors] = useState<string[]>([])

  const getTicket = async () => {
    const ticketApi = await fetch(`/api/tickets/issueNo/${params.ticketNo}`);
    const ticket = await ticketApi.json()    
    if (ticket) {
      setTicketId(ticket._id)
      setIssueNo(ticket.issueNo)
      setTitle(ticket.title)
      setTicketStatus(ticket.status ?? 'New')
      setTicketImportance(ticket.importance)
      setStartDate(ticket.startDate)
      setTargetDate(ticket.targetDate)
      setDescription(ticket.description)
      setDepartment(ticket.departmentId)
      setAttachments(ticket.attachments ?? [])

      if (ticket.assigneeId) {
        const assigneeApi: any = await getUser(ticket.assigneeId);
        setAssignee(assigneeApi);
      }
      
      if (ticket.createdBy) {
        const createdByApi: any = await getUser(ticket.createdBy)
        setCreatedBy(createdByApi)
      }

      if (ticket.departmentId) {
        const userManagers = await getUserByDepartment(ticket.departmentId, true)
        setManagers(userManagers)
      }
    }
  }
  
  /**
   * fetch created by user info
   * @param ticket 
   * @returns 
   */
  const getUserByDepartment = async (departmentId: string, isManager: boolean = false) => {
    try {
      const res = await fetch(`/api/users/department/${departmentId}?isManager=${isManager}`)
      const userApi = await res.json()
      if (userApi.data) {
        return userApi?.data?.map((user: any) => {
          return {
            label: `${user.firstName} ${user.middleName} ${user.lastName}`,
            value: user._id,
            email: user.email
          }
        }) ?? [];
      }
    } catch (error: any) {
      console.error(error)
      return []
    }
    return []
  }

  /**
   * fetch created by user info
   * @param ticket 
   * @returns 
   */
  const getUser = async (userId: string) => {
    try {
      const res = await fetch(`/api/users/${userId}`)
      const userApi = await res.json()
      if (userApi) {
        return {
          label: `${userApi.firstName} ${userApi.middleName} ${userApi.lastName}`,
          value: userApi._id,
          email: userApi.email
        }
      }
    } catch (error: any) {
      console.error(error)
      return ''
    }
    return ''
  }

  const onUpdateTicket = async () => {
    const error = [];
    if (!title) error.push("Please insert Title.");
    if (!ticketStatus) error.push("Please select Status.");
    if (!ticketImportance) error.push("Please select Importance.");
    if (!assignee.value) error.push("Please select Assignee.");
    if (!startDate) error.push("Please select Start Date.");
    if (!targetDate) error.push("Please select Target Date.");
    if (!description) error.push("Please insert Issue Content.");
    if (error.length > 0) {
      setFieldErrors(error);
      return
    }
    
    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          departmentId: params.id,
          title,
          status: ticketStatus, 
          importance: ticketImportance,
          description,
          startDate: startDate,
          targetDate: targetDate,
          resolvedDate: resolvedDate,
          assigneeId: assignee.value,
          attachments,
        }),
      });
      const apiData = await res.json();
      
      await saveNotification({
        message: `#${ticketId}: ${title} created`,
        ticketId,
        status: ticketStatus,
        managers,
      });

      if (apiData.success) {
        const emails: any = [data?.user?.email, createdBy?.email];

        // get assignee user details to send email
        if (assignee.email) emails.push(assignee.email);

        // get managers user details to send email
        if (managers.length > 0) {
          emails.push(...managers.map((m) => m.email));
        }

        if (apiData.success) {
          const emailData = {
            emailTo: emails,
            subject: `#${issueNo}: ${title}`,
            message: `
              <p>Project: </p>
              <p>Ticket no: #${issueNo}</p>
              <p>Users: ${assignee?.label ?? 'N/A'}</p>
              <p>Status: ${ticketStatus}</p>
              <p>Issue Content: ${description}</p>
              <p><a href="${location.origin}/login?callback=${window.location.href.replace("new", "edit/"+issueNo)}" target="_blank">View Ticket</a></p>
            `,
            qrcodeText: `${location.origin}/login?callback=${window.location.href.replace("new", "edit/"+issueNo)}`
          };
          await sendEmail(emailData);
          alert("Ticket has been updated successfully.")
          // setLoading(false)
          router.push(`/tickets`)
        } else {
          throw "Failed to update Ticket."
        }
      } else {
        throw "Failed to update Ticket."
      }
    } catch (error: any) {
      alert(error)
    }
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
            dateAdded: new Date().toISOString(),
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

  useEffect(() => {
    getTicket()
    fetch("/api/departments")
      .then((res) => res.json())
      .then(setDepartments);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!assignee?.label?.trim()) {
      setAssigneeOptions([]);
      return;
    }
    const delay = setTimeout(async () => {
      const res = await fetch(`/api/users/search/${assignee.label}`);
      const data = await res.json();
      const options = data.map((user: any) => (
        {
          label: `${user.firstName} ${user.middleName} ${user.lastName}`,
          value: user._id
        }
      ));

      const filteredOptions = options.filter((option: any) =>  assignee.value !== option.value);
      if (filteredOptions.length) {
        setAssigneeOptions(filteredOptions);
      } else {
        setAssigneeOptions([]);
      }
    }, 0); // delay API until user stops typing
    
    return () => clearTimeout(delay); // cancel previous timers
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignee]);
  
  return (
    <>
      <DefaultLayout>
        <div className="flex flex-col gap-2">
          <h1 className="font-semibold text-2xl">{`TN-${issueNo}: ${title}`}</h1>
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
              <div className="flex flex-row gap-1 items-center w-20">
                <label className="whitespace-pre mr-2 font-semibold">Issue No.:</label>
                <div className="flex w-full font-semibold">
                  {issueNo}
                </div>
              </div>
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
                <div className="flex flex-col gap-1 w-1/3">
                  <label className="whitespace-pre mr-3 font-semibold">Status:</label>
                  <div className="flex w-full">
                    <select 
                      value={ticketStatus}
                      disabled={!(data?.user?.isAdmin || [createdBy.value, assignee.value].includes(data?.user?._id) || managers?.map((m) => m.email).includes(data?.user?.email))}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                        if (e.target.value === "Resolved") {
                          const today = new Date();
                          const formattedDate = formatDateDisplay(today.toISOString());
                          setResolvedDate(formattedDate);
                        } else {
                          setResolvedDate('');
                        }
                        setTicketStatus(e.target.value)
                      }}
                      className='border border-gray-100 p-2 rounded w-full outline-gray-200 bg-white'
                    >
                      <option>Select...</option>
                      {
                        STATUS.map((stat: string) => (
                          <option key={stat} value={stat}>{stat}</option>
                        ))
                      }
                    </select>
                  </div>
                </div>
                <div className="flex flex-col gap-1 w-1/3">
                  <label className="whitespace-pre mr-3 font-semibold">Importance:</label>
                  <div className="flex w-full">
                    <select 
                      value={ticketImportance}
                      disabled
                      className='border border-gray-100 p-2 rounded w-full outline-gray-200 bg-white disabled:bg-gray-200 disabled:cursor-not-allowed'
                    >
                      <option>Select...</option>
                      {
                        IMPORTANCE.map((stat: string) => (
                          <option key={stat} value={stat}>{stat}</option>
                        ))
                      }
                    </select>
                  </div>
                </div>
                <div className="flex flex-col gap-1 w-1/3">
                  <label className="whitespace-pre mr-3 font-semibold">Department:</label>
                  <div className="flex w-full">
                    <select 
                      disabled
                      value={department}
                      className='border border-gray-100 p-2 rounded w-full outline-gray-200 bg-white disabled:bg-gray-200 disabled:cursor-not-allowed'
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
              <div className='flex flex-row gap-4 w-full'> 
                <div className="flex flex-col gap-1 w-1/3">
                  <label className="whitespace-pre mr-3 font-semibold">Resolved Date:</label>
                  <div className="flex w-full">
                    <input 
                      type="date"
                      disabled
                      defaultValue={resolvedDate}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setResolvedDate(e.target.value)}
                      className="border border-gray-100 py-1 px-2 rounded w-full outline-gray-200 bg-white disabled:bg-gray-200 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1 w-1/3">
                  <label className="whitespace-pre mr-3 font-semibold">Start Date:</label>
                  <div className="flex w-full">
                    <input 
                      type="date" 
                      disabled
                      defaultValue={startDate}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStartDate(e.target.value)}
                      className="border border-gray-100 py-1 px-2 rounded w-full outline-gray-200 bg-white disabled:bg-gray-200 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1 w-1/3">
                  <label className="whitespace-pre mr-3 font-semibold">Target Date:</label>
                  <div className="flex w-full">
                    <input 
                      type="date" 
                      disabled
                      defaultValue={targetDate}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTargetDate(e.target.value)}
                      className="border border-gray-100 py-1 px-2 rounded w-full outline-gray-200 bg-white disabled:bg-gray-200 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
              <div className='flex flex-row gap-4 w-full'>
                {data?.user?.userType !== "User" && 
                  <div className="flex flex-col gap-1 w-1/3">
                    <label className="whitespace-pre mr-3 font-semibold">Assignee:</label>
                    <div className="flex gap-x-1 w-full">
                      <Autocompleter
                        disabled={!data?.user?.isAdmin || data?.user?._id !== createdBy.value || !managers?.map((m) => m.email).includes(data?.user?.email)}
                        options={assigneeOptions}
                        input={assignee.label}
                        setInput={setAssignee}
                      />
                    </div>
                  </div>
                }
                <div className="flex flex-col gap-1 w-1/3">
                  <label className="whitespace-pre mr-3 font-semibold">Reported By:</label>
                  <div className="flex w-full flex-1 items-center">
                    {createdBy.label}
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
                  className="bg-green-700 text-white font-semibold px-10 py-1 rounded border border-green-700 cursor-pointer hover:bg-green-600"
                  onClick={onUpdateTicket}
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
          {/* Comments Component */}
          <Comments ticketId={ticketId} managers={managers} />
        </div>
      </DefaultLayout>
      {
        selectedImage &&
          <Modal onClose={() => setSelectedImage('')}>
            <div className="max-h-full">
              <Image src={selectedImage} alt="Image Attachment Viewer" width="600" height="400" className="max-h-[95vh] w-full object-contain" />
            </div>
          </Modal>
      }
    </>
  )

}

export default EditTicket
