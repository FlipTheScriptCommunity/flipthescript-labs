import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react';
import type { FlashbarProps } from '@cloudscape-design/components/flashbar';

type Notify = (message: {
  type: FlashbarProps.Type;
  content: ReactNode;
  header?: ReactNode;
}) => void;

const NotificationsContext = createContext<{
  items: FlashbarProps.MessageDefinition[];
  notify: Notify;
}>({
  items: [],
  notify: () => undefined,
});

let nextId = 0;

// Console-style success/error banners (the green "Successfully created bucket"
// bar the real console shows at the top of the page).
export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<FlashbarProps.MessageDefinition[]>([]);
  const notify = useCallback<Notify>(({ type, content, header }) => {
    const id = String(nextId++);
    const dismiss = () =>
      setItems((current) => current.filter((item) => item.id !== id));
    setItems((current) =>
      [
        { id, type, content, header, dismissible: true, onDismiss: dismiss },
        ...current,
      ].slice(0, 3),
    );
    if (type === 'success') setTimeout(dismiss, 8000);
  }, []);
  return (
    <NotificationsContext.Provider value={{ items, notify }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationsContext);
