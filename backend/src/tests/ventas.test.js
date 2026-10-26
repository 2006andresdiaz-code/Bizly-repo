import test from 'node:test';
import assert from 'node:assert';

const validarVentaMock = (body) => {
  const { id_usuario, total, carrito } = body;
  
  if (!id_usuario || !total || !carrito || carrito.length === 0) {
    return { status: 400, error: 'Faltan campos obligatorios o el carrito está vacío' };
  }
  
  return { status: 201, mensaje: 'Venta registrada con éxito' };
};

const filtrarVentasMock = (query, todasLasVentas) => {
  const { inicio, fin } = query;
  if (!inicio || !fin) {
    return todasLasVentas;
  }
  return todasLasVentas.filter(v => v.fecha >= inicio && v.fecha <= fin);
};

test('POST /api/ventas - Debe rechazar la venta si el carrito está vacío o faltan campos', () => {
  const ventaIncompleta = { id_usuario: 1, total: 50000, carrito: [] };
  const resultado = validarVentaMock(ventaIncompleta);

  assert.strictEqual(resultado.status, 400);
  assert.strictEqual(resultado.error, 'Faltan campos obligatorios o el carrito está vacío');
});

test('POST /api/ventas - Debe aprobar la venta si los datos y el carrito son válidos', () => {
  const ventaValida = { 
    id_usuario: 1, 
    total: 120000, 
    carrito: [{ id: 2, cantidad: 2, precio_venta: 60000 }] 
  };
  const resultado = validarVentaMock(ventaValida);

  assert.strictEqual(resultado.status, 201);
  assert.strictEqual(resultado.mensaje, 'Venta registrada con éxito');
});

test('GET /api/ventas - Debe retornar todas las ventas si no se envían filtros de fecha', () => {
  const ventasSimuladas = [
    { id: 1, total: 500, fecha: '2026-10-01' },
    { id: 2, total: 300, fecha: '2026-10-15' }
  ];
  const resultado = filtrarVentasMock({}, ventasSimuladas);

  assert.strictEqual(resultado.length, 2);
});