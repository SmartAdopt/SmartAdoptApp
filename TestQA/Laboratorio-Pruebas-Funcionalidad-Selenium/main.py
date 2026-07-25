"""
Punto de entrada del Laboratorio de Pruebas Funcionales con Selenium.

Modos de ejecución:
    python main.py                  → TODAS las pruebas
    python main.py login            → Solo login
    python main.py registro         → Solo registro
    python main.py e2e              → Flujo completo de adopción
    python main.py websocket        → Sincronización en tiempo real
    python main.py mascota          → Creación de perfil + subida de imagen
    python main.py perfil           → Actualización de datos de contacto
    python main.py catalogo         → Filtros y búsqueda del catálogo

Reporte HTML: reportes/reporte.html
Capturas: capturas/
"""

import sys
import os
import pytest


MODULOS = {
    "login": "tests/test_login.py",
    "registro": "tests/test_registro.py",
    "e2e": "tests/test_adopcion_e2e.py",
    "websocket": "tests/test_websocket_sync.py",
    "mascota": "tests/test_creacion_mascota.py",
    "perfil": "tests/test_actualizacion_perfil.py",
    "catalogo": "tests/test_filtros_catalogo.py",
}


def main():
    os.makedirs("reportes", exist_ok=True)

    args = [
        "-v",
        "--tb=short",
        "--html=reportes/reporte.html",
        "--self-contained-html",
        "-s",
    ]

    if len(sys.argv) > 1:
        modulo = sys.argv[1].lower()
        if modulo in MODULOS:
            args.append(MODULOS[modulo])
            print(f"Ejecutando solo pruebas de {modulo.upper()}...")
        else:
            print(f"Modulo '{modulo}' no reconocido.")
            print(f"Opciones validas: {', '.join(MODULOS.keys())}")
            print("Sin argumento ejecuta todas las pruebas.")
            sys.exit(1)
    else:
        args.append("tests/")
        print("Ejecutando TODAS las pruebas...")

    print("=" * 60)
    codigo_salida = pytest.main(args)

    print("=" * 60)
    if codigo_salida == 0:
        print("Todas las pruebas pasaron correctamente")
    else:
        print("Algunas pruebas fallaron")
    print(f"Reporte generado en: reportes/reporte.html")

    sys.exit(codigo_salida)


if __name__ == "__main__":
    main()
