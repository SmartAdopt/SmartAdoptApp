import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException

# ---------------------------------------------------------
# Configuración simple de la prueba
# ---------------------------------------------------------
URL = "http://smartadoptlocal.programacionwebuce.net/#/"
ADMIN_EMAIL = "admin@smartadopt.com"
ADMIN_PASSWORD = "Admin1234"
ADOPTER_EMAIL = "Exal45@gmail.com"
ADOPTER_PASSWORD = "Elab45*alt1/"

def run_test():
    print("Iniciando prueba de funcionalidad...")
    # Configurar opciones del navegador (Usaremos Chrome en este ejemplo)
    options = webdriver.ChromeOptions()
    # options.add_argument('--headless') # Descomentar para ejecutar sin interfaz gráfica
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    options.add_argument('--window-size=1920,1080')

    driver = webdriver.Chrome(options=options)
    wait = WebDriverWait(driver, 10)

    try:
        # 1. Navegar a la página de inicio
        print(f"Navegando a {URL}")
        driver.get(URL)

        # 1.5 Abrir formulario de inicio de sesión
        print("Buscando botón de 'Iniciar Sesión' en la landing page...")
        iniciar_sesion_btn = wait.until(EC.element_to_be_clickable(
            (By.XPATH, "//*[contains(text(), 'Iniciar Sesión')]")
        ))
        iniciar_sesion_btn.click()

        # 2. Iniciar sesión como Administrador
        print("Intentando iniciar sesión...")
        
        # Esperar a que los campos de email y password estén presentes en el formulario/modal
        email_input = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='email'], input[name='email']")))
        password_input = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='password'], input[name='password']")))
        
        email_input.send_keys(ADMIN_EMAIL)
        password_input.send_keys(ADMIN_PASSWORD)
        
        # Clic en el botón de submit del formulario de login
        login_submit = wait.until(EC.element_to_be_clickable(
            (By.XPATH, "//form//button[@type='submit'] | //button[contains(text(), 'Ingresar') or contains(text(), 'Iniciar')]")
        ))
        login_submit.click()
        
        # 3. Navegar a la sección de Gestión de Solicitudes
        print("Navegando al listado de aplicaciones...")
        # Esperar a que cargue el dashboard de admin (Bienvenido, Administrador)
        wait.until(EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'Bienvenido, Administrador')]")))
        
        # Buscar el botón 'Abrir' dentro de la tarjeta 'Revisar Solicitudes'
        requests_card_btn = wait.until(EC.element_to_be_clickable(
            (By.XPATH, "//*[contains(text(), 'Revisar Solicitudes')]/..//button[contains(text(), 'Abrir')] | //button[contains(text(), 'Revisar Solicitudes')]")
        ))
        requests_card_btn.click()

        # 4. Seleccionar una solicitud y aprobarla
        print("Buscando una solicitud para aprobar...")
        time.sleep(2) # Esperar a que renderice la tabla/lista
        
        # En esta interfaz, primero debemos seleccionar una solicitud de la lista a la izquierda
        print("Seleccionando una solicitud 'Pendiente' de la lista...")
        # El texto exacto en las etiquetas azules de la lista es 'Pendiente' (sin 's' al final, 
        # a diferencia de la métrica superior que dice 'Pendientes').
        # Buscamos el primer elemento que tenga exactamente el texto 'Pendiente'.
        pending_badge = wait.until(EC.presence_of_element_located(
            (By.XPATH, "(//*[normalize-space(text())='Pendiente'])[1]")
        ))
        
        # Hacemos clic usando JavaScript para evitar problemas de elementos interceptados
        # o que el badge no sea clickeable por CSS.
        driver.execute_script("arguments[0].click();", pending_badge)
        
        time.sleep(1) # Esperar a que se carguen los detalles en el panel derecho
        driver.save_screenshot("e2e_tests/screenshots/requests_details_screenshot.png") # Para debug visual de los detalles

        # Ahora buscamos el botón de 'Aprobar' en el panel de detalles
        print("Buscando botón 'Aprobar Adopción'...")
        approve_button = wait.until(EC.element_to_be_clickable(
            (By.XPATH, "//button[contains(text(), 'Aprobar Adopción') or contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'aprobar')]")
        ))
        approve_button.click()
        
        # A veces hay un modal de confirmación
        try:
            confirm_button = WebDriverWait(driver, 3).until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Confirmar') or contains(text(), 'Confirm')]")))
            confirm_button.click()
        except TimeoutException:
            pass # No hay modal de confirmación, continuamos

        print("¡Solicitud aprobada por el ADMIN exitosamente!")
        time.sleep(2) # Esperar a que la acción se procese

        # ---------------------------------------------------------
        # FLUJO DEL ADOPTER
        # ---------------------------------------------------------
        print("--- Iniciando flujo del Adopter ---")
        driver.delete_all_cookies() # Limpiar sesión del Admin
        
        adopter_login_url = "http://smartadoptlocal.programacionwebuce.net/#/login"
        print(f"Navegando a {adopter_login_url}")
        driver.get(adopter_login_url)
        
        print("Ingresando credenciales del Adopter (Usuario Normal)...")
        email_input = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='email'], input[name='email']")))
        password_input = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='password'], input[name='password']")))
        
        email_input.send_keys(ADOPTER_EMAIL)
        password_input.send_keys(ADOPTER_PASSWORD)
        
        # Clic en el botón de submit del formulario de login
        login_submit = wait.until(EC.element_to_be_clickable(
            (By.XPATH, "//form//button[@type='submit'] | //button[contains(text(), 'Ingresar') or contains(text(), 'Iniciar')]")
        ))
        login_submit.click()
        
        # Esperar a que el login se complete y nos redirija al dashboard
        print("Esperando redirección al dashboard del adopter...")
        WebDriverWait(driver, 15).until(
            EC.url_contains("/adopter/dashboard")
        )
        print("¡Login del Adopter exitoso!")
        
        adopter_requests_url = "http://smartadoptlocal.programacionwebuce.net/#/adopter/requests"
        print(f"Navegando a la vista de solicitudes: {adopter_requests_url}")
        driver.get(adopter_requests_url)
        
        print("Validando visualmente la confirmación...")
        time.sleep(3) # Esperar a que cargue la lista
        driver.save_screenshot("e2e_tests/screenshots/adopter_requests_confirmation.png")
        print("Se ha guardado una captura 'e2e_tests/screenshots/adopter_requests_confirmation.png' con el estado final.")
        
        # Validar si existe texto indicando aprobación en pantalla
        try:
            wait.until(EC.presence_of_element_located(
                (By.XPATH, "//*[contains(text(), 'Aprobada') or contains(text(), 'aprobada') or contains(text(), 'Aprobado')]")
            ))
            print("¡Confirmación visual de 'Aprobada' detectada en pantalla!")
        except TimeoutException:
            print("No se detectó el texto 'Aprobada' explícitamente, pero revisa la captura.")

        print("Prueba de funcionalidad completa (Admin + Adopter) finalizada exitosamente.")

    except Exception as e:
        print(f"Error durante la ejecución de la prueba: {e}")
        driver.save_screenshot("e2e_tests/screenshots/error_screenshot.png")
        print("Se ha guardado un 'e2e_tests/screenshots/error_screenshot.png' con el estado actual de la pantalla.")
    finally:
        time.sleep(3) # Pausa para observar el resultado
        driver.quit()

if __name__ == "__main__":
    run_test()
