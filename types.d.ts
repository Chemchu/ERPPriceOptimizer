export interface ProductoXLSX {
    Nombre: string,
    EAN: string,
    Precio: number,
    NombreProveedor?: string
    Diferencia?: number | string
}

export interface ProductoVendido {
    idVenta: string,
    idProducto: string,
    nombre: string,
    ean: string,
    precioSinIva: number,
    precioConIva: number,
    nombreProveedor?: string
    cantidadVendida: number
    dto: number
    iva: number,
}

export interface Venta {
    id: string,
    tpvID: string,
    fecha: Date,
    clienteID: string,
    clienteNombre: string,
    total: number,
    pagado: number,
    entregado: number,
    cambio: number,
    isTarjeta: boolean,
    productos: ProductoVendido[]
}
