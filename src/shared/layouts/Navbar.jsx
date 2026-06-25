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
      <nav className="w-full bg-transparent border-b-2">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo de marca */}
            <div className=" hidden sm:block items-center">
              <Link to={"/dashboard/home"} className="text-h1 font-heading">
                <img src={logo} alt="logo" className="h-12" />
              </Link>
            </div>



            {/* Links de navegación */}
            <ul className="hidden md:flex items-center gap-6">
              <li>
                <Link to={"/auth"} className="hover:text-primary transition">
                  Inicio
                </Link>
              </li>
              <li>
                <Link
                  to={"/dashboard"}
                  className="hover:text-primary transition"
                >
                  Cursos
                </Link>
              </li>
              <li>
                <Link to={"/inicio"} className="hover:text-primary transition">
                  Multimedia
                </Link>
              </li>
              <li>
                <Link to={"/inicio"} className="hover:text-primary transition">
                  Contacto
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
                placeholder="Buscar productos..."
                size="md"
                variant="outlined"
                className="w-72"         
                
              />
             
            {/* Dropdown */}

            <Dropdown>
                <div>
                <DropdownTrigger>
                  <IconButton ariaLabel="Menu">
                    <Menu />
                  </IconButton>
                </DropdownTrigger>
                </div>

            {/* Contenido */}
            <DropdownContent className="right-0">
              <DropdownItem>
                Gestión de usuarios
              </DropdownItem>
              <DropdownItem onClick={() => navigate("/dashboard/userList")}>
                Listar usuarios
              </DropdownItem>
              <DropdownItem>
                Gestión de productos
              </DropdownItem>
              <DropdownItem>
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
