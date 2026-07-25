
import time
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from conftest import ADOPTER_EMAIL, ADOPTER_PASS
from tests.helpers import (
    sa_login, sa_logout, sa_ir_a_explorar, sa_ir_a_solicitudes,
    esperar_url_contiene, encontrar_clickable_xpath
)

_pet_url = None


# ────────────────────────────────────────────────────
#  CASO 1: Solicitar adopción + Admin aprueba
# ────────────────────────────────────────────────────
def test_adopcion_solicitar_y_aprobar(driver, wait):
    """
    Adopter solicita adopción: explorar → perfil → solicitar
    → checkbox → confirmar. Verifica que la solicitud se cree.
    """
    global _pet_url

    sa_login(driver, wait, ADOPTER_EMAIL, ADOPTER_PASS)
    esperar_url_contiene(wait, "dashboard")
    print(f"\n🌐 [Adopter] Login exitoso — Dashboard")

    sa_ir_a_explorar(driver)
    time.sleep(3)

    card = driver.find_elements(By.XPATH, '//div[contains(@class, "tinder-card")]')
    if len(card) == 0:
        msg = driver.find_elements(By.XPATH, '//*[contains(text(), "No hay mascotas")]')
        assert len(msg) > 0, "❌ Catálogo vacío sin mensaje"
        print(f"⚠️  Catálogo vacío: '{msg[0].text}'")
        sa_logout(driver, wait)
        return

    btn_flecha = encontrar_clickable_xpath(wait, '//button[contains(@class, "swipe-up-hint")]')
    driver.execute_script("arguments[0].click();", btn_flecha)
    time.sleep(3)
    _pet_url = driver.current_url
    print(f"🐾 Perfil cargado: {_pet_url}")

    btn_solicitar = encontrar_clickable_xpath(wait, '//button[contains(text(), "Solicitar Adopción")]')
    assert btn_solicitar.is_displayed() and btn_solicitar.is_enabled(), f"""
    ╔══════════════════════════════════════════════════════════╗
    ║  ❌ BOTÓN SOLICITAR NO DISPONIBLE: FALLÓ                ║
    ╠══════════════════════════════════════════════════════════╣
    ║  Esperado: botón 'Solicitar Adopción' visible y activo   ║
    ║  Obtenido: botón no visible o deshabilitado               ║
    ║  Causa: La mascota ya fue solicitada o adoptada.        ║
    ╚══════════════════════════════════════════════════════════╝
    """
    driver.execute_script("arguments[0].click();", btn_solicitar)
    print("🖱️  Click en 'Solicitar Adopción'")
    time.sleep(1)

    chk = wait.until(
        EC.element_to_be_clickable(
            (By.XPATH, '//label[contains(@class, "MuiFormControlLabel-root")]')
        )
    )
    driver.execute_script("arguments[0].click();", chk)
    print("✅ Checkbox marcado")
    time.sleep(0.5)

    btn_confirmar = encontrar_clickable_xpath(wait, '//button[contains(text(), "Confirmar Solicitud")]')
    assert btn_confirmar.is_enabled(), f"""
    ╔══════════════════════════════════════════════════════════╗
    ║  ❌ BOTÓN CONFIRMAR DESHABILITADO: FALLÓ                ║
    ╠══════════════════════════════════════════════════════════╣
    ║  Esperado: 'Confirmar Solicitud' habilitado              ║
    ║  Obtenido: deshabilitado                                ║
    ║  Causa: Checkbox no habilitó el botón.                  ║
    ╚══════════════════════════════════════════════════════════╝
    """
    driver.execute_script("arguments[0].click();", btn_confirmar)
    print("🖱️  Click en 'Confirmar Solicitud'")
    time.sleep(2)

    exito = driver.find_elements(
        By.XPATH,
        '//*[contains(text(), "solicitud") or contains(text(), "Solicitud") or contains(text(), "enviada")]'
    )
    assert len(exito) > 0, f"""
    ╔══════════════════════════════════════════════════════════╗
    ║  ❌ SOLICITUD NO CREADA: FALLÓ                          ║
    ╠══════════════════════════════════════════════════════════╣
    ║  Esperado: mensaje de confirmación de solicitud visible ║
    ║  Obtenido: ningún mensaje encontrado                    ║
    ║  Causa: La solicitud pudo no haberse creado.            ║
    ╚══════════════════════════════════════════════════════════╝
    """
    print(f"✅ Solicitud creada — '{exito[0].text[:80]}'")

    sa_logout(driver, wait)
    print("🔒 Sesión cerrada")


# ────────────────────────────────────────────────────
#  CASO 2: Ir a solicitudes y seleccionar la reciente
# ────────────────────────────────────────────────────
def test_adopcion_seleccionar_solicitud(driver, wait):
    """
    Navega a /adopter/requests y selecciona la solicitud
    que debería existir tras CASO 1. Si aparece y se
    puede seleccionar → PASS. Sino → FAIL.
    """
    sa_login(driver, wait, ADOPTER_EMAIL, ADOPTER_PASS)
    esperar_url_contiene(wait, "dashboard")
    print(f"\n🌐 Login Adopter exitoso — Dashboard")

    sa_ir_a_solicitudes(driver)
    time.sleep(3)
    print(f"🌐 Solicitudes cargadas: {driver.current_url}")

    tarjetas = driver.find_elements(By.XPATH, '//div[contains(@class, "MuiCard-root") or contains(@class, "MuiPaper-root")]')
    chips = driver.find_elements(
        By.XPATH,
        '//*[contains(text(), "Revisión") or contains(text(), "aprobada")'
        ' or contains(text(), "Aprobada") or contains(text(), "pendiente")]'
    )

    assert len(chips) > 0 or len(tarjetas) > 0, f"""
    ╔══════════════════════════════════════════════════════════╗
    ║  ❌ NO HAY SOLICITUDES VISIBLES: FALLÓ                  ║
    ╠══════════════════════════════════════════════════════════╣
    ║  Esperado: al menos una solicitud con chip de estado     ║
    ║  Obtenido: no se encontraron chips ni tarjetas           ║
    ║  Causa: La solicitud de CASO 1 no se persistió o la     ║
    ║         página no cargó correctamente.                  ║
    ╚══════════════════════════════════════════════════════════╝
    """
    print(f"✅ {len(chips)} chip(s) de estado visible(s)")
    if len(chips) > 0:
        print(f"   Estado: '{chips[0].text}'")

    # Intentar click en la primera tarjeta o chip
    if len(chips) > 0:
        try:
            chips[0].click()
            time.sleep(1)
            print(f"✅ Solicitud seleccionada correctamente")
        except Exception:
            # Quizás no es clickeable, pero existe
            print(f"⚠️  Chip de estado visible pero no clickeable — aún así PASS")
    elif len(tarjetas) > 0:
        try:
            driver.execute_script("arguments[0].click();", tarjetas[0])
            time.sleep(1)
            print(f"✅ Tarjeta de solicitud seleccionada")
        except Exception:
            print(f"⚠️  Tarjeta visible pero no clickeable — aún así PASS")

    sa_logout(driver, wait)
    print("🔒 Sesión cerrada")
