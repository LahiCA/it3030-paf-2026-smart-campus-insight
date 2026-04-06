import React from 'react'
import { NavLink } from 'react-router-dom'
import { useAppContext } from '../context/AppContext' // ✅ FIX: add correct path

const NavBar = () => {
    const [open, setOpen] = React.useState(false) // ✅ FIX: consistent state

    const { user, setUser, navigate, setShowUserLogin } = useAppContext()

    const logout = () => {
        setUser(null)
        navigate('/')
    }

    return (
        <nav className="flex items-center justify-between px-6 md:px-16 lg:px-24 xl:px-32 py-4 border-b border-gray-300 bg-white relative">

            {/* Logo */}
            <NavLink to="/">
                <h1 className="text-xl font-bold">LOGO</h1>
            </NavLink>

            {/* Desktop Menu */}
            <div className="hidden sm:flex items-center gap-8">
                <NavLink to="/">Home</NavLink>
                <NavLink to="/catalogue">Catalogue</NavLink>
                <NavLink to="/about">About</NavLink>
                <NavLink to="/contact">Contact</NavLink>

                {/* Search */}
                <div className="hidden lg:flex items-center text-sm gap-2 border border-gray-300 px-3 rounded-full">
                    <input
                        className="py-1.5 w-full bg-transparent outline-none"
                        type="text"
                        placeholder="Search Facilities" // ✅ fixed typo
                    />
                </div>

                {/* Login Button */}
                {!user ? (
                    <button
                        onClick={() => setShowUserLogin(true)}
                        className="px-6 py-2 bg-indigo-500 text-white rounded-full"
                    >
                        Login
                    </button>
                ) : (
                    <button
                        onClick={logout}
                        className="px-6 py-2 bg-indigo-500 text-white rounded-full"
                    >
                        Logout
                    </button>
                )}
            </div>

            {/* Mobile Menu Button */}
            <button
                onClick={() => setOpen(!open)} // ✅ FIX
                className="sm:hidden"
            >
                ☰
            </button>

            {/* Mobile Menu */}
            {open && (
                <div className="absolute top-[60px] left-0 w-full bg-white shadow-md py-4 px-5 flex flex-col gap-2 sm:hidden">
                    <NavLink to="/" onClick={() => setOpen(false)}>Home</NavLink>
                    <NavLink to="/catalogue" onClick={() => setOpen(false)}>Catalogue</NavLink>

                    {user && (
                        <NavLink to="/my-bookings" onClick={() => setOpen(false)}>
                            My Bookings
                        </NavLink>
                    )}

                    <NavLink to="/about" onClick={() => setOpen(false)}>About</NavLink>
                    <NavLink to="/contact" onClick={() => setOpen(false)}>Contact</NavLink>

                    {!user ? (
                        <button
                            onClick={() => {
                                setOpen(false)
                                setShowUserLogin(true)
                            }}
                            className="mt-2 px-6 py-2 bg-indigo-500 text-white rounded-full"
                        >
                            Login
                        </button>
                    ) : (
                        <button
                            onClick={logout}
                            className="mt-2 px-6 py-2 bg-indigo-500 text-white rounded-full"
                        >
                            Logout
                        </button>
                    )}
                </div>
            )}
        </nav>
    )
}

export default NavBar