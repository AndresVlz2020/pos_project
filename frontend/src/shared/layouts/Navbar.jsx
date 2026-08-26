import { useState } from "react";
import {
  IconButton,
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
  SearchField,

} from "@/shared";
import  logo  from "@/assets/images/logo-d,piero.png";
import { Link, useNavigate } from "react-router-dom";
import { Menu } from "lucide-react";


export default function Navbar(){


  // Componente de búsqueda 😂😂😂
  const [search, setSearch] = useState("");
  const navigate = useNavigate();


  const handleSearch = (value) => {
    console.log("Buscar:", value);
  };


  const handleClear = () => {
    console.log("Campo limpiado");
  };


    return (
      <nav className="w-full bg-[var(--color-primary-950)] border-b-2">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo de marca */}
            <div className="flex items-center">
              <Link to={"/"} className="text-h1 font-heading">
                <img src={logo} alt="logo" className="h-10 sm:h-12 w-auto object-contain" />
              </Link>
            </div>



            {/* Links de navegación principales */}
            <ul className="hidden md:flex items-center gap-6 text-[var(--color-white)] text-sm font-medium">
              <li>
                <Link to={"/"} className="hover:text-primary transition">
                  Inicio
                </Link>
              </li>
              <li>
                <Link to={"/dashboard/userList"} className="hover:text-primary transition">
                  Usuarios
                </Link>
              </li>
              <li>
                <Link to={"/productList"} className="hover:text-primary transition">
                  Productos
                </Link>
              </li>
              <li>
                <Link to={"/inventoryList"} className="hover:text-primary transition">
                  Inventario
                </Link>
              </li>
              <li>
                <Link to={"/supplierList"} className="hover:text-primary transition">
                  Proveedores
                </Link>
              </li>
              <li>
                <Link to={"/CreateOrder"} className="hover:text-primary transition">
                  Órdenes
                </Link>
              </li>
            </ul>

            {/* SearchField */}
            <div className="flex items-center gap-2"> 
              <SearchField
                value={search}
                onChange={setSearch}
                onSubmit={handleSearch}
                onClear={handleClear}
                placeholder="Buscar..."
                size="md"
                variant="outlined"
                className="w-72"         
              />
             
              {/* Dropdown / Menú Hamburguesa */}
              <Dropdown>
                <div>
                  <DropdownTrigger>
                    <IconButton ariaLabel="Menu">
                      <Menu />
                    </IconButton>
                  </DropdownTrigger>
                </div>

                {/* Contenido: Opciones de autenticación */}
                <DropdownContent className="right-0">
                  <DropdownItem onClick={() => navigate("/Auth")} className="cursor-pointer">
                    Iniciar sesión
                  </DropdownItem>
                  <DropdownItem onClick={() => navigate("/Auth/register")} className="cursor-pointer">
                    Registrarse
                  </DropdownItem>
                  <DropdownItem onClick={() => navigate("/Auth")} className="cursor-pointer text-red-500 hover:text-red-600">
                    Cerrar sesión
                  </DropdownItem>
                </DropdownContent>
              </Dropdown>
            </div>
          </div>
        </div>
      </nav>
    );
}
