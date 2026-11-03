// Esquemas
export { fileSchema } from "./schemas/fileSchema";

// Layouts
export { default as AuthLayout } from "./layouts/AuthLayout";
export { default as DashboardLayout } from "./layouts/DashboardLayout";
export { default as MainLayout } from "./layouts/MainLayout";
export { default as Footer } from "./layouts/Footer";
export { default as Navbar } from "./layouts/Navbar";

// Auth
export { default as ProtectedRoute } from "./components/auth/ProtectedRoute";

// Componentes
export { default as Input } from "./components/Input";
export { default as TextArea } from "./components/TextArea";
export { default as Button } from "./components/Button";
export { default as Select } from "./components/Select";
export { default as Checkbox } from "./components/Checkbox";
export { default as FileInput } from "./components/FileInput";
export { default as DataTable } from "./components/DataTable";
export { default as Table } from "./components/DataTable";
export { default as Card } from "./components/Card";
export { default as StatusSwitch } from "./components/StatusSwitch";
export { default as Switch } from "./components/StatusSwitch";
export { default as ListReportModal } from "./components/ListReportModal";
export { default as Alert } from "./components/Alert";
export { default as ThemeToggle } from "./components/ThemeToggle";
export { default as BrandLogo } from "./components/BrandLogo";
export { IconButton } from "./components/IconButton";
export { default as ConfirmDialog } from "./components/ConfirmDialog";
export { default as Modal } from "./components/Modal";
export { default as SearchField } from "./components/SearchField";

export {
  Dropdown,
  DropdownTrigger,
  DropdownItem,
  DropdownContent,
} from "./components/Dropdown";

// Servicios de alertas (SweetAlert2)
export {
  showSuccessAlert,
  showErrorAlert,
  showWarningAlert,
  showConfirmAlert,
} from "./services/alertService";

// Hooks
export { useInactivityTimeout } from "./hooks/useInactivityTimeout";
