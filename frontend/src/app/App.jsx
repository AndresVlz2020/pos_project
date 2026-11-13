import { RouterProvider } from "react-router-dom";
import router from "@/app/router";
import AdminStepUpModal from "@/shared/components/AdminStepUpModal";

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <AdminStepUpModal />
    </>
  );
}
