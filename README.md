# Guías de Estudio Interactivas - Red Hat

Este repositorio contiene las guías de estudio interactivas (SPA) creadas a partir de los manuales en PDF de Red Hat para los siguientes cursos:

*   **[199 (RH199)](./199)**: Red Hat Certified System Administrator (RHCSA) - Rapid Track (RHEL 10.0). 
*   **[294 (RH294)](./294)**: Red Hat Certified Engineer (RHCE) - Ansible Automation (RHEL 9.0).

---

## 🚀 Cómo ejecutar las aplicaciones

Debido a las políticas de seguridad de los navegadores (CORS), no es posible abrir directamente los archivos `index.html` usando el protocolo `file://` (doble clic desde el explorador de archivos). Se requiere servir los archivos mediante un servidor web local.

### Paso 1: Iniciar el servidor local (Python 3)

Puedes iniciar un servidor web local de forma rápida utilizando **Python 3** en cualquiera de las carpetas de los cursos.

#### Para el curso RH199:
```bash
cd 199
python3 -m http.server 8000
```

#### Para el curso RH294:
```bash
cd 294
python3 -m http.server 8000
```

### Paso 2: Visualizar la aplicación

Una vez que el servidor esté en ejecución, abre tu navegador y accede a:

👉 **[http://localhost:8000](http://localhost:8000)**

---

## 🛠️ Extracción y traducción (Desarrollo)

Si necesitas volver a extraer o actualizar el contenido desde los manuales PDF:

1. Asegúrate de tener las dependencias necesarias de python instaladas en el entorno virtual (`.venv` en la carpeta `294` o en la carpeta raíz según corresponda).
2. Ejecuta el script correspondiente de procesamiento en la carpeta deseada:
   ```bash
   python3 extract_and_translate.py
   ```
