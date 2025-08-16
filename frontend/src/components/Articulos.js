import { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Edit, Trash2, Search, Package, Eye, EyeOff } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Switch } from "./ui/switch";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Articulos = () => {
  const [articulos, setArticulos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategoria, setFilterCategoria] = useState("todos");
  const [showInactivos, setShowInactivos] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingArticulo, setEditingArticulo] = useState(null);
  const [formData, setFormData] = useState({
    codigo: "",
    nombre: "",
    descripcion: "",
    precio: "",
    categoria: "general",
    unidad_medida: "unidad",
    activo: true
  });

  useEffect(() => {
    fetchArticulos();
  }, [showInactivos]);

  const fetchArticulos = async () => {
    try {
      const response = await axios.get(`${API}/articulos`, {
        params: { activos_only: !showInactivos }
      });
      setArticulos(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching articulos:", error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        precio: parseFloat(formData.precio)
      };

      if (editingArticulo) {
        await axios.put(`${API}/articulos/${editingArticulo.id}`, submitData);
      } else {
        await axios.post(`${API}/articulos`, submitData);
      }
      
      setDialogOpen(false);
      setEditingArticulo(null);
      resetForm();
      fetchArticulos();
    } catch (error) {
      console.error("Error saving articulo:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      codigo: "",
      nombre: "",
      descripcion: "",
      precio: "",
      categoria: "general",
      unidad_medida: "unidad",
      activo: true
    });
  };

  const handleEdit = (articulo) => {
    setEditingArticulo(articulo);
    setFormData({
      codigo: articulo.codigo,
      nombre: articulo.nombre,
      descripcion: articulo.descripcion,
      precio: articulo.precio.toString(),
      categoria: articulo.categoria,
      unidad_medida: articulo.unidad_medida,
      activo: articulo.activo
    });
    setDialogOpen(true);
  };

  const handleDelete = async (articuloId) => {
    if (window.confirm("¿Está seguro de que desea eliminar este artículo?")) {
      try {
        await axios.delete(`${API}/articulos/${articuloId}`);
        fetchArticulos();
      } catch (error) {
        console.error("Error deleting articulo:", error);
      }
    }
  };

  const toggleActivo = async (articuloId) => {
    try {
      await axios.put(`${API}/articulos/${articuloId}/toggle`);
      fetchArticulos();
    } catch (error) {
      console.error("Error toggling articulo status:", error);
    }
  };

  const getCategoriaBadge = (categoria) => {
    const variants = {
      'general': 'default',
      'producto': 'secondary',
      'servicio': 'outline'
    };
    
    const labels = {
      'general': 'General',
      'producto': 'Producto',
      'servicio': 'Servicio'
    };

    return (
      <Badge variant={variants[categoria] || 'default'}>
        {labels[categoria] || categoria}
      </Badge>
    );
  };

  const filteredArticulos = articulos.filter(articulo => {
    const matchesSearch = articulo.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         articulo.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         articulo.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategoria = filterCategoria === "todos" || articulo.categoria === filterCategoria;
    
    return matchesSearch && matchesCategoria;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Cargando artículos...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Artículos</h1>
          <p className="text-gray-600">Catálogo de productos y servicios</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingArticulo(null);
              resetForm();
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Artículo
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingArticulo ? "Editar Artículo" : "Nuevo Artículo"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="codigo">Código</Label>
                  <Input
                    id="codigo"
                    value={formData.codigo}
                    onChange={(e) => setFormData({...formData, codigo: e.target.value})}
                    placeholder="Opcional"
                  />
                </div>
                <div>
                  <Label htmlFor="categoria">Categoría</Label>
                  <Select value={formData.categoria} onValueChange={(value) => setFormData({...formData, categoria: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="producto">Producto</SelectItem>
                      <SelectItem value="servicio">Servicio</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="nombre">Nombre *</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="descripcion">Descripción</Label>
                <Input
                  id="descripcion"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="precio">Precio *</Label>
                  <Input
                    id="precio"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.precio}
                    onChange={(e) => setFormData({...formData, precio: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="unidad_medida">Unidad</Label>
                  <Select value={formData.unidad_medida} onValueChange={(value) => setFormData({...formData, unidad_medida: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unidad">Unidad</SelectItem>
                      <SelectItem value="kg">Kilogramo</SelectItem>
                      <SelectItem value="litro">Litro</SelectItem>
                      <SelectItem value="metro">Metro</SelectItem>
                      <SelectItem value="m2">Metro²</SelectItem>
                      <SelectItem value="m3">Metro³</SelectItem>
                      <SelectItem value="hora">Hora</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="activo"
                  checked={formData.activo}
                  onCheckedChange={(checked) => setFormData({...formData, activo: checked})}
                />
                <Label htmlFor="activo">Artículo activo</Label>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {editingArticulo ? "Actualizar" : "Crear"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setDialogOpen(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar artículos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={filterCategoria} onValueChange={setFilterCategoria}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas las categorías</SelectItem>
            <SelectItem value="general">General</SelectItem>
            <SelectItem value="producto">Productos</SelectItem>
            <SelectItem value="servicio">Servicios</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center space-x-2">
          <Switch
            id="show-inactivos"
            checked={showInactivos}
            onCheckedChange={setShowInactivos}
          />
          <Label htmlFor="show-inactivos">Mostrar inactivos</Label>
        </div>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredArticulos.map((articulo) => (
          <Card key={articulo.id} className={`${!articulo.activo ? 'opacity-60' : ''}`}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Package className="h-4 w-4 text-gray-500" />
                    {articulo.codigo && (
                      <span className="text-xs text-gray-500 font-mono">{articulo.codigo}</span>
                    )}
                  </div>
                  <CardTitle className="text-lg leading-tight">{articulo.nombre}</CardTitle>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {getCategoriaBadge(articulo.categoria)}
                  {!articulo.activo && <Badge variant="destructive" className="text-xs">Inactivo</Badge>}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {articulo.descripcion && (
                  <p className="text-sm text-gray-600 line-clamp-2">{articulo.descripcion}</p>
                )}
                
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-2xl font-bold text-green-600">
                      ${articulo.precio.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">por {articulo.unidad_medida}</p>
                  </div>
                </div>
                
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(articulo)}
                    className="flex-1"
                  >
                    <Edit className="mr-1 h-3 w-3" />
                    Editar
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleActivo(articulo.id)}
                    className="px-2"
                  >
                    {articulo.activo ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(articulo.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 px-2"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredArticulos.length === 0 && (
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500 text-lg mb-2">
            {searchTerm || filterCategoria !== "todos" 
              ? "No se encontraron artículos con ese criterio" 
              : "No hay artículos registrados"}
          </p>
          <p className="text-gray-400 text-sm">
            {!searchTerm && filterCategoria === "todos" && "Crea tu primer artículo para empezar"}
          </p>
        </div>
      )}

      {/* Summary Stats */}
      {articulos.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8 pt-6 border-t">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{articulos.filter(a => a.activo).length}</div>
              <p className="text-sm text-gray-600">Artículos Activos</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{articulos.filter(a => a.categoria === 'producto').length}</div>
              <p className="text-sm text-gray-600">Productos</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">{articulos.filter(a => a.categoria === 'servicio').length}</div>
              <p className="text-sm text-gray-600">Servicios</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600">
                ${articulos.length > 0 ? Math.round(articulos.reduce((sum, a) => sum + a.precio, 0) / articulos.length) : 0}
              </div>
              <p className="text-sm text-gray-600">Precio Promedio</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Articulos;