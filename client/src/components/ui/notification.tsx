import { useState, useEffect, FC, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';

type NotificationType = 'success' | 'error' | 'warning';

interface NotificationProps {
  type: NotificationType;
  title: string;
  message: string;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export const Notification: FC<NotificationProps> = ({
  type,
  title,
  message,
  isVisible,
  onClose,
  duration = 5000,
}) => {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);
  
  if (!isVisible) return null;
  
  const getIcon = (): ReactNode => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-6 w-6 text-success" />;
      case 'error':
        return <XCircle className="h-6 w-6 text-error" />;
      case 'warning':
        return <AlertCircle className="h-6 w-6 text-warning" />;
      default:
        return <CheckCircle className="h-6 w-6 text-success" />;
    }
  };

  return (
    <div className={cn(
      "fixed top-4 right-4 max-w-xs w-full bg-white shadow-lg rounded-lg p-4 flex items-start space-x-4 z-40",
      "animate-in slide-in-from-right duration-300"
    )}>
      <div className="flex-shrink-0">
        {getIcon()}
      </div>
      <div className="flex-1">
        <h3 className="font-medium text-dark">{title}</h3>
        <p className="text-sm text-dark-light">{message}</p>
      </div>
      <button 
        onClick={onClose}
        className="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-500"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
  );
};

interface NotificationControllerProps {
  children: (controls: {
    showNotification: (type: NotificationType, title: string, message: string) => void;
  }) => ReactNode;
}

export const NotificationController: FC<NotificationControllerProps> = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const [notificationData, setNotificationData] = useState<{
    type: NotificationType;
    title: string;
    message: string;
  }>({
    type: 'success',
    title: '',
    message: '',
  });
  
  const showNotification = (type: NotificationType, title: string, message: string) => {
    setNotificationData({ type, title, message });
    setVisible(true);
  };
  
  return (
    <>
      {children({ showNotification })}
      <Notification
        type={notificationData.type}
        title={notificationData.title}
        message={notificationData.message}
        isVisible={visible}
        onClose={() => setVisible(false)}
      />
    </>
  );
};
