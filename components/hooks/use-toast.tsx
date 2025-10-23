'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ToasterProps } from 'sonner'; // ✅ only import ToasterProps (Toaster is a component, not a type)

// --- Config ---
const TOAST_LIMIT = 3;
const TOAST_REMOVE_DELAY = 4000;

// --- Toast Variants ---
type ToastVariant = 'default' | 'success' | 'error' | 'info';

// --- Toast Definition ---
interface ToasterToast extends Omit<ToasterProps, 'id'> {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  content?: React.ReactNode;
  action?: React.ReactNode; // ✅ was "Toast" — invalid type reference
  variant?: ToastVariant;
  persistent?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

// --- Action Types ---
const actionTypes = {
  ADD_TOAST: 'ADD_TOAST',
  UPDATE_TOAST: 'UPDATE_TOAST',
  DISMISS_TOAST: 'DISMISS_TOAST',
  REMOVE_TOAST: 'REMOVE_TOAST',
} as const;

let count = 0;
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

type ActionType = typeof actionTypes;

type Action =
  | { type: ActionType['ADD_TOAST']; toast: ToasterToast }
  | { type: ActionType['UPDATE_TOAST']; toast: Partial<ToasterToast> }
  | { type: ActionType['DISMISS_TOAST']; toastId?: string }
  | { type: ActionType['REMOVE_TOAST']; toastId?: string };

interface State {
  toasts: ToasterToast[];
}

// --- Internal Queue ---
const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

const addToRemoveQueue = (toastId: string, persistent?: boolean) => {
  if (persistent || toastTimeouts.has(toastId)) return;

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    dispatch({ type: 'REMOVE_TOAST', toastId });
  }, TOAST_REMOVE_DELAY);

  toastTimeouts.set(toastId, timeout);
};

// --- Reducer ---
export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'ADD_TOAST':
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };

    case 'UPDATE_TOAST':
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      };

    case 'DISMISS_TOAST': {
      const { toastId } = action;

      state.toasts.forEach((toast) => {
        if (!toastId || toast.id === toastId) {
          addToRemoveQueue(toast.id, toast.persistent);
        }
      });

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          !toastId || t.id === toastId ? { ...t, open: false } : t
        ),
      };
    }

    case 'REMOVE_TOAST':
      return {
        ...state,
        toasts: action.toastId
          ? state.toasts.filter((t) => t.id !== action.toastId)
          : [],
      };

    default:
      return state;
  }
};

// --- Toast State Management ---
const listeners: Array<(state: State) => void> = [];
let memoryState: State = { toasts: [] };

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => listener(memoryState));
}

// --- Toast API ---
type ToastInput = Omit<ToasterToast, 'id'>;

function toast(props: ToastInput) {
  const id = genId();

  const update = (updated: Partial<ToasterToast>) =>
    dispatch({ type: 'UPDATE_TOAST', toast: { ...updated, id } });

  const dismiss = () => dispatch({ type: 'DISMISS_TOAST', toastId: id });

  dispatch({
    type: 'ADD_TOAST',
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss();
      },
    },
  });

  if (!props.persistent) {
    addToRemoveQueue(id, props.persistent);
  }

  return { id, dismiss, update };
}

// --- Hook ---
function useToast() {
  const [state, setState] = React.useState<State>(memoryState);

  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) listeners.splice(index, 1);
    };
  }, []);

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) =>
      dispatch({ type: 'DISMISS_TOAST', toastId }),
  };
}

// --- Toaster Component ---
export function CustomToaster() {
  const { toasts } = useToast();

  return (
    <div className="fixed bottom-4 right-4 flex flex-col gap-3 z-[9999]">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
          >
            <div
              className={`p-4 rounded-xl shadow-md min-w-[260px] text-white ${
                toast.variant === 'success'
                  ? 'bg-green-600'
                  : toast.variant === 'error'
                  ? 'bg-red-600'
                  : toast.variant === 'info'
                  ? 'bg-blue-600'
                  : 'bg-gray-800'
              }`}
            >
              {toast.content ? (
                toast.content
              ) : (
                <>
                  {toast.title && (
                    <h4 className="font-semibold">{toast.title}</h4>
                  )}
                  {toast.description && (
                    <p className="text-sm opacity-90">{toast.description}</p>
                  )}
                  {toast.action && <div className="mt-2">{toast.action}</div>}
                </>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export { useToast, toast };
