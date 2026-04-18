"use client"

import Editor from 'react-simple-wysiwyg'
import Form from "next/form"
import Link from "next/link"
import { useEffect, useState } from "react"
import DefaultLayout from "@/components/Layout/DefaultLayout"
import { IMPORTANCE, STATUS, TYPE } from "../../constant"
import Autocompleter from '@/components/Autocompleter'
import { useParams, useRouter } from 'next/navigation'
import { formatDate } from '@/util/dateformat'
import Comments from '@/components/Comments'
import { sendEmail } from '@/util/send-email'
import Image from 'next/image'
import Modal from '@/components/Modal'
import { convertToBase64 } from '@/util/image-to-base64'
import { useSession } from 'next-auth/react'
import { set } from 'mongoose'

const EditTicket = () => {
  const params = useParams()
  const router = useRouter()
  const { data }: any = useSession()

  const [ticketId, setTicketId] = useState('')
  const [departmentName, setDepartmentName] = useState('Ticket')
  const [issueNo, setIssueNo] = useState('0000')
  const [title, setTitle] = useState('')
  const [ticketStatus, setTicketStatus] = useState('')
  const [ticketImportance, setTicketImportance] = useState('')
  const [description, setDescription] = useState('')
  const [ticketType, setTicketType] = useState('')
  const [startDate, setStartDate] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [reportedDate, setReportedDate] = useState('')
  const [reportedBy, setReportedBy] = useState('')
  const [resolvedDate, setResolvedDate] = useState('')
  const [managers, setManagers] = useState<any[]>([])
  const [attachments, setAttachments] = useState<any[]>([])
  const [selectedImage, setSelectedImage] = useState<any>('')
  const [createdDate, setCreatedDate] = useState<any>(null)
  const [createdBy, setCreatedBy] = useState<any>(null)

  const [assigneeOptions, setAssigneeOptions] = useState<any[]>([])
  const [assignee, setAssignee] = useState<any>({
    label: "",
    value: ""
  })

  const [fieldErrors, setFieldErrors] = useState<string[]>([])

  const getTicket = async () => {
    const ticketApi = await fetch(`/api/tickets/issueNo/${params.ticketNo}`);
    const ticket = await ticketApi.json()    
    if (ticket) {
      setTicketId(ticket._id)
      setIssueNo(ticket.issueNo)
      setTitle(ticket.title)
      setTicketStatus(ticket.status)
      setTicketImportance(ticket.importance)
      setTicketType(ticket.type)
      setStartDate(ticket.startDate)
      setTargetDate(ticket.targetDate)
      setResolvedDate(ticket.resolvedDate)
      setReportedDate(ticket.createdDate)
      setDescription(ticket.description)
      setAttachments(ticket.attachments ?? [])
      setCreatedBy(ticket.createdBy)
      setCreatedDate(ticket.createdDate)

      const assigneeApi: any = await getUser(ticket.assigneeId)
      setAssignee(assigneeApi)

      const reportedByApi: any = await getUser(ticket.createdBy)
      setReportedBy(reportedByApi.label)
    }
  }
  
  /**
   * fetch reported by user info
   * @param ticket 
   * @returns 
   */
  const getUser = async (userId: string) => {
    try {
      const res = await fetch(`/api/users/${userId}`)
      const userApi = await res.json()
      if (userApi) {
        return {
          label: `${userApi.lastName}, ${userApi.firstName} ${userApi.middleName}`,
          value: userApi._id
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
    if (!ticketType) error.push("Please select Type.");
    // if (!assignee.value) error.push("Please select Assignee.");
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
          type: ticketType,
          description,
          startDate,
          targetDate,
          resolvedDate,
          assigneeId: assignee.value,
          attachments,
          createdBy,
          createdDate,
        }),
      });
      const apiData = await res.json();
      
      if (apiData.success) {
        const createdByData = await fetch(`/api/users/${createdBy}`);
        const createdByDataJson = await createdByData.json();

        const emails: any = [data?.user?.email, createdByDataJson.email];
        // get assignee user details to send email
        const assigneeRes = await fetch(`/api/users/${assignee.value}`);
        const assigneeData = await assigneeRes.json();
        if (assigneeData.email) {
          emails.push(assigneeData.email);
        }

        // get managers user details to send email
        if (managers.length > 0) {
          emails.push(...managers);
        }

        if (apiData.success) {
          const emailData = {
            emailTo: emails,
            subject: `#${issueNo}: ${title}`,
            message: `
              <p>Project: </p>
              <p>Ticket no: #${issueNo}</p>
              <p>Users: ${assignee.label ?? 'N/A'}</p>
              <p>Status: ${ticketStatus}</p>
              <p>Issue Content: ${description}</p>
              <p><a href="${location.origin}/login?callback=${window.location.href.replace("new", "edit/"+issueNo)}" target="_blank">View Ticket</a></p>
            `,
            qrcodeText: `${location.origin}/login?callback=${window.location.href.replace("new", "edit/"+issueNo)}`
          };
          await sendEmail(emailData);
          alert("Ticket has been updated successfully.")
          // setLoading(false)
          router.push(`/departments/${params.id}`)
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

  /**
   * fetch department info
   * @param deptId 
   */
  const getDepartment = async (deptId: any) => {
    try {
      const res: any = await fetch(`/api/departments/${deptId}`)
      const deptApi = await res.json()
      if (deptApi.success) {
        const managerIds = deptApi.data?.managers ?? []
        if (managerIds.length > 0) {
          const managerDetails = await Promise.all(
            managerIds.map(async (id: string) => {
              const userRes = await fetch(`/api/users/${id}`);
              return await userRes.json();
            })
          );
          setManagers(managerDetails.map((mgr: any) => mgr.email));
        }
        setDepartmentName(deptApi.data?.name ?? "")
      }
    } catch (error: any) {
      alert(error)
    }
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
    getDepartment(params.id)
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
          label: `${user.lastName}, ${user.firstName} ${user.middleName}`,
          value: user._id
        }
      ));
      if (options.length) {
        setAssigneeOptions(options);
      } else {
        setAssigneeOptions([]);
      }
    }, 0); // delay API until user stops typing
    
    return () => clearTimeout(delay); // cancel previous timers
  }, [assignee]);
  
  return (
    <>
      <DefaultLayout>
        <div className="flex flex-col gap-2">
          <h1 className="font-semibold text-2xl">{`${departmentName}-${issueNo}: ${title}`}</h1>
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
              <div className="flex flex-row gap-4 items-center w-20">
                <label className="whitespace-pre mr-3 font-semibold">Issue No.:</label>
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
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTicketStatus(e.target.value)}
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
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTicketImportance(e.target.value)}
                      className='border border-gray-100 p-2 rounded w-full outline-gray-200 bg-white'
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
                  <label className="whitespace-pre mr-3 font-semibold">Type:</label>
                  <div className="flex w-full">
                    <select 
                      value={ticketType}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTicketType(e.target.value)}
                      className='border border-gray-100 p-2 rounded w-full outline-gray-200 bg-white'
                    >
                      <option>Select...</option>
                      {
                        TYPE.map((stat: string) => (
                          <option key={stat} value={stat}>{stat}</option>
                        ))
                      }
                    </select>
                  </div>
                </div>
              </div>
              <div className='flex flex-row gap-4 w-full'> 
                <div className="flex flex-col gap-1 w-1/3">
                  <label className="whitespace-pre mr-3 font-semibold">Assignee:</label>
                  <div className="flex w-full">
                    <Autocompleter
                      options={assigneeOptions}
                      input={assignee.label}
                      setInput={setAssignee}
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1 w-1/3">
                  <label className="whitespace-pre mr-3 font-semibold">Start Date:</label>
                  <div className="flex w-full">
                    <input 
                      type="date" 
                      defaultValue={startDate}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStartDate(e.target.value)}
                      className="border border-gray-100 py-1 px-2 rounded w-full outline-gray-200 bg-white"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1 w-1/3">
                  <label className="whitespace-pre mr-3 font-semibold">Target Date:</label>
                  <div className="flex w-full">
                    <input 
                      type="date" 
                      defaultValue={targetDate}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTargetDate(e.target.value)}
                      className="border border-gray-100 py-1 px-2 rounded w-full outline-gray-200 bg-white"
                    />
                  </div>
                </div>
              </div>
              <div className='flex flex-row gap-4 w-full'> 
                <div className="flex flex-col gap-1 w-1/3">
                  <label className="whitespace-pre mr-3 font-semibold">Resolved Date:</label>
                  <div className="flex w-full">
                    <input 
                      type="date"
                      defaultValue={resolvedDate}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setResolvedDate(e.target.value)}
                      className="border border-gray-100 py-1 px-2 rounded w-full outline-gray-200 bg-white"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1 w-1/3">
                  <label className="whitespace-pre mr-3 font-semibold">Reported By:</label>
                  <div className="flex w-full">
                    {reportedBy}
                  </div>
                </div>
                <div className="flex flex-col gap-1 w-1/3">
                  <label className="whitespace-pre mr-3 font-semibold">Reported Date:</label>
                  <div className="flex w-full">
                    {formatDate(reportedDate)}
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
                  attachments.length > 0 && <div className="flex flex-wrap gap-2 pt-2">
                    {attachments.map((attachment: any, index: number) => {
                      return (
                        <div key={attachment} className="p-2 shadow-xl rounded-md border border-gray-100 w-60 flex items-center relative group">
                          <span onClick={() => handleImageViewer(attachment)} className="group-hover:flex hidden absolute inset-0 bg-gray-100/70 cursor-pointer justify-center items-center text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                            </svg>
                          </span>
                          <button>
                            <Image id={`attachment-${index}`} src={attachment} alt="Slide 1" width={800} height={400} className="w-full" />
                          </button>
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
            <div className="max-h-[600px]">
              <Image src={selectedImage} alt="Image Attachment Viewer" width="600" height="400" className="max-h-[500px] w-full object-contain" />
            </div>
          </Modal>
      }
    </>
  )

}

export default EditTicket
