import { formatDate } from "@/util/dateformat";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Loading from "../Layout/Loading";
import { sendEmail } from "@/util/send-email";

const Comments = ({ ticketId, managers }: any) => {
  
  const { data }: any = useSession();
  const [commentInput, setCommentInput] = useState<string>("");
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  
  /**
   * Fetch comments for the given ticketId
   */
  const getComments = async () => {
    // Fetch comments for the given ticketId
    try {
      const results = await fetch(`/api/comments/ticketId/${ticketId}`);
      const comments = await results.json();
      const formattedComments = await Promise.all(comments.map(async (comment: any) => {
        const user = await fetch(`/api/users/${comment.commentBy}`);
        comment.user = await user.json();
        return {
          id: comment._id,
          content: comment.content,
          userName: `${comment.user.firstName} ${comment.user.middleName} ${comment.user.lastName}`,
          createdAt: formatDate(comment.createdDate, true)
        } 
      }));
      setLoading(false);
      setComments(formattedComments);
    } catch (error) {
      alert(`Failed to fetch comment: ${error}`);
    }
  }
  
  /**
   * Handle comment submission
   * @returns 
   */
  const onSubmitComment = async () => {
    try {
      const textarea = commentInput;
      if (textarea.trim() === "") return;

      const newComment = {
        content: textarea,
        commentBy: data.user.id,
        ticketId: ticketId,
        createdDate: new Date()
      };

      await fetch(`/api/comments/ticketId/${ticketId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newComment),
      });
      
      emailSending()
      setCommentInput("");
      getComments();
    } catch (error) {
      alert(`Failed to submit comment: ${error}`);
    }
  };

  const emailSending = async () => {
    const ticketResponse = await fetch(`/api/tickets/${ticketId}`);
    const ticketData = await ticketResponse.json();
    const { title, description, assigneeIds, status: ticketStatus, issueNo } = ticketData;
    const emails = []
    
    // get assignee user details to send email
    const assignees = await Promise.all(
      assigneeIds.map(async (assId: string) => {
        const assigneeRes = await fetch(`/api/users/${assId}`);
        const assigneeData = await assigneeRes.json();
        return {
          email: assigneeData.email,
          name: `${assigneeData.firstName} ${assigneeData.middleName} ${assigneeData.lastName}`,
        }
      })
    )
    if (assignees.length) emails.push(...assignees.map((ass: any) => ass.email));
  
    // get managers user details to send email
    if (managers.length > 0) {
      emails.push(...managers);
    }

    const data = {
      emailTo: emails,
      subject: `#${issueNo}: ${title}`,
      message: `
        <p>Project: </p>
        <p>Ticket no: #${issueNo}</p>
        <p>Users: ${assignees.map((ass: any) => ass.name).join(', ') ?? 'N/A'}</p>
        <p>Status: ${ticketStatus}</p>
        <p>Issue Content: ${description}</p>
        <div>
          <p>New comment added:</p>
          <p>${commentInput}</p>
        </div>
        <p><a href="${location.origin}/login?callback=${location.href.replace("new", "edit/"+issueNo)}" target="_blank">View Ticket</a></p>
      `,
      qrcodeText: `${location.origin}/login?callback=${location.href.replace("new", "edit/"+issueNo)}`
    };
    await sendEmail(data);
  }
  
  useEffect(() => {
    setLoading(true);
    if (ticketId) getComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticketId]);

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="flex flex-col bg-white min-w-96 justify-center py-5 px-10 shadow-lg rounded-lg text-sm">
      <h2 className="text-lg font-semibold mb-4">Comments</h2>
      { comments.length > 0 && (
        <div className="space-y-4">
          {/* Example Comment */}
          { comments.map((comment: any) => (
            <div key={comment.id} className="border-b border-gray-100 pb-2">
              <p className="font-semibold">{comment.userName} <span className="text-gray-500 text-xs">- {new Date(comment.createdAt).toLocaleString()}</span></p>
              <p className="text-gray-500">{comment.content}</p>
            </div>
          )) }
        </div>
      )}
      <div>
        <textarea
          className="border border-gray-100 py-1 px-2 rounded w-full outline-gray-200 bg-white mt-4"
          rows={3}
          value={commentInput}
          onChange={(e) => setCommentInput(e.target.value)}
          placeholder="Add a comment..."
        ></textarea>
        <button 
          className="bg-green-700 text-white font-semibold px-10 py-1 rounded border border-green-700 cursor-pointer hover:bg-green-600 mt-1"
          onClick={onSubmitComment}
        >
          Submit
        </button>
      </div>
    </div>
  );
};

export default Comments;