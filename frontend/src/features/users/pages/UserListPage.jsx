import { useState } from "react";
import { DataTable, Button } from "@/shared";
import { userColumns } from "../table/UserColumns";
import { users } from "../data/users";
import { Link } from "react-router-dom";
import ReportConfigModal from "../reports/components/ReportConfigModal";

export default function UserListPage(){
    const [isReportOpen, setIsReportOpen] = useState(false);

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-xl font-semibold">Listado de usuarios</h1>
                <div className="flex gap-2">
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