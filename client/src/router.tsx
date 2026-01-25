import { createBrowserRouter } from "react-router-dom";
import Home from "@/pages/Home/Home";
import NotFound from "@/pages/NotFound/NotFound";
import RootWrapper from "@/layout/RootWrapper";
import MainLayout from "@/layout/Mainlayout";
import ProtectedRoute from "@/components/ProtectedRoute/ProtectedRoute";
import LoginForm from "@/pages/Login/Login";
import SignUpForm from "@/pages/SignUp/SignUp";
import VerificationEmailSent from "@/pages/EmailVerification/VerificationEmailSent";
import VerificationStatus from "@/pages/EmailVerification/VerificationStatus";
import ForgotPassword from "@/pages/ForgotPassword/ForgotPassword";
import PasswordResetForm from "@/pages/ForgotPassword/PasswordResetForm";
import InterviewResourcesPage from "./pages/InterviewResourcesPage/InterviewResourcesPage";
import CoursesPage from "./pages/Courses/CoursesPage";
import CreateCoursePage from "./pages/Courses/CreateCoursePage";
import CourseDetailPage from "./pages/Courses/CourseDetailPage";
import CourseTestPage from "./pages/Courses/CourseTestPage";
import TestResultsPage from "./pages/Courses/TestResultsPage";
import CertificateVerificationPage from "./pages/Courses/CertificateVerificationPage";
import PdfChat from "./pages/PdfChat/PdfChat";
import InterviewQuestions from "./pages/InterviewQues/InterviewQuestions";
import PodcastPage from "@/pages/Podcast/PodcastPage";
import PodcastPlayerPage from "@/pages/Podcast/PodcastPlayerPage";
import IndustryInsightsComponent from "./pages/IndustryInsights/IndustryInsights";
import InterviewHelp from "@/pages/InterviewHelp/InterviewHelp";
import YourInterviews from "@/pages/YourInterviews/YourInterviews";
import Results from "@/pages/Results/Results";
import Interview from "@/pages/AI_Interview/Interview";
import AITutorPage from "@/pages/AITutor";
import { AiCoursesPage, CourseDetailPage as AiCourseDetailPage } from "@/components/AiCourses";


const mainLayoutRoutes = [
    {
        path: "/",
        index: true,
        element: <Home />,
    },
    {
        path: "/pdf-chat",
        element: <PdfChat />,
    },
    {
        path: "/interview-resources",
        element: <InterviewResourcesPage />,
    },
    {
        path: "/courses",
        element: <CoursesPage />,
    },
    {
        path: "/courses/:id",
        element: <CourseDetailPage />,
    },
    {
        path: "/interview-questions",
        element: <InterviewQuestions />,
    },
    {
        path: "/verify-certificate",
        element: <CertificateVerificationPage />,
    },
    {
        path: "/podcasts",
        element: <PodcastPage />,
    },
    {
        path: "/podcasts/:id",
        element: <PodcastPlayerPage />,
    },
    {
        path: "/industry-insights",
        element: <IndustryInsightsComponent />,
    },
    {
        path: "/interview-questions",
        element: <InterviewQuestions />,
    },
    {
        path: "/interview",
        element: <InterviewHelp />,
    },
    {
        path: "/your-interviews",
        element: <YourInterviews />,
    },
    {
        path: "/interview/results/:interviewId",
        element: <Results />,
    },
];

const protectedRoutes = [
    {
        path: "/courses/create",
        element: <CreateCoursePage />,
    },
    {
        path: "/courses/:id/test",
        element: <CourseTestPage />,
    },
    {
        path: "/courses/:id/test/:testId",
        element: <CourseTestPage />,
    },
    {
        path: "/courses/:id/test/:testId/results",
        element: <TestResultsPage />,
    },
];

const router = createBrowserRouter([
    {
        path: "/",
        element: <RootWrapper />,
        children: [
            {
                path: "/",
                element: <ProtectedRoute />,
                children: protectedRoutes,
            },
            {
                path: "/",
                element: <MainLayout />,
                children: mainLayoutRoutes,
            },
            {
                path: "/Login",
                element: <LoginForm />,
            },
            {
                path: "/SignUp",
                element: <SignUpForm />,
            },
            {
                path: "/verifymail",
                element: <VerificationEmailSent />,
            },
            {
                path: "/verifymail/:verificationToken",
                element: <VerificationStatus />,
            },
            {
                path: "/forgot-password",
                element: <ForgotPassword />,
            },
            {
                path: "/reset-password/:resetToken",
                element: <PasswordResetForm />,
            },
            {
                path: "/interview/:interviewId",
                element: <Interview />,
            },
            {
                path: "/ai-tutor",
                element: <AITutorPage />,
            },
            {
                path: "/ai-courses",
                element: <AiCoursesPage />,
            },
            {
                path: "/ai-courses/:id",
                element: <AiCourseDetailPage />,
            },
            {
                path: "/ai-courses/:id",
                element: <AiCourseDetailPage />,
            },

            {
                path: "*",
                element: <NotFound />,
            },
        ],
    },
]);

export default router;
