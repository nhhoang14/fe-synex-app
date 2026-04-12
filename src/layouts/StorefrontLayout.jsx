import { Outlet } from 'react-router-dom'
import Footer from '../components/Footer'
import NavBar from '../components/NavBar'

function StorefrontLayout() {
  return (
    <div className="grid min-h-screen grid-rows-[auto_1fr_auto]">
      <NavBar />
      <main className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default StorefrontLayout
