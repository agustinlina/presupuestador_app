document.getElementById('fecha').value = new Date().toISOString().slice(0, 10);

const tbody = document.getElementById('productos-tbody');
const totalLabel = document.getElementById('total-label');

function agregarFila(cantidad = 1, descripcion = "Producto X", precio = 0.00) {
  const row = document.createElement('tr');

  row.innerHTML = `
    <td><input type="number" min="1" value="${cantidad}" class="cantidad" name="cantidad[]" style="width:48px;"></td>
    <td><input type="text" value="${descripcion}" class="descripcion" name="descripcion[]" style="width:140px;"></td>
    <td><input type="number" min="0" step="0.01" value="${precio}" class="precio" name="precio[]" style="width:82px;"></td>
    <td><button type="button" class="eliminar">🗑️</button></td>
  `;
  tbody.appendChild(row);

  row.querySelector('.eliminar').onclick = () => {
    tbody.removeChild(row);
    calcularTotal();
  };

  row.querySelectorAll('input').forEach(input => {
    input.oninput = calcularTotal;
  });

  calcularTotal();
}

document.getElementById('agregar-producto').onclick = () => agregarFila();

function calcularTotal() {
  let total = 0;
  [...tbody.children].forEach(row => {
    const cantidad = parseFloat(row.querySelector('.cantidad').value) || 0;
    const precio = parseFloat(row.querySelector('.precio').value) || 0;
    total += cantidad * precio;
  });
  totalLabel.textContent = `Total: $${total.toFixed(2)}`;
}

for (let i = 1; i <= 3; i++) agregarFila(i, `Producto ${i}`, 100 * i);
