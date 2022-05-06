import XLSX from "xlsx";
import path from 'path';
import fs from 'fs';
import { ProductoVendido, Venta } from "../../../types";

// const extension = '.xls';
// const returnFileNameProveedores = 'salesJson.json'

// const files = fs.readdirSync('./src/utils/transformSalesToJson/');
// const targetFiles = files.filter(file => {
//     return path.extname(file).toLowerCase() === extension && file != returnFileNameProveedores;
// });

/** Convierte strings del tipo 'dd/mm/aa hh:mm' a un Date */
const strToDate = (dtStr: string, hourStr: string): Date => {
    if (!dtStr) throw "El argumento dtStr no puede estar vacío";
    if (!hourStr) throw "El argumento hourStr no puede estar vacío";

    let dateParts = dtStr.split("/");
    let timeParts: string[] = [];

    if (hourStr.length > 3) {
        timeParts = [hourStr.substring(0, 2), hourStr.substring(2)]
    }
    else {
        timeParts = [`0${hourStr.substring(0, 1)}`, hourStr.substring(1)]
    }

    const fechaFinal = new Date(Number(dateParts[2]), Number(dateParts[1]) - 1, Number(dateParts[0]), Number(timeParts[0]), Number(timeParts[1]))
    return fechaFinal;
}

const VentaXLSXToJson = (fileName: string): Map<string, Venta> => {
    let workSheets: XLSX.WorkSheet = {}
    let sName = "";
    const workbook: XLSX.WorkBook = XLSX.readFile(`${fileName}`);

    for (const sheetName of workbook.SheetNames) {
        sName = sheetName;
        workSheets[sheetName] = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
    }
    const ventas = workSheets[sName] as any[];
    let ventasMap: Map<string, Venta> = new Map();

    for (let index = 0; index < ventas.length; index++) {
        const venta = ventas[index];
        const updatedVenta: Venta = {
            id: venta.id,
            cambio: venta.cambio,
            clienteNombre: venta.clienteNombre,
            clienteID: venta.clienteID,
            fecha: strToDate(venta.fecha, String(venta.hora)),
            isTarjeta: venta.isTarjeta == 1,
            entregado: venta.entregado,
            pagado: venta.pagado,
            productos: [],
            total: venta.total,
            tpvID: venta.tpvID,
        }

        ventasMap.set(updatedVenta.id, updatedVenta);
    }

    return ventasMap;
}

const AddProductosToVentas = (ventas: Map<string, Venta>, fileName: string): Map<string, Venta> => {
    let workSheets: XLSX.WorkSheet = {}
    let sName = "";
    const workbook: XLSX.WorkBook = XLSX.readFile(`${fileName}`);

    for (const sheetName of workbook.SheetNames) {
        sName = sheetName;
        workSheets[sheetName] = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
    }

    const prodPorVentas = workSheets[sName] as ProductoVendido[];

    for (let index = 0; index < prodPorVentas.length; index++) {
        const productoVendido = prodPorVentas[index];

        // if (!productoVendido.ean) { continue; }
        // if (!productoVendido.nombre) { continue; }
        // if (!productoVendido.precioConIva) { continue; }
        // if (!productoVendido.precioSinIva) { continue; }
        // if (isNaN(productoVendido.precioConIva)) { console.error("El precio total de la venta no es un número"); continue; }

        const prod: ProductoVendido = {
            idVenta: productoVendido.idVenta,
            idProducto: productoVendido.idProducto,
            nombre: productoVendido.nombre,
            cantidadVendida: productoVendido.cantidadVendida,
            dto: productoVendido.dto,
            ean: productoVendido.ean,
            iva: productoVendido.iva,
            precioConIva: productoVendido.precioConIva,
            precioSinIva: productoVendido.precioSinIva,
            nombreProveedor: productoVendido.nombreProveedor || "",
        }

        let venta = ventas.get(prod.idVenta);

        if (venta) {
            venta.productos.push(prod);
            ventas.set(venta.id, venta);
        }
    }

    return ventas;
}

const RestarHoras = (fecha: Date, numHoras: number): Date => {
    fecha.setHours(fecha.getHours() - numHoras);

    return fecha;
}


let ventasMap = VentaXLSXToJson("ventas2.xlsx");
ventasMap = AddProductosToVentas(ventasMap, "productosPorVenta2.xlsx");
const ventas = Array.from(ventasMap.values());
const ventasJson = JSON.stringify(ventas.filter((v) => v.productos.length > 0));

fs.writeFile("ventasJsonTPV2.json", ventasJson, function (err) {
    if (err) {
        console.log(err);
    }
});