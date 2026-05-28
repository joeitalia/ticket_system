'use client';

import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/notifications')
      .then(res => res.json())
      .then(data => setNotifications(data))
      .catch(err => console.error('Failed to fetch notifications:', err));
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
        <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full px-1">
          {notifications.length}
        </span>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white border rounded-md shadow-lg z-50">
          <div className="p-3 border-b border-gray-200 font-semibold">
            Notifications
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((notif) => (
                <div className="p-3 border-b border-gray-200 hover:bg-gray-50 cursor-pointer" key={notif.id}>
                  <div>{ notif.status }</div>
                  <div className="">
                    {notif.message}
                  </div>
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