import os
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException

# ---------------------------------------------------------
# Configuración
# ---------------------------------------------------------
URL = "http://smartadoptlocal.programacionwebuce.net/#/"
ADOPTER_EMAIL = "Exal45@gmail.com"
ADOPTER_PASSWORD = "Elab45*alt1/"

def run_sync_test():
    print("Iniciando prueba de Sincronización de Favoritos (Múltiples Pestañas)...")
    
    options = webdriver.ChromeOptions()
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    options.add_argument('--window-size=1920,1080')
    driver = webdriver.Chrome(options=options)
    wait = WebDriverWait(driver, 15)

    try:
        # ==========================================
        # 1. Login en Pestaña Principal (Pestaña 1)
        # ==========================================
        print("\n[Pestaña 1] Iniciando sesión como Adoptante...")
        driver.get(URL + "login")
        
        email_input = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='email'], input[name='email']")))
        password_input = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='password'], input[name='password']")))
        email_input.send_keys(ADOPTER_EMAIL)
        password_input.send_keys(ADOPTER_PASSWORD)
        
        login_submit = wait.until(EC.element_to_be_clickable(
            (By.XPATH, "//form//button[@type='submit'] | //button[contains(text(), 'Ingresar') or contains(text(), 'Iniciar')]")
        ))
        login_submit.click()
        
        WebDriverWait(driver, 15).until(EC.url_contains("/adopter"))
        print("[Pestaña 1] Sesión iniciada correctamente.")

        # ==========================================
        # 1.5 Limpiar favoritos previos (para ser determinista)
        # ==========================================
        print("\n[Pestaña 1] Limpiando favoritos previos para asegurar prueba determinista...")
        driver.get(URL + "adopter/favorites")
        time.sleep(3) # Esperar a que cargue la lista
        corazones = driver.find_elements(By.XPATH, "//h6/following-sibling::button")
        if corazones:
            print(f"[Pestaña 1] Se encontraron {len(corazones)} favoritos previos. Eliminándolos...")
            for corazon in corazones:
                driver.execute_script("arguments[0].click();", corazon)
                time.sleep(1)
        else:
            print("[Pestaña 1] No hay favoritos previos.")

        # ==========================================
        # 2. Navegar a Explore (Pestaña 1) y dar "Favorite"
        # ==========================================
        driver.get(URL + "adopter/explore")
        print("\n[Pestaña 1] Navegando al catálogo interactivo (Explore)...")
        
        # Esperar a que cargue la tarjeta
        try:
            pet_name_element = wait.until(EC.presence_of_element_located((By.CLASS_NAME, "tinder-card__name")))
            # Quitar la coma que se agrega en el UI (ej "Dalto,")
            pet_name = pet_name_element.text.strip().replace(",", "")
            print(f"[Pestaña 1] Mascota en pantalla detectada: '{pet_name}'")
        except TimeoutException:
            print("[Pestaña 1] No hay mascotas disponibles para explorar. Asegúrate de tener al menos una mascota registrada.")
            driver.save_screenshot("e2e_tests/screenshots/sync_no_pets.png")
            return

        # Dar clic al botón Favorite
        favorite_btn = wait.until(EC.element_to_be_clickable((By.ID, "tinder-btn-favorite")))
        print(f"[Pestaña 1] Haciendo clic en el botón 'Favorite' para {pet_name}...")
        driver.execute_script("arguments[0].click();", favorite_btn)
        
        time.sleep(2) # Pausa para que la API responda y la tarjeta avance
        driver.save_screenshot("e2e_tests/screenshots/sync_tab1_favorited.png")
        
        # Guardamos el handle de la pestaña 1
        main_tab = driver.current_window_handle
        
        # ==========================================
        # 3. Abrir nueva pestaña y verificar Favoritos (Pestaña 2)
        # ==========================================
        print("\n[Pestaña 2] Abriendo una nueva pestaña simulando un segundo dispositivo/instancia...")
        driver.execute_script("window.open('');")
        
        # Cambiarnos a la nueva pestaña
        tabs = driver.window_handles
        second_tab = tabs[1]
        driver.switch_to.window(second_tab)
        
        print("[Pestaña 2] Navegando directamente a 'Mis Favoritos'...")
        driver.get(URL + "adopter/favorites")
        
        # Verificar que pet_name aparezca en la lista
        try:
            wait.until(EC.presence_of_element_located((By.XPATH, f"//h6[contains(text(), '{pet_name}')]")))
            print(f"[Pestaña 2] -> ÉXITO (Sincronización Positiva): '{pet_name}' aparece correctamente en los Favoritos de la nueva pestaña.")
            driver.save_screenshot("e2e_tests/screenshots/sync_tab2_verified.png")
        except TimeoutException:
            print(f"[Pestaña 2] -> ERROR: '{pet_name}' NO aparece en la lista de favoritos.")
            driver.save_screenshot("e2e_tests/screenshots/sync_tab2_error.png")
            raise

        # ==========================================
        # 4. Quitar de favoritos desde la Pestaña 2
        # ==========================================
        print(f"\n[Pestaña 2] Eliminando a '{pet_name}' de Favoritos haciendo clic en el corazón rojo...")
        remove_fav_btn = wait.until(EC.element_to_be_clickable(
            (By.XPATH, f"//h6[contains(text(), '{pet_name}')]/following-sibling::button")
        ))
        driver.execute_script("arguments[0].click();", remove_fav_btn)
        time.sleep(2) # Esperar a que se procese
        
        # Verificar que desaparezca
        try:
            wait.until_not(EC.presence_of_element_located((By.XPATH, f"//h6[contains(text(), '{pet_name}')]")))
            print(f"[Pestaña 2] Mascota eliminada de la vista local.")
            driver.save_screenshot("e2e_tests/screenshots/sync_tab2_removed.png")
        except TimeoutException:
            print("[Pestaña 2] -> ADVERTENCIA: La mascota no desapareció visualmente al instante.")

        # ==========================================
        # 5. Volver a Pestaña 1 y verificar Sincronización Inversa
        # ==========================================
        print("\n[Pestaña 1] Regresando a la Pestaña Original...")
        driver.switch_to.window(main_tab)
        
        print("[Pestaña 1] Navegando a 'Mis Favoritos' para confirmar la sincronización...")
        driver.get(URL + "adopter/favorites")
        time.sleep(2) # Dar tiempo para que React Query o el DOM reaccione
        
        pet_exists = len(driver.find_elements(By.XPATH, f"//h6[contains(text(), '{pet_name}')]")) > 0
        if not pet_exists:
            print(f"[Pestaña 1] -> ÉXITO (Sincronización Negativa): '{pet_name}' ha desaparecido de esta pestaña también.")
        else:
            print(f"[Pestaña 1] -> ERROR: La mascota sigue apareciendo a pesar de haberla borrado en la otra pestaña.")
            
        driver.save_screenshot("e2e_tests/screenshots/sync_tab1_final.png")
        print("\nPrueba de Sincronización de Favoritos FINALIZADA.")

    except Exception as e:
        print(f"\nError durante la prueba: {e}")
        driver.save_screenshot("e2e_tests/screenshots/sync_error_screenshot.png")
    finally:
        time.sleep(2)
        driver.quit()

if __name__ == "__main__":
    run_sync_test()
