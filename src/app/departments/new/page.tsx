"use client"

import "react-date-picker/dist/DatePicker.css"; // import CSS
import "react-calendar/dist/Calendar.css";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

import DefaultLayout from "@/components/Layout/DefaultLayout";
import Form from "next/form"
import Link from "next/link";
import Editor from 'react-simple-wysiwyg'
import Autocompleter from "@/components/Autocompleter";

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

const AddDepartment = () => {
  const { data } = useSession()
  const router = useRouter()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [manager, setManager] = useState<any>({
    label: "",
    value: ""
  })
  const [managers, setManagers] = useState<string[]>([])
  const [managerOptions, setManagerOptions] = useState<any[]>([])
  const [fieldErrors, setFieldErrors] = useState<any>([])
  
  // set description to state
  const onChangeDescription = (e: any) => {
    setDescription(e.target.value)
  }

  /**
   * save new project
   */
  const onSaveDepartment = async () => {
    const error = [];
    if (!name || name.trim().length === 0) {
      error.push("Please insert Department Name.")
    }
    if (managers.length === 0) {
      error.push("Please add at least one Department Manager/POC.")
    }
    if (error.length > 0) {
      setFieldErrors(error)
      return
    }

    try {
      const res = await fetch("/api/departments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name, 
          description, 
          managers: managers.map((mgr: any) => mgr.value),
          createdBy: data?.user?.email,
          createdDate: new Date()
        }),
      });
      const apiData = await res.json();
      
      if (apiData.success) {
        alert("New department has been saved successfully.")
        router.push("/departments")
      } else {
        throw "Failed to add new Department."
      }
    } catch (error: any) {
      alert(error)
    }
  }

  const addManager = () => {
    if (manager && manager.label?.length > 0) {
      setManagers([...managers, manager])
      setManager({
        label: "",
        value: ""
      })
    }
  }

  useEffect(() => {
      if (!manager?.label?.trim()) {
        setManagerOptions([]);
        return;
      }
      const delay = setTimeout(async () => {
        const res = await fetch(`/api/users/search/${manager.label}`);
        const data = await res.json();
        const options = data.map((user: any) => (
          {
            label: `${user.lastName}, ${user.firstName} ${user.middleName}`,
            value: user._id
          }
        ));
        const filteredOptions = options.filter((option: any) => 
          !managers.some((mgrId: any) => mgrId.value === option.value)
        );
        if (filteredOptions.length) {
          setManagerOptions(filteredOptions);
        } else {
          setManagerOptions([]);
        }
      }, 300); // delay API until user stops typing
      
      return () => clearTimeout(delay); // cancel previous timers
    }, [manager, managers]);

  return (
    <DefaultLayout>
      <div className="flex flex-col gap-2">
        <h1 className="font-semibold text-2xl">Add Department</h1>
        <Form
        action="#"
        formMethod="POST"
        id="login-form" 
        className="flex flex-col bg-white min-w-96 justify-center py-5 px-10 shadow-lg rounded-lg text-sm">
          <div className="mt-5 flex flex-col gap-y-4">
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
            <div className="flex flex-col w-full gap-1">
              <label className="w-1/6 font-semibold">Name:</label>
              <div className="flex w-full">
                <input 
                  defaultValue={name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                  type="text" 
                  className="border border-gray-100 py-1 px-2 rounded w-full outline-gray-200 bg-white"
                />
              </div>
            </div>
            <div className="flex flex-col w-full gap-1 font-semibold">
              <label className="w-1/6">Description:</label>
              <div>
                <Editor 
                  value={description} 
                  onChange={onChangeDescription} 
                  className="border border-gray-100 py-1 px-2 rounded w-full outline-gray-200 bg-white"
                />
              </div>
            </div>
            <div className="flex flex-col w-full gap-1">
              <label className="w-1/6 font-semibold">Add Manager(s):</label>
              <div className="flex w-full gap-2">
                <Autocompleter
                  options={managerOptions}
                  input={manager.label}
                  setInput={setManager}
                />
                <button
                  className="bg-green-700 text-white font-semibold px-10 py-1 rounded border border-green-700 cursor-pointer hover:bg-green-600"
                  onClick={addManager}
                >
                  Add
                </button>
              </div>
            </div>
            {
              managers.length > 0 &&
              <div className="flex flex-col w-full gap-1">
                <label className="w-1/6 font-semibold">POC / Manager(s)</label>
                <div className="flex w-full">
                  {managers.map((mgr: any, index: number) => (
                    <div 
                      key={index}
                      className="bg-blue-100 text-blue-700 px-2 py-1 rounded mr-2 flex items-center gap-2"
                    >
                      <span>{mgr.label}</span>
                      <button
                        className="text-red-500 font-bold"
                        onClick={() => {
                          const updatedManagers = managers.filter((_, i) => i !== index);
                          setManagers(updatedManagers);
                        }}
                      >
                        &times;
                      </button>
                    </div>
                  )) 
                  }
                </div>
              </div>
            }
            <div className="flex flex-row gap-3 mt-5">
              <button 
                className="bg-green-700 text-white font-semibold px-10 py-1 rounded border border-green-700 cursor-pointer hover:bg-green-600"
                onClick={onSaveDepartment}
              >
                Save
              </button>
              <Link 
                href={'/departments'} 
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

export default AddDepartment