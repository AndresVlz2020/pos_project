import { DataTable, Button } from "@/shared";
import { useNavigate } from "react-router-dom";
import { userColumns } from "../table/UserColumns";
import { users } from "../data/users";

export default function UserListPage(){
    const navigate = useNavigate();

    return (
        <div className="p-6">
            <div className="mb-4 flex items-center justify-between gap-4">
                <h1 className="text-xl font-semibold">Listado de usuarios
                </h1>
                <div className="flex items-center gap-3">
                    <Button variant="secondary">
                        Crear reporte
                    </Button>
                    <Button onClick={() => navigate("/CreateUser")}>
                        Crear usuario
                    </Button>
                </div>
            </div>
            <DataTable data={users} columns={userColumns} />
        </div>
    );
}