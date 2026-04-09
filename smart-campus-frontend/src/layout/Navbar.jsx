import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";

const seedUser = () => {
    if (!localStorage.getItem("userId")) {
        localStorage.setItem("userId", "user-003");
    }
    if (!localStorage.getItem("userRole")) {
        localStorage.setItem("userRole", "USER");
    }
};

const Navbar = () => {
    seedUser();
    const location = useLocation();
    const role = localStorage.getItem("userRole") || "USER";

    const switchRole = (nextRole) => {
        localStorage.setItem("userRole", nextRole);
        window.location.reload();
    };


};

export default Navbar;