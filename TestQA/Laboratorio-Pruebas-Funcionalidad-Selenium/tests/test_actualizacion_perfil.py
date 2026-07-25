
import time
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from conftest import ADOPTER_EMAIL, ADOPTER_PASS, PERFIL_NUEVO_PASS
from tests.helpers import (
    sa_login, sa_logout, sa_ir_a_perfil,
    esperar_url_contiene, encontrar_clickable_xpath
)


NUEVO_PASS = PERFIL_NUEVO_PASS


def _abrir_dialogo_contrasena(driver, wait):
    """Navega a perfil y abre el diálogo de cambio de contraseña."""
    sa_ir_a_perfil(driver)
    time.sleep(2)
    btn = encontrar_clickable_xpath(wait, '//button[contains(text(), "Cambiar Contraseña")]')
    driver.execute_script("arguments[0].click();", btn)
    time.sleep(1)
    wait.until(
        EC.visibility_of_element_located(
            (By.XPATH, '//div[@role="dialog"]//h2[contains(text(), "Cambiar Contraseña")]')
        )
    )
    print("🖱️  Diálogo 'Cambiar Contraseña' abierto")


def _llenar_y_enviar(driver, wait, current, new_pass, confirm):
    """Llena los 3 campos del diálogo y hace click en enviar.
    Usa JavaScript nativo para setear valores en inputs controlados por React Hook Form.
    """
    def _escribir(selector, valor):
        campo = driver.find_element(By.CSS_SELECTOR, selector)
        driver.execute_script("""
            const input = arguments[0];
            const nativeSetter = Object.getOwnPropertyDescriptor(
                window.HTMLInputElement.prototype, 'value'
            ).set;
            nativeSetter.call(input, arguments[1]);
            input.dispatchEvent(new Event('input', { bubbles: true }));
        """, campo, valor)
    _escribir('input[name="currentPassword"]', current)
    _escribir('input[name="newPassword"]', new_pass)
    _escribir('input[name="confirmPassword"]', confirm)
    btn = wait.until(
        EC.element_to_be_clickable(
            (By.XPATH, '//div[@role="dialog"]//button[contains(text(), "Cambiar Contraseña")]')
        )
    )
    driver.execute_script("arguments[0].click();", btn)
    print("🖱️  Formulario enviado")
    time.sleep(2)


# ────────────────────────────────────────────────────
#  CASO 2: Sin letra mayúscula
# ────────────────────────────────────────────────────
def test_perfil_contrasena_sin_mayuscula(driver, wait):
    """
    newPassword sin mayúscula → debe mostrar error
    'Debe contener al menos una letra mayúscula'.
    """
    sa_login(driver, wait, ADOPTER_EMAIL, ADOPTER_PASS)
    esperar_url_contiene(wait, "dashboard")
    print(f"\n🌐 Login Adopter exitoso — Dashboard")

    _abrir_dialogo_contrasena(driver, wait)
    _llenar_y_enviar(driver, wait, ADOPTER_PASS, "abcdefgh1", "abcdefgh1")

    # El diálogo debe seguir abierto
    dialogo = driver.find_elements(By.XPATH, '//div[@role="dialog"]//h2[contains(text(), "Cambiar Contraseña")]')
    assert len(dialogo) > 0, f"""
    ╔══════════════════════════════════════════════════════════╗
    ║  ❌ SIN MAYÚSCULA: FALLÓ                                ║
    ╠══════════════════════════════════════════════════════════╣
    ║  Esperado: diálogo sigue abierto (Zod rechazó)          ║
    ║  Obtenido: el diálogo se cerró (se envió al backend)    ║
    ║  Causa: La app no validó que newPassword tenga          ║
    ║         al menos una mayúscula.                         ║
    ╚══════════════════════════════════════════════════════════╝
    """
    print("  ✅ Diálogo permanece abierto (Zod bloqueó el envío)")

    err = driver.find_element(
        By.XPATH,
        '//input[@name="newPassword"]/ancestor::div[contains(@class,"MuiTextField")]'
        '//p[contains(text(), "mayúscula")]'
    )
    assert err.is_displayed(), f"""
    ╔══════════════════════════════════════════════════════════╗
    ║  ❌ SIN MAYÚSCULA: FALLÓ                                ║
    ╠══════════════════════════════════════════════════════════╣
    ║  Esperado: 'Debe contener al menos una letra mayúscula'  ║
    ║  Obtenido: error no visible                             ║
    ║  Causa: Zod no está validando mayúscula en newPassword. ║
    ╚══════════════════════════════════════════════════════════╝
    """
    print(f"  ✅ Error mostrado: '{err.text}'")
    sa_logout(driver, wait)
    print("🔒 Sesión cerrada")


# ────────────────────────────────────────────────────
#  CASO 3: Sin número
# ────────────────────────────────────────────────────
def test_perfil_contrasena_sin_numero(driver, wait):
    """
    newPassword sin número → debe mostrar error
    'Debe contener al menos un número'.
    """
    sa_login(driver, wait, ADOPTER_EMAIL, ADOPTER_PASS)
    esperar_url_contiene(wait, "dashboard")
    print(f"\n🌐 Login Adopter exitoso — Dashboard")

    _abrir_dialogo_contrasena(driver, wait)
    _llenar_y_enviar(driver, wait, ADOPTER_PASS, "Abcdefghi", "Abcdefghi")

    dialogo = driver.find_elements(By.XPATH, '//div[@role="dialog"]//h2[contains(text(), "Cambiar Contraseña")]')
    assert len(dialogo) > 0, f"""
    ╔══════════════════════════════════════════════════════════╗
    ║  ❌ SIN NÚMERO: FALLÓ                                   ║
    ╠══════════════════════════════════════════════════════════╣
    ║  Esperado: diálogo sigue abierto (Zod rechazó)          ║
    ║  Obtenido: el diálogo se cerró                          ║
    ║  Causa: La app no validó que newPassword tenga número.  ║
    ╚══════════════════════════════════════════════════════════╝
    """
    print("  ✅ Diálogo permanece abierto")

    err = driver.find_element(
        By.XPATH,
        '//input[@name="newPassword"]/ancestor::div[contains(@class,"MuiTextField")]'
        '//p[contains(text(), "número")]'
    )
    assert err.is_displayed(), f"""
    ╔══════════════════════════════════════════════════════════╗
    ║  ❌ SIN NÚMERO: FALLÓ                                   ║
    ╠══════════════════════════════════════════════════════════╣
    ║  Esperado: 'Debe contener al menos un número'            ║
    ║  Obtenido: error no visible                             ║
    ║  Causa: Zod no está validando número en newPassword.    ║
    ╚══════════════════════════════════════════════════════════╝
    """
    print(f"  ✅ Error mostrado: '{err.text}'")
    sa_logout(driver, wait)
    print("🔒 Sesión cerrada")


# ────────────────────────────────────────────────────
#  CASO 4: Contraseñas no coinciden
# ────────────────────────────────────────────────────
def test_perfil_contrasena_no_coinciden(driver, wait):
    """
    confirmPassword diferente a newPassword → debe mostrar
    'Las contraseñas no coinciden'.
    """
    sa_login(driver, wait, ADOPTER_EMAIL, ADOPTER_PASS)
    esperar_url_contiene(wait, "dashboard")
    print(f"\n🌐 Login Adopter exitoso — Dashboard")

    _abrir_dialogo_contrasena(driver, wait)
    _llenar_y_enviar(driver, wait, ADOPTER_PASS, NUEVO_PASS, "OtraPass1")

    dialogo = driver.find_elements(By.XPATH, '//div[@role="dialog"]//h2[contains(text(), "Cambiar Contraseña")]')
    assert len(dialogo) > 0, f"""
    ╔══════════════════════════════════════════════════════════╗
    ║  ❌ NO COINCIDEN: FALLÓ                                 ║
    ╠══════════════════════════════════════════════════════════╣
    ║  Esperado: diálogo sigue abierto (Zod rechazó)          ║
    ║  Obtenido: el diálogo se cerró                          ║
    ║  Causa: La app no validó que confirmPassword coincida.  ║
    ╚══════════════════════════════════════════════════════════╝
    """
    print("  ✅ Diálogo permanece abierto")

    err = driver.find_element(
        By.XPATH,
        '//input[@name="confirmPassword"]/ancestor::div[contains(@class,"MuiTextField")]'
        '//p[contains(text(), "no coinciden")]'
    )
    assert err.is_displayed(), f"""
    ╔══════════════════════════════════════════════════════════╗
    ║  ❌ NO COINCIDEN: FALLÓ                                 ║
    ╠══════════════════════════════════════════════════════════╣
    ║  Esperado: 'Las contraseñas no coinciden'                ║
    ║  Obtenido: error no visible                             ║
    ║  Causa: Zod no está validando coincidencia de           ║
    ║         confirmPassword.                                ║
    ╚══════════════════════════════════════════════════════════╝
    """
    print(f"  ✅ Error mostrado: '{err.text}'")
    sa_logout(driver, wait)
    print("🔒 Sesión cerrada")


# ────────────────────────────────────────────────────
#  CASO 5: Contraseña igual a la actual
# ────────────────────────────────────────────────────
def test_perfil_contrasena_igual_actual(driver, wait):
    """
    newPassword igual a currentPassword → debe mostrar
    'La nueva contraseña debe ser diferente a la actual'.
    """
    sa_login(driver, wait, ADOPTER_EMAIL, ADOPTER_PASS)
    esperar_url_contiene(wait, "dashboard")
    print(f"\n🌐 Login Adopter exitoso — Dashboard")

    _abrir_dialogo_contrasena(driver, wait)
    _llenar_y_enviar(driver, wait, ADOPTER_PASS, ADOPTER_PASS, ADOPTER_PASS)

    dialogo = driver.find_elements(By.XPATH, '//div[@role="dialog"]//h2[contains(text(), "Cambiar Contraseña")]')
    assert len(dialogo) > 0, f"""
    ╔══════════════════════════════════════════════════════════╗
    ║  ❌ IGUAL ACTUAL: FALLÓ                                 ║
    ╠══════════════════════════════════════════════════════════╣
    ║  Esperado: diálogo sigue abierto (Zod rechazó)          ║
    ║  Obtenido: el diálogo se cerró                          ║
    ║  Causa: La app no validó que la nueva contraseña        ║
    ║         sea diferente a la actual.                      ║
    ╚══════════════════════════════════════════════════════════╝
    """
    print("  ✅ Diálogo permanece abierto")

    err = driver.find_element(
        By.XPATH,
        '//input[@name="newPassword"]/ancestor::div[contains(@class,"MuiTextField")]'
        '//p[contains(text(), "diferente")]'
    )
    assert err.is_displayed(), f"""
    ╔══════════════════════════════════════════════════════════╗
    ║  ❌ IGUAL ACTUAL: FALLÓ                                 ║
    ╠══════════════════════════════════════════════════════════╣
    ║  Esperado: 'La nueva contraseña debe ser diferente'      ║
    ║  Obtenido: error no visible                             ║
    ║  Causa: Zod no está validando que newPassword sea       ║
    ║         diferente a currentPassword.                    ║
    ╚══════════════════════════════════════════════════════════╝
    """
    print(f"  ✅ Error mostrado: '{err.text}'")
    sa_logout(driver, wait)
    print("🔒 Sesión cerrada")


# ────────────────────────────────────────────────────
#  CASO 6: Sin símbolos — debe ser rechazada
# ────────────────────────────────────────────────────
def test_perfil_contrasena_sin_simbolos(driver, wait):
    """
    Verifica que el sistema NO permita almacenar una contraseña
    que no contenga al menos un carácter especial/símbolo.
    La contraseña 'SeleniumTest1' tiene mayúscula, minúscula y
    número, pero ningún símbolo → debe ser rechazada.
    """
    sa_login(driver, wait, ADOPTER_EMAIL, ADOPTER_PASS)
    esperar_url_contiene(wait, "dashboard")
    print(f"\n🌐 Login Adopter exitoso — Dashboard")

    _abrir_dialogo_contrasena(driver, wait)
    _llenar_y_enviar(driver, wait, ADOPTER_PASS, "SinSimbolos1", "SinSimbolos1")

    dialogo = driver.find_elements(By.XPATH, '//div[@role="dialog"]//h2[contains(text(), "Cambiar Contraseña")]')
    assert len(dialogo) > 0, f"""
    ╔══════════════════════════════════════════════════════════╗
    ║  ❌ SIN SÍMBOLOS: FALLÓ — Validación faltante           ║
    ╠══════════════════════════════════════════════════════════╣
    ║  Esperado: el diálogo sigue abierto (contraseña sin      ║
    ║            símbolos fue rechazada por Zod o backend)     ║
    ║  Obtenido: el diálogo se cerró → la contraseña fue       ║
    ║            aceptada a pesar de no tener símbolos.        ║
    ║  Causa: Ni Zod ni el backend validan que la contraseña   ║
    ║         contenga al menos un carácter especial.          ║
    ║  Acción requerida: Agregar .regex(/[!@#$%^&*()_+]/)     ║
    ║         en el esquema Zod de AdopterProfile.tsx y        ║
    ║         @field_validator en auth_schemas.py.             ║
    ╚══════════════════════════════════════════════════════════╝
    """
    print("  ✅ Diálogo permanece abierto (contraseña rechazada correctamente)")

    try:
        err = driver.find_element(
            By.XPATH,
            '//input[@name="newPassword"]/ancestor::div[contains(@class,"MuiTextField")]'
            '//p[contains(text(), "símbolo") or contains(text(), "especial") or contains(text(), "character") or contains(text(), "special")]'
        )
        assert err.is_displayed(), "Error oculto"
        print(f"  ✅ Error mostrado: '{err.text}'")
    except Exception:
        try:
            err_api = driver.find_element(By.XPATH, '//div[@role="dialog"]//div[@role="alert"]')
            print(f"  ⚠️  Error del backend: '{err_api.text}'")
        except Exception:
            print("  ⚠️  No se encontró mensaje de error específico sobre símbolos")

    sa_logout(driver, wait)
    print("🔒 Sesión cerrada")


# ────────────────────────────────────────────────────
#  CASO 1 (al final): Cambio exitoso con restauración
# ────────────────────────────────────────────────────
def test_perfil_cambio_contrasena(driver, wait):
    """
    Cambia la contraseña del Adopter, verifica que el diálogo
    se cierre (indicando éxito), y termina.
    """
    sa_login(driver, wait, ADOPTER_EMAIL, "SinSimbolos1")
    esperar_url_contiene(wait, "dashboard")
    print(f"\n🌐 Login Adopter exitoso — Dashboard")

    _abrir_dialogo_contrasena(driver, wait)

    _llenar_y_enviar(driver, wait, "SinSimbolos1", NUEVO_PASS, NUEVO_PASS)

    wait.until(
        EC.invisibility_of_element_located(
            (By.XPATH, '//div[@role="dialog"]//h2[contains(text(), "Cambiar Contraseña")]')
        )
    )
    print("✅ Diálogo cerrado — contraseña cambiada exitosamente")

    sa_logout(driver, wait)
    print("🔒 Sesión cerrada")
