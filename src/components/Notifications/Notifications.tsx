'use client';

import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function NotificationBell() {
  const { data }: any = useSession();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [totalUnread, setTotalUnread] = useState(0);

  const updateNotifications = (id: string) => {
      fetch(`/api/notifications/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          read: true,
        }),
      })
      .then(res => res.json())
      .then(() => {
        setNotifications(prev =>
          prev.map(notif =>
            notif._id === id
              ? { ...notif, read: true }
              : notif
          )
        );
      })
      .catch(err => console.error('Failed to update notification:', err));
  };

  useEffect(() => {
    fetch('/api/notifications?notifiedUser=' + data?.user?.id)
      .then(res => res.json())
      .then(data => {
        setNotifications(data);
        const unread = data.filter((n: any) => !n.read).length;
        setTotalUnread(unread);
      })
      .catch(err => console.error('Failed to fetch notifications:', err));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-full hover:bg-gray-100"
      >
        <Bell size={22} />

        {/* Notification Badge */}
        { totalUnread > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full px-1">
            {totalUnread}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-50 border border-gray-200 overflow-hidden">
          <div className="p-3 border-b border-gray-200 font-semibold">
            Notifications
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((notif, index) => (
                <div className={`p-3 last:border-0 border-b border-gray-300 hover:bg-gray-50 cursor-pointer ${notif.read ? '' : 'bg-blue-100'}`} key={notif.id + '-' + index}>
                  <div>{ notif.status }</div>
                  <Link href={`/tickets/edit/${notif.ticketId}`} className="text-blue-500 hover:underline" onClick={() => updateNotifications(notif._id)}>
                    {notif.message}
                  </Link>
                </div>
              ))
            ) : (
              <div className="p-3 text-gray-500">
                No notifications
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}