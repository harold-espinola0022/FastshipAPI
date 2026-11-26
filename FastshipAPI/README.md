# FastShip API – Backend de gestión de envíos

Backend desarrollado con **Node.js, Express y MongoDB (Mongoose)** para la startup FastShip. Permite registrar envíos, actualizar su estado, consultar los envíos activos y buscar un envío por su ID de pedido. Forma parte de una aplicación basada en el stack **MEAN** (MongoDB, Express, Angular, Node.js); este repositorio contiene la parte de backend.

## Requisitos

- Node.js 26.13.1
- MongoDB Atlas
- Postman para probar la API

## Instalación

```bash
git clone https://github.com/harold-espinola0022/FastshipAPI.git
cd fastship-api
npm install
```

Crea el archivo de configuración a partir del ejemplo:

```bash
# Windows (CMD)
copy .env.example .env
```

Abre `.env` y revisa `MONGODB_URI`:

- **MongoDB Atlas:** usuario, contraseña y cadena de conexión.

## Ejecución

```bash
npm start        # modo normal
npm run dev      # modo desarrollo (reinicia al guardar cambios)
```

Si todo va bien verás:

```
Conectado a MongoDB
Servidor escuchando en http://localhost:3000
```

## Estructura del proyecto

```
fastship-api/
├── server.js                         # Punto de entrada
├── package.json
├── .env.example                      # Plantilla de variables de entorno
├── postman/
│   └── FastShip.postman_collection.json
└── src/
    ├── config/db.js                  # Conexión a MongoDB
    ├── models/Envio.js               # Modelo Mongoose
    ├── controllers/envios.controller.js  # Lógica de negocio
    └── routes/envios.js              # Rutas de Express
```

## Modelo de datos (Envío)

| Campo | Tipo | Reglas |
|---|---|---|
| `pedidoId` | String | Obligatorio, único, se guarda en mayúsculas |
| `remitente` | String | Obligatorio, mínimo 3 caracteres |
| `destinatario` | String | Obligatorio, mínimo 3 caracteres |
| `direccionEntrega` | String | Obligatorio, mínimo 5 caracteres |
| `estado` | String | `pendiente` (por defecto), `en_transito` o `entregado` |
| `createdAt` / `updatedAt` | Date | Automáticos |

## Endpoints

Base URL: `http://localhost:3000/api/envios`

| Método | Ruta | Descripción | Respuesta |
|---|---|---|---|
| POST | `/` | Registrar un envío | 201 |
| GET | `/` | Listar todos los envíos | 200 |
| GET | `/activos` | Listar envíos no entregados | 200 |
| GET | `/:id` | Buscar un envío por ID de pedido | 200 / 404 |
| PUT | `/:id` | Actualizar datos del envío | 200 / 400 / 404 |
| PATCH | `/:id/estado` | Cambiar solo el estado | 200 / 400 / 404 |
| DELETE | `/:id` | Eliminar un envío | 200 / 404 |

`:id` es el **ID del pedido** (por ejemplo `FS-001`).

### Ejemplos

**Registrar un envío** – `POST /api/envios`

```json
{
  "pedidoId": "FS-001",
  "remitente": "Tienda Lima Express",
  "destinatario": "María Torres",
  "direccionEntrega": "Av. Universitaria 15, Lima"
}
```

**Actualizar el estado** – `PATCH /api/envios/FS-001/estado`

```json
{ "estado": "en_transito" }
```

**Consultar activos** – `GET /api/envios/activos`

**Buscar por ID** – `GET /api/envios/FS-001`

### Con curl

```bash
curl -X POST http://localhost:3000/api/envios \
  -H "Content-Type: application/json" \
  -d '{"pedidoId":"FS-001","remitente":"Tienda Lima Express","destinatario":"Maria Torres","direccionEntrega":"Av. Universitaria 15, Lima"}'

curl -X PATCH http://localhost:3000/api/envios/FS-001/estado \
  -H "Content-Type: application/json" \
  -d '{"estado":"en_transito"}'

curl http://localhost:3000/api/envios/activos
curl http://localhost:3000/api/envios/FS-001
```

### Formato de errores

```json
{ "ok": false, "mensaje": "Datos inválidos", "errores": ["El remitente es obligatorio"] }
```

| Código | Cuándo ocurre |
|---|---|
| 400 | Datos inválidos, estado no permitido o JSON mal escrito |
| 404 | El envío o la ruta no existe |
| 409 | Ya existe un envío con ese `pedidoId` |
| 500 | Error interno del servidor |

---

# Documentación de la actividad

## Paso 1: Identificación del problema

FastShip no tiene un sistema centralizado para gestionar sus pedidos ni rastrear el estado de los paquetes. Se necesita un backend que permita:

1. **Registrar** un envío con ID de pedido, remitente, destinatario, dirección y estado.
2. **Actualizar** el estado (pendiente, en tránsito, entregado).
3. **Consultar** los envíos activos y **buscar** un envío por ID.

Para resolverlo se diseñó:

- **Rutas en Express** para las operaciones CRUD (`src/routes/envios.js`).
- **Controladores** con la lógica de cada petición (`src/controllers/envios.controller.js`).
- **Un modelo Mongoose** que representa el envío (`src/models/Envio.js`).
- **Conexión a MongoDB** (local o Atlas) y pruebas con Postman (`postman/`).

## Paso 2: Solución

| Parte | Archivo | Qué hace |
|---|---|---|
| Rutas | `src/routes/envios.js` | Asocia cada método HTTP y URL con una función del controlador |
| Controladores | `src/controllers/envios.controller.js` | Crea, lista, busca, actualiza y elimina envíos; responde con códigos HTTP correctos |
| Modelo | `src/models/Envio.js` | Define el esquema, las validaciones y los estados permitidos |
| Conexión | `src/config/db.js` + `.env` | Conecta con MongoDB Atlas mediante `MONGODB_URI` |
| Servidor | `server.js` | Configura Express, monta las rutas y maneja errores generales |

## Paso 3: Argumentación

### Estructuras de datos en MongoDB

Cada envío es un **documento** dentro de la colección `envios`. Se eligió este modelo porque el envío es una unidad independiente que se consulta completa: todos sus datos se leen y escriben juntos, sin necesidad de uniones (joins) entre tablas. MongoDB es flexible, por lo que si FastShip agrega después campos como peso o repartidor, no hay que migrar toda la estructura.

- `pedidoId` es **único**, porque es el identificador de negocio que usará el cliente para rastrear su paquete.
- `estado` usa un **enum** con tres valores cerrados para evitar datos inconsistentes como "Entregado", "entregao" o "ok".
- `timestamps` guarda cuándo se creó y se modificó cada envío, útil para el seguimiento.

### Rutas y controladores en Express

Se separaron responsabilidades para que el código sea ordenado y fácil de mantener:

- La **ruta** solo decide *qué función se ejecuta* según el método y la URL.
- El **controlador** contiene *qué hacer* (lógica de negocio) y devuelve la respuesta.
- El **modelo** se encarga de *cómo se guardan* los datos.

Esta separación permite cambiar una parte sin romper las demás y reutilizar controladores. Las rutas siguen el estilo REST (`POST` crea, `GET` consulta, `PUT/PATCH` actualiza, `DELETE` elimina) y usan códigos HTTP claros (201, 400, 404, 409, 500). La ruta `/activos` se declara antes de `/:id`; de lo contrario Express interpretaría "activos" como un ID.

### Manejo de errores y validaciones

- **Validaciones en el modelo:** campos obligatorios, longitudes mínimas, `trim` y estados permitidos. `runValidators: true` hace que también se apliquen al actualizar.
- **Errores controlados:** una función `manejarError` traduce los errores de Mongoose a respuestas claras: 400 para datos inválidos, 409 para ID duplicado, 404 cuando no existe el envío y 500 para fallos inesperados.
- **Protección básica:** solo se aceptan los campos permitidos del body (`filtrarCampos`), así el cliente no puede escribir campos que no le corresponden. Los valores pasan por el esquema, que convierte y valida los tipos. Además, la cadena de conexión se guarda en `.env`, que no se sube a GitHub.
- **Errores generales:** `server.js` captura JSON mal escrito (400) y rutas inexistentes (404), y evita mostrar detalles internos al cliente.

## Paso 4: Conclusiones

1. **Desafíos enfrentados.** Los principales retos fueron configurar la conexión a MongoDB, entender que el orden de las rutas importa y manejar correctamente los errores de validación y de ID duplicado para devolver mensajes útiles. También tuve que elegir `pedidoId` como identificador usar para las búsquedas, por ser el dato que conoce el cliente.

2. **Buenas prácticas para un backend escalable y seguro.** Separar el proyecto en rutas, controladores, modelos y configuración facilita agregar funciones sin reescribir lo existente. Guardar credenciales en variables de entorno, validar todos los datos de entrada, filtrar los campos permitidos y devolver códigos HTTP correctos hacen la API más segura y predecible.