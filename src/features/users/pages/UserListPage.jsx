import { DataTable } from "@/shared";
import { userColumns } from "../table/UserColumns";
import { users } from "../data/users";

export default function UserListPage(){
    return (
        <div className="p-6">
            <h1 className="text-xl font-semibold mb-4">Listado de usuarios</h1>
            <DataTable data={users} columns={userColumns} />
        </div>
    );
}