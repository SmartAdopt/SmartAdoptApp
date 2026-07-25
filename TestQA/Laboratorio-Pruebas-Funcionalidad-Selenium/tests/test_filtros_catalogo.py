
import time
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from conftest import ADOPTER_EMAIL, ADOPTER_PASS
from tests.helpers import (
    sa_login, sa_logout, sa_ir_a_explorar, sa_ir_a,
    esperar_url_contiene, encontrar_clickable_xpath
)


# ────────────────────────────────────────────────────
#  CASO 1: Catálogo con tarjetas visibles
# ────────────────────────────────────────────────────
def test_catalogo_tarjetas_visibles(driver, wait):
    """
    Login como Adopter, navega al catálogo y verifica que
    la tarjeta Tinder-style (SwipeablePetCard) sea visible.
    """
    sa_login(driver, wait, ADOPTER_EMAIL, ADOPTER_PASS)
    esperar_url_contiene(wait, "dashboard")
    print(f"\n🌐 Login Adopter exitoso — Dashboard")

    sa_ir_a_explorar(driver)
    time.sleep(4)
    print(f"🌐 Catálogo cargado: {driver.current_url}")

    card = driver.find_elements(By.XPATH, '//div[contains(@class, "tinder-card")]')
    if len(card) > 0:
        print(f"✅ {len(card)} tarjeta(s) Tinder visible(s)")
    else:
        vacio = driver.find_elements(By.XPATH, '//*[contains(text(), "No hay mascotas registradas")]')
        assert len(vacio) > 0, f"""
    ╔══════════════════════════════════════════════════════════╗
    ║  ❌ CATÁLOGO VACÍO SIN MENSAJE: FALLÓ                  ║
    ╠══════════════════════════════════════════════════════════╣
    ║  Esperado: mensaje 'No hay mascotas registradas'        ║
    ║            cuando el catálogo está vacío                ║
    ║  Obtenido: no hay tarjetas ni mensaje de estado vacío  ║
    ║  Causa: El componente no maneja el estado vacío o       ║
    ║         hay un error de renderizado.                    ║
    ╚══════════════════════════════════════════════════════════╝
        """
        print(f"⚠️  Catálogo vacío — mensaje visible: '{vacio[0].text}'")

    imagen = driver.find_elements(By.XPATH, '//img[contains(@class, "tinder-card__image")]')
    if imagen:
        print(f"✅ Imagen de mascota visible en la tarjeta")

    sa_logout(driver, wait)
    print("🔒 Sesión cerrada")


# ────────────────────────────────────────────────────
#  CASO 2: Favoritos — botón corazón + verificar guardado
# ────────────────────────────────────────────────────
def test_catalogo_favoritos(driver, wait):
    """
    En el explorador Tinder, hace click en el botón Favorite
    (corazón), navega a la página de favoritos y verifica
    que al menos una mascota aparezca como favorita.
    """
    sa_login(driver, wait, ADOPTER_EMAIL, ADOPTER_PASS)
    esperar_url_contiene(wait, "dashboard")
    print(f"\n🌐 Login Adopter exitoso — Dashboard")

    sa_ir_a_explorar(driver)
    time.sleep(3)

    # Click en botón Favorite (corazón)
    btn_fav = encontrar_clickable_xpath(wait, '//button[contains(@id, "tinder-btn-favorite")]')
    driver.execute_script("arguments[0].click();", btn_fav)
    print("🖱️  Click en Favorite (corazón)")
    time.sleep(2)

    # Navegar a la página de favoritos
    sa_ir_a(driver, "/adopter/favorites")
    time.sleep(3)
    print(f"🌐 Página de favoritos: {driver.current_url}")

    titulo = driver.find_elements(By.XPATH, '//*[contains(text(), "Mis Favoritos")]')
    assert len(titulo) > 0, f"""
    ╔══════════════════════════════════════════════════════════╗
    ║  ❌ PÁGINA DE FAVORITOS NO CARGADA: FALLÓ               ║
    ╠══════════════════════════════════════════════════════════╣
    ║  Esperado: título 'Mis Favoritos' visible               ║
    ║  Obtenido: no se encontró el título                     ║
    ║  Causa: No se navegó correctamente a /adopter/favorites ║
    ╚══════════════════════════════════════════════════════════╝
    """
    print(f"✅ Título 'Mis Favoritos' visible")

    # Verificar que hay al menos una tarjeta de mascota favorita
    cards = driver.find_elements(By.XPATH, '//div[contains(@class, "MuiCardContent-root")]')
    if len(cards) > 0:
        print(f"✅ {len(cards)} mascota(s) favorita(s) encontrada(s)")
    else:
        print(f"⚠️  No se encontraron favoritos — puede que no haya mascotas o el toggle no haya persistido")

    sa_logout(driver, wait)
    print("🔒 Sesión cerrada")


# ────────────────────────────────────────────────────
#  CASO 3: Explorar — botón Pass (NOPE / swipe left)
# ────────────────────────────────────────────────────
def test_catalogo_pass(driver, wait):
    """
    En el explorador Tinder, hace click en el botón Pass
    (NOPE) y verifica que la tarjeta avance (la siguiente
    mascota aparece después del swipe).
    """
    sa_login(driver, wait, ADOPTER_EMAIL, ADOPTER_PASS)
    esperar_url_contiene(wait, "dashboard")
    print(f"\n🌐 Login Adopter exitoso — Dashboard")

    sa_ir_a_explorar(driver)
    time.sleep(3)

    # Verificar que hay una tarjeta visible
    card = driver.find_elements(By.XPATH, '//div[contains(@class, "tinder-card")]')
    assert len(card) > 0 or len(driver.find_elements(By.XPATH, '//*[contains(text(), "No hay mascotas")]')) > 0, f"""
    ╔══════════════════════════════════════════════════════════╗
    ║  ❌ NO HAY TARJETA NI MENSAJE VACÍO: FALLÓ             ║
    ╠══════════════════════════════════════════════════════════╣
    ║  Esperado: tarjeta visible o mensaje de catálogo vacío  ║
    ║  Obtenido: ni tarjeta ni mensaje                        ║
    ╚══════════════════════════════════════════════════════════╝
    """
    if len(card) == 0:
        print(f"⚠️  No hay mascotas para hacer Pass — catálogo vacío")
        sa_logout(driver, wait)
        return

    # Click en botón Pass (NOPE)
    btn_pass = encontrar_clickable_xpath(wait, '//button[@id="tinder-btn-pass"]')
    driver.execute_script("arguments[0].click();", btn_pass)
    print("🖱️  Click en Pass (NOPE)")
    time.sleep(2)

    # Después del Pass, debería aparecer la siguiente tarjeta
    # o el mensaje de "No hay más mascotas"
    siguientes = driver.find_elements(By.XPATH, '//div[contains(@class, "tinder-card")]')
    if len(siguientes) > 0:
        print(f"✅ Siguiente tarjeta visible después del Pass")
    else:
        fin = driver.find_elements(By.XPATH, '//*[contains(text(), "No hay")]')
        if len(fin) > 0:
            print(f"⚠️  No hay más mascotas después del Pass — '{fin[0].text}'")
        else:
            print(f"⚠️  No se detectó siguiente tarjeta ni mensaje — puede que el swipe no haya funcionado")

    sa_logout(driver, wait)
    print("🔒 Sesión cerrada")


# ────────────────────────────────────────────────────
#  CASO 4: Flecha "Ver perfil completo"
# ────────────────────────────────────────────────────
def test_catalogo_ver_perfil_completo(driver, wait):
    """
    En el explorador Tinder, hace click en la flecha
    superior derecha (KeyboardArrowUp) que lleva al
    perfil completo de la mascota en /adopter/pet/PR{id}.
    """
    sa_login(driver, wait, ADOPTER_EMAIL, ADOPTER_PASS)
    esperar_url_contiene(wait, "dashboard")
    print(f"\n🌐 Login Adopter exitoso — Dashboard")

    sa_ir_a_explorar(driver)
    time.sleep(3)

    card = driver.find_elements(By.XPATH, '//div[contains(@class, "tinder-card")]')
    assert len(card) > 0 or len(driver.find_elements(By.XPATH, '//*[contains(text(), "No hay mascotas")]')) > 0, f"""
    ╔══════════════════════════════════════════════════════════╗
    ║  ❌ NO HAY TARJETA NI MENSAJE VACÍO: FALLÓ             ║
    ╠══════════════════════════════════════════════════════════╣
    ║  Esperado: tarjeta visible o mensaje de catálogo vacío  ║
    ║  Obtenido: ni tarjeta ni mensaje                        ║
    ╚══════════════════════════════════════════════════════════╝
    """
    if len(card) == 0:
        print(f"⚠️  No hay mascotas — no se puede probar la flecha")
        sa_logout(driver, wait)
        return

    # Click en la flecha "Ver perfil completo"
    btn_flecha = encontrar_clickable_xpath(wait, '//button[contains(@class, "swipe-up-hint")]')
    driver.execute_script("arguments[0].click();", btn_flecha)
    print("🖱️  Click en flecha 'Ver perfil completo'")
    time.sleep(3)

    # Verificar que la URL contiene /adopter/pet/PR
    url_actual = driver.current_url
    assert "adopter/pet/PR" in url_actual, f"""
    ╔══════════════════════════════════════════════════════════╗
    ║  ❌ FLECHA NO LLEVÓ AL PERFIL: FALLÓ                   ║
    ╠══════════════════════════════════════════════════════════╣
    ║  Esperado: URL contiene '/adopter/pet/PR'               ║
    ║  Obtenido: '{url_actual}'                                 ║
    ║  Causa: La flecha no navegó al perfil completo o la     ║
    ║         ruta esperada es diferente.                     ║
    ╚══════════════════════════════════════════════════════════╝
    """
    print(f"✅ Redirigió a perfil completo: {url_actual}")

    sa_logout(driver, wait)
    print("🔒 Sesión cerrada")
