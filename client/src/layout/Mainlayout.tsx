import Footer from "@/components/Footer/Footer";
import Navbar from "@/components/Navbar/Navbar";
import { Outlet } from "react-router-dom";
import '@livekit/components-styles';
import '@livekit/components-styles/index.css';

const MainLayout = () => {
    return (
        <>
            <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-gray-100" data-lk-theme="light">
                <Navbar />
                <Outlet />
                <Footer />
            </div>
        </>
    );
};

export default MainLayout;  