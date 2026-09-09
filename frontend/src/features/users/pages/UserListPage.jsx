import { useState } from "react";
import { DataTable, Button } from "@/shared";
import { userColumns } from "../table/UserColumns";
import { users } from "../data/users";
import { Link } from "react-router-dom";
import ReportConfigModal from "../reports/components/ReportConfigModal";

export default function UserListPage(){
    const [isReportOpen, setIsReportOpen] = useState(false);

    return (
        <div className="bg-[var(--color-primary-900)] border border-[var(--color-primary-800)] rounded-2xl p-6 shadow-xl text-[var(--color-white)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h1 className="text-xl font-bold text-[var(--color-white)]">Listado de Usuarios</h1>
                <div className="flex gap-2.5">
                    <Button variant="secondary" onClick={() => setIsReportOpen(true)}>
                        Generar reporte
                    </Button>
                    <Link to="/CreateUser">
                        <Button>Crear usuario</Button>
                    </Link>
                </div>
            </div>
            <DataTable data={users} columns={userColumns} />
            <ReportConfigModal isOpen={isReportOpen} onClose={() => setIsReportOpen(false)} />
        </div>
    );
}