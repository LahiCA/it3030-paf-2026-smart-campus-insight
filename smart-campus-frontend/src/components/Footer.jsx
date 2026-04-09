import React from 'react'

const Footer = () => {
    const linkSections = [
        {
            title: "Platform",
            links: ["Dashboard", "Facilities", "Bookings", "Tickets"]
        },
        {
            title: "Support",
            links: ["Help Center", "Report Issue", "Contact Admin", "FAQs"]
        },
        {
            title: "System",
            links: ["Privacy Policy", "Terms of Service", "System Status", "User Guidelines"]
        }
    ];

    return (
        <div className="mt-16 px-6 md:px-16 lg:px-24 xl:px-32 bg-gray-50">
            <div className="flex flex-col md:flex-row items-start justify-between gap-10 py-10 border-b border-gray-300 text-gray-600">
                
                {/* Logo + Description */}
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Smart Campus Hub</h2>
                    <p className="max-w-[420px] mt-4 text-sm">
                        A centralized platform for managing university facilities, bookings, 
                        and maintenance operations efficiently. Designed to improve campus 
                        resource utilization and communication.
                    </p>
                </div>

                {/* Links */}
                <div className="flex flex-wrap justify-between w-full md:w-[50%] gap-8">
                    {linkSections.map((section, index) => (
                        <div key={index}>
                            <h3 className="font-semibold text-gray-900 mb-3">
                                {section.title}
                            </h3>
                            <ul className="text-sm space-y-2">
                                {section.links.map((link, i) => (
                                    <li key={i}>
                                        <a href="#" className="hover:text-blue-600 transition">
                                            {link}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom */}
            <div className="py-4 text-center text-sm text-gray-500">
                © 2026 Smart Campus Operations Hub | SLIIT IT3030 PAF Assignment
            </div>
        </div>
    );
};

export default Footer;