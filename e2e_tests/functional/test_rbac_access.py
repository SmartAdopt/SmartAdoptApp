import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# ---------------------------------------------------------
# Configuración
# ---------------------------------------------------------
URL = "http://smartadoptlocal.programacionwebuce.net/#/"
ADOPTER_EMAIL = "Exal45@gmail.com"
ADOPTER_PASSWORD = "Elab45*alt1/"

def run_rbac_test():
    print("Iniciando prueba de Control de Acceso (RBAC)...")
    options = webdriver.ChromeOptions()
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    options.add_argument('--window-size=1920,1080')
    driver = webdriver.Chrome(options=options)
    wait = WebDriverWait(driver, 10)

    try:
        # 1. Iniciar sesión como Adoptante
        print(f"Navegando al login...")
        driver.get(URL + "login")
        
        print("Ingresando credenciales del Adopter (Usuario Normal)...")
        email_input = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='email'], input[name='email']")))
        password_input = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='password'], input[name='password']")))
        
        email_input.send_keys(ADOPTER_EMAIL)
        password_input.send_keys(ADOPTER_PASSWORD)
        
        login_submit = wait.until(EC.element_to_be_clickable(
            (By.XPATH, "//form//button[@type='submit'] | //button[contains(text(), 'Ingresar') or contains(text(), 'Iniciar')]")
        ))
        login_submit.click()
        
        print("Esperando inicio de sesión y redirección al dashboard...")
        WebDriverWait(driver, 15).until(EC.url_contains("/adopter/dashboard"))
        print("¡Sesión iniciada exitosamente!")

        # 2. Intentar forzar la navegación a la vista de creación de mascotas del Admin
        admin_restricted_url = URL + "admin/pets/new"
        print(f"\n[INTENTO DE INTRUSIÓN] Forzando navegación a la vista protegida: {admin_restricted_url}")
        driver.get(admin_restricted_url)
        
        # Esperamos un poco para que el sistema reaccione (redireccione o renderice el error)
        time.sleep(3)
        current_url = driver.current_url
        print(f"URL resultante después del intento: {current_url}")
        
        # Guardar evidencia visual
        driver.save_screenshot("e2e_tests/screenshots/rbac_blocked_screenshot.png")
        print("Se ha guardado una captura de evidencia en 'e2e_tests/screenshots/rbac_blocked_screenshot.png'.")

        # 3. Analizar los resultados (Assertion)
        if "admin/pets/new" not in current_url:
            print("-> ÉXITO (Redirección): El sistema protegió la ruta y redirigió al usuario fuera de la zona prohibida.")
        else:
            print("-> AVISO: El sistema NO redirigió la URL. Evaluando si la vista se ocultó de todas formas...")
            # Si se queda en la ruta, comprobamos que NO haya un formulario para crear mascota
            # Normalmente los formularios de creación tienen botones tipo "Guardar", "Crear" o inputs.
            forms = driver.find_elements(By.TAG_NAME, "form")
            if not forms:
                print("-> ÉXITO (Bloqueo Visual): Aunque la URL no cambió, el componente de creación no se renderizó.")
            else:
                print("-> ¡FALLO DE SEGURIDAD!: El usuario pudo acceder al formulario protegido.")

        print("\nPrueba RBAC finalizada.")

    except Exception as e:
        print(f"Error durante la ejecución de la prueba: {e}")
        driver.save_screenshot("e2e_tests/screenshots/rbac_error_screenshot.png")
        print("Se ha guardado un 'rbac_error_screenshot.png' con el estado actual de la pantalla.")
    finally:
        time.sleep(2)
        driver.quit()

if __name__ == "__main__":
    run_rbac_test()
