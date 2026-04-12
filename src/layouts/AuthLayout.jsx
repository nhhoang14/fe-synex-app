import { Outlet } from 'react-router-dom'

function AuthLayout() {
  return (
    <div className="flex min-h-[calc(100vh-9rem)] items-center justify-center">
      <div className="w-full max-w-md">
        <Outlet />
      </div>
    </div>
  )
}

export default AuthLayout
