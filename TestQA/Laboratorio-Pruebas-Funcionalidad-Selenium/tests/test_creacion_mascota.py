"""
Pruebas funcionales de CREACIÓN DE MASCOTA — SmartAdopt.

Flujo de creación de perfil con subida de archivos:

  CASO 1: Creación exitosa — Login, navegar, llenar formulario completo,
           subir imagen, publicar, verificar en catálogo y clickear mascota.

  CASO 2: Campos vacíos — Verificar que sin datos NI imagen el sistema
           muestra alerta JS "¡Debes subir una foto de la mascota!".

  CASO 3: Datos inválidos — Verificar que valores fuera de rango
           (nombre corto, edad negativa, peso cero, etc.) disparan
           errores de validación Zod en la UI.
"""

import os
import time
from datetime import datetime
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait
from conftest import (
    ADMIN_EMAIL, ADMIN_PASS,
    PET_TEST_NOMBRE, PET_TEST_RAZA, PET_TEST_EDAD,
    PET_TEST_PESO, PET_TEST_UBICACION, PET_TEST_BIOGRAFIA, RUTA_IMAGEN_TEST
)
from tests.helpers import (
    sa_login, sa_logout, sa_ir_a_admin_pets, sa_ir_a_login, sa_llenar_formulario_login,
    encontrar_clickable_xpath, esperar_url_contiene, obtener_token, llamada_api_get
)


def _ss(driver, paso):
    """Guarda una captura de pantalla con timestamp en la carpeta capturas/."""
    os.makedirs("capturas", exist_ok=True)
    ts = datetime.now().strftime("%H%M%S")
    archivo = f"capturas/PASO_{paso}_{ts}.png"
    driver.save_screenshot(archivo)
    print(f"📸 Captura: {archivo}")


def test_creacion_mascota_con_imagen(driver, wait):
    """
    Automatiza la creación de un perfil de mascota como Admin,
    navegando desde el Dashboard mediante el botón 'Añadir Mascota'.
    """
    # 1. Login como Admin
    sa_ir_a_login(driver)
    _ss(driver, "01_pagina_login")
    boton_login = sa_llenar_formulario_login(wait, ADMIN_EMAIL, ADMIN_PASS)
    _ss(driver, "02_login_rellenado")
    boton_login.click()
    esperar_url_contiene(wait, "dashboard")
    print(f"🌐 Login Admin exitoso — Dashboard: {driver.current_url}")
    _ss(driver, "03_dashboard")

    # 2. Navegar a "Añadir Mascota" desde el Dashboard
    btn_anadir = driver.find_element(
        By.XPATH, "//h6[text()='Añadir Mascota']/ancestor::div[contains(@class,'MuiPaper')]//button"
    )
    driver.execute_script("arguments[0].click();", btn_anadir)
    time.sleep(3)
    esperar_url_contiene(wait, "admin/pets/new")
    print(f"🌐 Página 'Añadir Nueva Mascota' cargada: {driver.current_url}")
    _ss(driver, "04_formulario_vacio")

    # 3. Llenar formulario — Especie (MUI Select)
    combobox_especie = driver.find_element(
        By.XPATH, "//label[contains(text(),'Especie')]/..//div[@role='combobox']"
    )
    combobox_especie.click()
    time.sleep(2)
    wait.until(
        EC.presence_of_element_located((By.XPATH, "//li[contains(.,'Perro') and @role='option']"))
    ).click()
    print("🐕 Especie: Perro — seleccionada")
    time.sleep(1)

    # Llenar campos de texto
    nombre = PET_TEST_NOMBRE or "SeleniumTest"
    raza = PET_TEST_RAZA or "Labrador"
    edad = str(PET_TEST_EDAD or 3)
    peso = str(PET_TEST_PESO or 25.5)
    ubicacion = PET_TEST_UBICACION or "Quito, Refugio Principal"

    for selector, valor, etiqueta in [
        ('input[name="nombre"]', nombre, "Nombre"),
        ('input[name="raza"]', raza, "Raza"),
        ('input[name="edad"]', edad, "Edad"),
        ('input[name="peso"]', peso, "Peso"),
        ('input[name="ubicacion"]', ubicacion, "Ubicación"),
    ]:
        campo = driver.find_element(By.CSS_SELECTOR, selector)
        campo.clear()
        campo.send_keys(valor)
        print(f"📝 {etiqueta}: {valor}")

    # Seleccionar género (MUI Select)
    combobox_genero = driver.find_element(
        By.XPATH, "//label[contains(text(),'Género')]/..//div[@role='combobox']"
    )
    combobox_genero.click()
    time.sleep(2)
    wait.until(
        EC.presence_of_element_located((By.XPATH, "//li[contains(.,'Macho') and @role='option']"))
    ).click()
    print("⚧️  Género: Macho — seleccionado")
    time.sleep(1)

    # Marcar checkboxes médicos (con JS para evitar solapamiento)
    for nombre_cbx in ["esterilizado", "desparasitado"]:
        driver.execute_script(
            "arguments[0].click();",
            driver.find_element(By.XPATH, f"//input[@name='{nombre_cbx}']")
        )
        print(f"✅ {nombre_cbx} — marcado")

    # Marcar algunas vacunas dinámicas
    for vacuna in ["Rabia", "Parvovirus"]:
        try:
            driver.execute_script(
                "arguments[0].click();",
                driver.find_element(By.XPATH, f"//span[text()='{vacuna}']")
            )
            print(f"✅ Vacuna {vacuna} — marcada")
        except Exception:
            print(f"⚠️  Vacuna {vacuna} — no encontrada")

    # 4. Subir imagen
    rutas_posibles = [
        RUTA_IMAGEN_TEST,
        os.path.abspath("test_dog.jpg"),
        os.path.abspath("capturas/test_dog.jpg"),
        os.path.expanduser("~/Downloads/test_dog.jpg"),
        r"C:\Users\javie\Downloads\test_dog.jpg",
    ]
    ruta_imagen = next((r for r in rutas_posibles if r and os.path.exists(r)), None)
    if ruta_imagen:
        file_input = driver.find_element(By.CSS_SELECTOR, 'input[type="file"]')
        file_input.send_keys(ruta_imagen)
        time.sleep(2)
        print(f"🖼️  Imagen subida desde: {ruta_imagen}")
    else:
        print(f"⚠️  No se encontró imagen. Busqué en: {rutas_posibles}")

    # Llenar biografía
    biografia = PET_TEST_BIOGRAFIA or "Selenium test: perro amigable y juguetón ideal para familias"
    bio = driver.find_element(By.CSS_SELECTOR, 'textarea[name="biografia"]')
    bio.clear()
    bio.send_keys(biografia)
    print(f"📝 Biografía llenada: {biografia}")
    _ss(driver, "05_formulario_lleno")

    # 5. Publicar perfil
    btn_publicar = encontrar_clickable_xpath(
        wait, '//button[contains(text(), "Publicar Perfil de Mascota")]'
    )
    driver.execute_script("arguments[0].scrollIntoView(true);", btn_publicar)
    time.sleep(1)
    driver.execute_script("arguments[0].click();", btn_publicar)
    print("🖱️  Click en 'Publicar Perfil de Mascota'")

    # Esperar hasta 90s a que termine la subida (IA + Backblaze B2)
    for _ in range(45):
        time.sleep(2)
        # Éxito: salió la pantalla de "Perfil Registrado"
        try:
            exito = driver.find_element(By.XPATH, '//*[contains(text(), "Perfil Registrado")]')
            if exito.is_displayed():
                print(f"✅ Perfil registrado: '{exito.text}'")
                _ss(driver, "06_perfil_registrado")
                break
        except Exception:
            pass
        # Éxito: redirigió al catálogo
        if "admin/pets" in driver.current_url and "new" not in driver.current_url:
            print(f"✅ Redirigido al catálogo: {driver.current_url}")
            break
        # Error: alerta JS
        try:
            alert = driver.switch_to.alert
            print(f"⚠️  Alerta: '{alert.text}'")
            alert.accept()
            break
        except Exception:
            pass
    else:
        print("⚠️  Timeout esperando resultado de la creación")

    # 6. Hacer clic en "Ver Catálogo de Mascotas" desde la pantalla de éxito
    for _ in range(15):
        try:
            btn_catalogo = driver.find_element(
                By.XPATH, '//button[contains(text(), "Ver Catálogo de Mascotas")]'
            )
            if btn_catalogo.is_displayed():
                driver.execute_script("arguments[0].click();", btn_catalogo)
                print("🖱️  Click en 'Ver Catálogo de Mascotas'")
                time.sleep(3)
                _ss(driver, "07_catalogo")
                break
        except Exception:
            pass
        time.sleep(2)
    else:
        if "admin/pets" not in driver.current_url:
            sa_ir_a_admin_pets(driver)
            time.sleep(3)

    # Esperar hasta 45s a que aparezca la mascota en el listado
    marca_inicio = time.time()
    while time.time() - marca_inicio < 45:
        try:
            mascota_en_lista = driver.find_element(
                By.XPATH, f'//*[contains(text(), "{nombre}")]'
            )
            if mascota_en_lista.is_displayed():
                # Scroll para asegurar visibilidad antes del click
                driver.execute_script("arguments[0].scrollIntoView(true);", mascota_en_lista)
                time.sleep(1)
                mascota_en_lista.click()
                time.sleep(2)
                print(f"✅ PRUEBA PASÓ — '{nombre}' encontrado y clickeado en el catálogo")
                _ss(driver, "08_mascota_clickeada")
                break
        except Exception:
            pass
        time.sleep(2)
        driver.refresh()
        time.sleep(3)
    else:
        mascota_en_lista = WebDriverWait(driver, 15).until(
            EC.visibility_of_element_located(
                (By.XPATH, f'//*[contains(text(), "{nombre}")]')
            )
        )
        mascota_en_lista.click()
        time.sleep(2)
        _ss(driver, "08_mascota_clickeada")

    # Validación vía API (opcional — no detiene el test)
    try:
        token = obtener_token(driver)
        for ruta in ["/pets/", "/pets", "/api/pets/"]:
            resp = llamada_api_get(token, ruta)
            if resp.status_code == 200:
                data = resp.json()
                nombres = [p.get("pet", {}).get("name", "") for p in data.get("pets", [])]
                if nombre in nombres:
                    print(f"✅ Validación API — '{nombre}' encontrado en GET {ruta}")
                else:
                    print(f"ℹ️  Nombres en API: {nombres}")
                break
        else:
            print(f"⚠️  API de mascotas no disponible")
    except Exception as e:
        print(f"⚠️  Validación API omitida: {e}")

    # Limpieza
    sa_logout(driver, wait)
    _ss(driver, "09_fin")
    print("🔒 Sesión cerrada")
    print("✅ PRUEBA COMPLETADA — Creación de mascota exitosa")


# ════════════════════════════════════════════════════════════
#  CASO 2: Creación con campos vacíos — validación Zod/MUI
# ════════════════════════════════════════════════════════════
def test_creacion_mascota_campos_vacios(driver, wait):
    """
    Verifica que al enviar el formulario completamente vacío,
    el sistema muestre errores de validación inline (MUI helperText)
    en cada campo requerido sin llegar a enviar la petición.
    """
    from tests.helpers import sa_login

    # 1. Login como Admin
    sa_login(driver, wait, ADMIN_EMAIL, ADMIN_PASS)
    esperar_url_contiene(wait, "dashboard")
    print(f"\n🌐 Login Admin exitoso — Dashboard")

    # 2. Navegar al formulario
    btn_anadir = driver.find_element(
        By.XPATH, "//h6[text()='Añadir Mascota']/ancestor::div[contains(@class,'MuiPaper')]//button"
    )
    driver.execute_script("arguments[0].click();", btn_anadir)
    time.sleep(2)
    esperar_url_contiene(wait, "admin/pets/new")
    print(f"🌐 Formulario cargado: {driver.current_url}")

    # 3. Click en Publicar sin llenar nada ni subir imagen
    btn_publicar = wait.until(
        EC.element_to_be_clickable(
            (By.XPATH, '//button[contains(text(), "Publicar Perfil de Mascota")]')
        )
    )
    driver.execute_script("arguments[0].click();", btn_publicar)
    print("🖱️  Click en 'Publicar Perfil de Mascota' sin datos")
    time.sleep(2)

    # 4. VALIDACIÓN: La URL debe seguir siendo el formulario
    assert "admin/pets/new" in driver.current_url, f"""
    ╔══════════════════════════════════════════════════════════╗
    ║  ❌ VALIDACIÓN DE FORMULARIO VACÍO: FALLÓ               ║
    ╠══════════════════════════════════════════════════════════╣
    ║  Se esperaba: URL conteniendo 'admin/pets/new'           ║
    ║  Resultado:   '{driver.current_url}'                      ║
    ║  Causa probable: La app permitió el envío del formulario ║
    ║                  vacío sin validación previa (Zod/MUI).  ║
    ╚══════════════════════════════════════════════════════════╝
    """

    errores_campos_vacios = [
        ("Nombre",     "El nombre es muy corto"),
        ("Raza",       "La raza es requerida"),
        ("Edad",       "Debes ingresar una edad válida"),
        ("Peso",       "Debes ingresar un peso válido"),
        ("Ubicación",  "La ubicación es requerida"),
        ("IA/Bio",     "Añade una breve descripción"),
    ]

    for campo, msg in errores_campos_vacios:
        try:
            err = driver.find_element(By.XPATH, f"//*[contains(text(), '{msg}')]")
            assert err.is_displayed(), f"""
    ╔══════════════════════════════════════════════════════════╗
    ║  ❌ CAMPO '{campo}' FALLÓ                                ║
    ╠══════════════════════════════════════════════════════════╣
    ║  Se esperaba: mensaje de error '{msg}'                    ║
    ║  Resultado:   ELEMENTO OCULTO (existe en DOM,            ║
    ║               pero no es visible en pantalla)            ║
    ║  Causa probable: El helperText del campo '{campo}'        ║
    ║                  existe pero no se muestra visualmente.  ║
    ╚══════════════════════════════════════════════════════════╝
            """
            print(f"  ✅ {campo}: '{err.text}'")
        except AssertionError:
            print(f"  ❌ {campo}: FALLÓ — error oculto en UI")
            raise
        except Exception:
            print(f"  ❌ {campo}: FALLÓ — '{msg}' AUSENTE en DOM")
            assert False, f"""
    ╔══════════════════════════════════════════════════════════╗
    ║  ❌ CAMPO '{campo}' FALLÓ                                ║
    ╠══════════════════════════════════════════════════════════╣
    ║  Se esperaba: mensaje de error '{msg}'                    ║
    ║  Resultado:   ELEMENTO NO ENCONTRADO                     ║
    ║  Causa probable: La app NO está validando el campo       ║
    ║                  '{campo}' como requerido al enviar vacío.║
    ║  Revisar: esquema Zod y helperText en MUI TextField.    ║
    ╚══════════════════════════════════════════════════════════╝
            """

    print(f"  ✅ PRUEBA PASÓ → {len(errores_campos_vacios)}/{len(errores_campos_vacios)} validaciones correctas")

    # Limpieza
    sa_logout(driver, wait)
    print("🔒 Sesión cerrada")


# ════════════════════════════════════════════════════════════
#  CASO 3: Creación con datos inválidos — validación Zod/MUI
# ════════════════════════════════════════════════════════════
def test_creacion_mascota_datos_invalidos(driver, wait):
    """
    Verifica que el formulario rechace valores fuera de rango:
    nombre muy corto (1 char), raza vacía, edad negativa (-1),
    peso cero (0), ubicación muy corta (2 chars), biografía
    menor a 10 caracteres. Cada error debe mostrarse en UI.
    """
    from tests.helpers import sa_login

    # 1. Login como Admin
    sa_login(driver, wait, ADMIN_EMAIL, ADMIN_PASS)
    esperar_url_contiene(wait, "dashboard")
    print(f"\n🌐 Login Admin exitoso — Dashboard")

    # 2. Navegar al formulario
    btn_anadir = driver.find_element(
        By.XPATH, "//h6[text()='Añadir Mascota']/ancestor::div[contains(@class,'MuiPaper')]//button"
    )
    driver.execute_script("arguments[0].click();", btn_anadir)
    time.sleep(2)
    esperar_url_contiene(wait, "admin/pets/new")
    print(f"🌐 Formulario cargado: {driver.current_url}")

    # 3. Subir imagen válida (para que pase la validación de imagen y llegue a Zod)
    rutas = [
        RUTA_IMAGEN_TEST,
        os.path.abspath("test_dog.jpg"),
        os.path.abspath("capturas/test_dog.jpg"),
        os.path.expanduser("~/Downloads/test_dog.jpg"),
        r"C:\Users\javie\Downloads\test_dog.jpg",
    ]
    ruta_img = next((r for r in rutas if r and os.path.exists(r)), None)
    if ruta_img:
        driver.find_element(By.CSS_SELECTOR, 'input[type="file"]').send_keys(ruta_img)
        time.sleep(1)
        print(f"🖼️  Imagen subida correctamente")
    else:
        print(f"⚠️  No se encontró imagen de prueba — los errores Zod deberían aun así detectarse")

    # 4. Llenar campos con datos deliberadamente inválidos
    campos_invalidos = [
        ('input[name="nombre"]', "A", "Nombre demasiado corto (< 2 chars)"),
        ('input[name="raza"]', "", "Raza vacía"),
        ('input[name="edad"]', "-1", "Edad negativa"),
        ('input[name="peso"]', "0", "Peso cero (mínimo 0.1)"),
        ('input[name="ubicacion"]', "AB", "Ubicación muy corta (< 3 chars)"),
    ]
    for selector, valor, desc in campos_invalidos:
        campo = driver.find_element(By.CSS_SELECTOR, selector)
        campo.clear()
        campo.send_keys(valor)
        print(f"📝 {desc}: ingresado '{valor}'")

    # Biografía muy corta
    bio = driver.find_element(By.CSS_SELECTOR, 'textarea[name="biografia"]')
    bio.clear()
    bio.send_keys("Corto")
    print("📝 Biografía: 'Corto' (menos de 10 caracteres)")

    # 5. Click en Publicar
    btn_publicar = wait.until(
        EC.element_to_be_clickable(
            (By.XPATH, '//button[contains(text(), "Publicar Perfil de Mascota")]')
        )
    )
    driver.execute_script("arguments[0].click();", btn_publicar)
    print("🖱️  Click en 'Publicar Perfil de Mascota' con datos inválidos")
    time.sleep(2)

    # 6. VALIDACIÓN: La URL debe seguir siendo el formulario
    assert "admin/pets/new" in driver.current_url, f"""
    ╔══════════════════════════════════════════════════════════╗
    ║  ❌ VALIDACIÓN DE DATOS INVÁLIDOS: FALLÓ                ║
    ╠══════════════════════════════════════════════════════════╣
    ║  Se esperaba: URL conteniendo 'admin/pets/new'           ║
    ║  Resultado:   '{driver.current_url}'                      ║
    ║  Causa probable: La app envió el formulario sin          ║
    ║                  detectar datos inválidos (Zod no actuó).║
    ╚══════════════════════════════════════════════════════════╝
    """

    # 7. Verificar cada error campo por campo
    validaciones = [
        ("Nombre corto",    "El nombre es muy corto"),
        ("Raza vacía",      "La raza es requerida"),
        ("Edad negativa",   "Debes ingresar una edad válida"),
        ("Peso cero",       "Peso inválido"),
        ("Ubicación corta", "La ubicación es requerida"),
        ("Biografía corta", "Añade una breve descripción"),
    ]

    for campo, msg in validaciones:
        try:
            err = driver.find_element(By.XPATH, f"//*[contains(text(), '{msg}')]")
            assert err.is_displayed(), f"""
    ╔══════════════════════════════════════════════════════════╗
    ║  ❌ VALIDACIÓN '{campo}' FALLÓ                           ║
    ╠══════════════════════════════════════════════════════════╣
    ║  Se esperaba: mensaje de error '{msg}'                    ║
    ║  Resultado:   ELEMENTO OCULTO (existe en DOM pero        ║
    ║               no es visible en pantalla)                 ║
    ║  Causa probable: helperText existe pero no se muestra.   ║
    ║  Revisar: condición de error en el esquema Zod.         ║
    ╚══════════════════════════════════════════════════════════╝
            """
            print(f"  ✅ {campo}: '{err.text}'")
        except AssertionError:
            print(f"  ❌ {campo}: FALLÓ — error oculto en UI")
            raise
        except Exception:
            print(f"  ❌ {campo}: FALLÓ — '{msg}' AUSENTE en DOM")
            assert False, f"""
    ╔══════════════════════════════════════════════════════════╗
    ║  ❌ VALIDACIÓN '{campo}' FALLÓ                           ║
    ╠══════════════════════════════════════════════════════════╣
    ║  Se esperaba: mensaje de error '{msg}'                    ║
    ║  Resultado:   ELEMENTO NO ENCONTRADO en el DOM           ║
    ║  Causa probable: La app NO está mostrando el error       ║
    ║                  para el caso '{campo}'.                  ║
    ║  Revisar: validación de '{campo}' en el esquema Zod.     ║
    ╚══════════════════════════════════════════════════════════╝
            """

    print(f"  ✅ PRUEBA PASÓ → {len(validaciones)}/{len(validaciones)} validaciones correctas")

    # Limpieza
    sa_logout(driver, wait)
    print("🔒 Sesión cerrada")
