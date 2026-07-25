
import time
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from conftest import (
    REGISTRO_NOMBRE, REGISTRO_APELLIDO, REGISTRO_EMAIL, REGISTRO_PASS,
    REGISTRO_TELEFONO, USER_VALIDO,
    REGISTRO_INVALID_NAME, REGISTRO_INVALID_EMAIL,
    REGISTRO_INVALID_PHONE, REGISTRO_INVALID_PASS
)
from tests.helpers import (
    sa_logout, sa_ir_a, sa_llenar_formulario_registro, sa_llenar_campo,
    sa_encontrar_clickable, esperar_url_contiene, generar_email_unico
)


# ────────────────────────────────────────────────────
#  CASO 1: Registro exitoso
# ────────────────────────────────────────────────────
def test_registro_exitoso(driver, wait):
    """
    Llena el formulario de registro con datos válidos,
    envía y verifica redirección a /login + snackbar éxito.
    """
    email_unico = generar_email_unico()

    sa_ir_a(driver, "/register")
    time.sleep(2)
    print(f"\n🌐 Página cargada: {driver.current_url}")

    boton = sa_llenar_formulario_registro(
        wait,
        REGISTRO_NOMBRE,
        REGISTRO_APELLIDO,
        email_unico,
        REGISTRO_TELEFONO,
        REGISTRO_PASS,
    )
    print(f"📝 Nombre: {REGISTRO_NOMBRE}")
    print(f"📧 Email: {email_unico}")
    print(f"🔑 Password y teléfono llenados (desde .env)")

    driver.execute_script("arguments[0].click();", boton)
    print("🖱️  Click en 'Crear Cuenta'")

    esperar_url_contiene(wait, "login")
    print(f"✅ Redirigió a: {driver.current_url}")

    snackbar = wait.until(
        EC.visibility_of_element_located(
            (By.XPATH, '//*[contains(text(), "Cuenta creada con éxito")]')
        )
    )
    assert snackbar.is_displayed(), f"""
    ╔══════════════════════════════════════════════════════════╗
    ║  ❌ SNACKBAR DE ÉXITO NO APARECIÓ: FALLÓ               ║
    ╠══════════════════════════════════════════════════════════╣
    ║  Esperado: snackbar 'Cuenta creada con éxito'           ║
    ║  Obtenido: no se encontró el mensaje                    ║
    ║  Causa: El registro pudo fallar o el snackbar no        ║
    ║         se mostró en la página de login.                ║
    ╚══════════════════════════════════════════════════════════╝
    """
    print(f"✅ Snackbar visible: '{snackbar.text}'")

    sa_logout(driver, wait)


# ────────────────────────────────────────────────────
#  CASO 2: Email ya existente (debe mostrar error en español)
# ────────────────────────────────────────────────────
def test_registro_email_existente(driver, wait):
    """
    Intenta registrar con un email que ya existe.
    El mensaje de error DEBE estar en español.
    Si está en inglés → FAIL (bug de internacionalización).
    """
    sa_ir_a(driver, "/register")
    time.sleep(2)
    print(f"\n🌐 Página cargada: {driver.current_url}")

    boton = sa_llenar_formulario_registro(
        wait,
        REGISTRO_NOMBRE,
        REGISTRO_APELLIDO,
        USER_VALIDO,
        REGISTRO_TELEFONO,
        REGISTRO_PASS,
    )
    print(f"📧 Intentando registrar con email existente: {USER_VALIDO}")

    driver.execute_script("arguments[0].click();", boton)
    print("🖱️  Click en 'Crear Cuenta'")

    error = wait.until(
        EC.visibility_of_element_located(
            (By.XPATH, '//*[contains(@class, "MuiAlert-message")]')
        )
    )
    texto = error.text.strip()
    print(f"📄 Mensaje de error mostrado: '{texto}'")

    assert "already registered" not in texto.lower(), f"""
    ╔══════════════════════════════════════════════════════════╗
    ║  ❌ ERROR EN INGLÉS — SE ESPERABA EN ESPAÑOL: FALLÓ    ║
    ╠══════════════════════════════════════════════════════════╣
    ║  Mensaje actual: '{texto}'                                 ║
    ║  El backend debe devolver el error en español.          ║
    ╚══════════════════════════════════════════════════════════╝
    """
    print(f"✅ Error en español: '{texto}'")


# ────────────────────────────────────────────────────
#  CASO 3: Datos inválidos (Zod rechaza sin enviar)
# ────────────────────────────────────────────────────
def test_registro_campos_vacios(driver, wait):
    """
    Llena campos con datos inválidos, Zod debe rechazar
    y NO navegar a /login (permanece en /register).
    """
    sa_ir_a(driver, "/register")
    time.sleep(2)
    print(f"\n🌐 Página cargada: {driver.current_url}")

    sa_llenar_campo(wait, "signup_firstname", REGISTRO_INVALID_NAME)
    sa_llenar_campo(wait, "signup_lastname", REGISTRO_INVALID_NAME)
    sa_llenar_campo(wait, "signup_email", REGISTRO_INVALID_EMAIL)
    sa_llenar_campo(wait, "signup_phone", REGISTRO_INVALID_PHONE)
    sa_llenar_campo(wait, "signup_password", REGISTRO_INVALID_PASS)
    sa_llenar_campo(wait, "signup_confirm", REGISTRO_INVALID_PASS)
    print("📝 Datos inválidos llenados (desde .env)")

    btn = sa_encontrar_clickable(wait, "signup_button")
    btn.click()
    print("🖱️  Click en 'Crear Cuenta' con datos inválidos")
    time.sleep(2)

    assert "register" in driver.current_url, f"""
    ╔══════════════════════════════════════════════════════════╗
    ║  ❌ ZOD NO RECHAZÓ — NAVEGÓ A OTRA PÁGINA: FALLÓ       ║
    ╠══════════════════════════════════════════════════════════╣
    ║  Esperado: permanecer en /register (Zod frena el envío)  ║
    ║  Obtenido: '{driver.current_url[:60]}'                       ║
    ║  Causa: Zod no detectó los datos inválidos o el         ║
    ║         formulario se envió igual.                      ║
    ╚══════════════════════════════════════════════════════════╝
    """
    print(f"✅ Zod lo rechazó — permanece en /register")
