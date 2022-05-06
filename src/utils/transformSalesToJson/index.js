"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TipoVenta = void 0;
const xlsx_1 = __importDefault(require("xlsx"));
const fs_1 = __importDefault(require("fs"));
var TipoVenta;
(function (TipoVenta) {
    TipoVenta["CobroRapido"] = "Cobro r\u00E1pido";
    TipoVenta["Tarjeta"] = "Tarjeta";
    TipoVenta["Efectivo"] = "Efectivo";
})(TipoVenta = exports.TipoVenta || (exports.TipoVenta = {}));
/** Convierte strings del tipo 'dd/mm/aa hh:mm' a un Date */
const strToDate = (dtStr, hourStr) => {
    if (!dtStr)
        throw "El argumento dtStr no puede estar vacío";
    if (!hourStr)
        throw "El argumento hourStr no puede estar vacío";
    let dateParts = dtStr.split("/");
    let timeParts = [];
    if (hourStr.length > 3) {
        timeParts = [hourStr.substring(0, 2), hourStr.substring(2)];
    }
    else {
        timeParts = [`0${hourStr.substring(0, 1)}`, hourStr.substring(1)];
    }
    const fechaFinal = new Date(Number(dateParts[2]), Number(dateParts[1]) - 1, Number(dateParts[0]), Number(timeParts[0]), Number(timeParts[1]));
    return fechaFinal;
};
const VentaXLSXToJson = (fileName) => {
    let workSheets = {};
    let sName = "";
    const workbook = xlsx_1.default.readFile(`${fileName}`);
    for (const sheetName of workbook.SheetNames) {
        sName = sheetName;
        workSheets[sheetName] = xlsx_1.default.utils.sheet_to_json(workbook.Sheets[sheetName]);
    }
    const ventas = workSheets[sName];
    let ventasMap = new Map();
    for (let index = 0; index < ventas.length; index++) {
        const venta = ventas[index];
        const updatedVenta = CrearVenta(venta);
        ventasMap.set(updatedVenta.id, updatedVenta);
    }
    return ventasMap;
};
const AddProductosToVentas = (ventas, fileName) => {
    let workSheets = {};
    let sName = "";
    const workbook = xlsx_1.default.readFile(`${fileName}`);
    for (const sheetName of workbook.SheetNames) {
        sName = sheetName;
        workSheets[sheetName] = xlsx_1.default.utils.sheet_to_json(workbook.Sheets[sheetName]);
    }
    const prodPorVentas = workSheets[sName];
    for (let index = 0; index < prodPorVentas.length; index++) {
        const productoVendido = prodPorVentas[index];
        const prod = CrearProductoVendido(productoVendido);
        let venta = ventas.get(prod.idVenta);
        if (venta) {
            venta.productos.push(prod);
            ventas.set(venta.id, venta);
        }
    }
    return ventas;
};
const CrearVenta = (v) => {
    let tipo = v.isTarjeta == 1 ? TipoVenta.Tarjeta : TipoVenta.Efectivo;
    let cambio = v.cambio;
    let entregado = v.entregado;
    if (v.cambio < 0) {
        cambio = 0;
        entregado = v.pagado;
        tipo = TipoVenta.CobroRapido;
    }
    if (v.cambio > 0 && v.cambio < 0.01) {
        cambio = 0;
    }
    const updatedVenta = {
        id: v.id,
        cambio: cambio,
        clienteNombre: v.clienteNombre,
        clienteID: v.clienteID,
        fecha: strToDate(v.fecha, String(v.hora)),
        tipo: tipo,
        entregado: entregado,
        pagado: v.pagado,
        productos: [],
        total: v.total,
        tpvID: v.tpvID,
    };
    return updatedVenta;
};
const CrearProductoVendido = (p) => {
    const prod = {
        idVenta: p.idVenta,
        idProducto: p.idProducto,
        nombre: p.nombre,
        cantidadVendida: p.cantidadVendida,
        dto: p.dto,
        ean: p.ean,
        iva: p.iva,
        precioConIva: p.precioConIva,
        precioSinIva: p.precioSinIva,
        nombreProveedor: p.nombreProveedor || "",
    };
    return prod;
};
let ventasMap = VentaXLSXToJson("ventas.xlsx");
ventasMap = AddProductosToVentas(ventasMap, "productosPorVenta.xlsx");
const ventas = Array.from(ventasMap.values());
fs_1.default.writeFile("ventasJsonTPV1.json", JSON.stringify(ventas), function (err) {
    if (err) {
        console.log(err);
    }
});
