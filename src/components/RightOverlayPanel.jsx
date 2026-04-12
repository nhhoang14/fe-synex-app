import { useEffect } from 'react'
import { createPortal } from 'react-dom'

function RightOverlayPanel({ isOpen, title, badge, onClose, children, footer }) {
  useEffect(() => {
    if (!isOpen) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isOpen])

  if (!isOpen || typeof document === 'undefined') return null

  return createPortal(
    <div className="fixed inset-0 z-[100] bg-black/55 p-2 backdrop-blur-[1px] md:p-3" onClick={onClose}>
      <div
        className="ml-auto h-full w-full overflow-hidden rounded-xl bg-white shadow-2xl sm:max-w-[92vw] lg:w-[45vw] lg:max-w-[45vw]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex h-full flex-col">
          <header className="flex items-center justify-between border-b border-border px-6 py-5">
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-bold text-ink">{title}</h2>
              {typeof badge === 'number' && badge > 0 && (
                <span className="grid h-8 min-w-8 place-items-center rounded-full bg-slate-900 px-2 text-sm font-semibold text-white">
                  {badge}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="grid h-11 w-11 place-items-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
              aria-label="Đóng"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">{children}</div>

          {footer && <footer className="border-t border-border px-6 py-5">{footer}</footer>}
        </div>
      </div>
    </div>,
    document.body,
  )
}

export default RightOverlayPanel
