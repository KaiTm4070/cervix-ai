# Cérvix-AI

Cérvix-AI es una plataforma para explorar el análisis asistido por inteligencia
artificial de imágenes públicas y desidentificadas relacionadas con el cuello
uterino, como citología, colposcopia e histología.

## Objetivo

El proyecto busca apoyar la investigación y el desarrollo de herramientas de
visión artificial aplicadas a la salud cervicouterina. La plataforma permite
incorporar imágenes, validarlas, aplicar un preprocesamiento consistente y
obtener una clasificación generada por un modelo de aprendizaje automático,
acompañada de su nivel de confianza y de elementos visuales que faciliten la
interpretación del resultado.

La solución está pensada como una base extensible para experimentar con
modelos, comparar resultados, integrar nuevos conjuntos de datos y construir
flujos de apoyo para profesionales e investigadores. El resultado del modelo
debe interpretarse junto con la información clínica y la evaluación de
personal cualificado.

> ⚠️ Cérvix-AI no sustituye una evaluación médica, no entrega diagnósticos
> definitivos y no debe utilizarse como único criterio para tomar decisiones
> clínicas. Las imágenes utilizadas deben estar autorizadas y desidentificadas.

## Estructura del proyecto

- `src/`: API y código Python para inferencia, entrenamiento, evaluación y
  preprocesamiento.
- `models/vigente/`: paquete del modelo disponible (`model.pt` y sus metadatos).
- `frontend/`: aplicación web React + TypeScript + Vite.
- `notebook/`: notebook utilizado para el entrenamiento en Google Colab.
- `configs/`: configuraciones relacionadas con el entrenamiento.

## Requisitos

Instala previamente:

- Python 3.13 (se recomienda usar el lanzador `py` de Windows).
- Node.js y npm.
- Git, si vas a clonar el repositorio.

## Ejecutar el proyecto en local

El backend y el frontend se ejecutan en terminales separadas.

### 1. Crear y activar el entorno Python

Desde la carpeta raíz del repositorio:

```powershell
py -3.13 -m venv .venv
.\.venv\Scripts\Activate.ps1
```

Si `py` no está disponible, utiliza:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

Si PowerShell impide ejecutar el script de activación, habilítalo para tu
usuario:

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

Después, vuelve a ejecutar:

```powershell
.\.venv\Scripts\Activate.ps1
```

### 2. Instalar dependencias del backend

Con el entorno virtual activado:

```powershell
python -m pip install --upgrade pip
pip install -r requirements.txt
pip install -r requirements-ml.txt
```

### 3. Iniciar la API

Desde la raíz del repositorio y con `.venv` activo:

```powershell
python -m uvicorn src.api.main:app --reload
```

La API estará disponible en:

- http://localhost:8000
- Documentación interactiva: http://localhost:8000/docs
- Comprobación de estado: http://localhost:8000/api/salud

### 4. Instalar y ejecutar el frontend

Abre una segunda terminal. Entra en la carpeta `frontend` e instala sus
dependencias:

```powershell
cd frontend
npm install
npm run dev
```

Vite mostrará la dirección local, normalmente:

```text
http://localhost:5173
```

El frontend redirige automáticamente las rutas `/api` hacia
`http://localhost:8000`, según la configuración de
[`vite.config.ts`](frontend/vite.config.ts). Por eso el backend debe estar
ejecutándose en la primera terminal.

## Comandos útiles

Desde `frontend/`:

```powershell
npm run build
npm run lint
npm run preview
```

`npm run build` comprueba los tipos de TypeScript y genera la versión de
producción. `npm run preview` permite revisar localmente esa versión generada.

## Modelo de inferencia

El código de inferencia busca por defecto el modelo en `models/vigente`. Esta
ubicación puede cambiarse mediante la variable de entorno `MODEL_DIR`:

```powershell
$env:MODEL_DIR="C:\ruta\al\paquete-del-modelo"
python -m uvicorn src.api.main:app --reload
```

El paquete del modelo debe incluir sus metadatos (`package.json`) y los pesos
(`model.pt`). La configuración actual contiene un modelo con clases
`ANORMAL` y `NORMAL`.
