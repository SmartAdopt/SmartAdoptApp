import os
import time
import base64
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException

# ---------------------------------------------------------
# Configuración
# ---------------------------------------------------------
URL = "http://smartadoptlocal.programacionwebuce.net/#/"
ADMIN_EMAIL = "admin@smartadopt.com"
ADMIN_PASSWORD = "Admin1234"

# Crear una imagen JPEG mínima válida en disco para subirla en caso de no hallar firu.jpg
DUMMY_IMG_B64 = "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAGBAQABPxA="
DUMMY_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "dummy_pet.jpg"))

def create_dummy_image():
    if not os.path.exists(DUMMY_PATH):
        with open(DUMMY_PATH, "wb") as f:
            f.write(base64.b64decode(DUMMY_IMG_B64))

def run_ai_test():
    print("Iniciando prueba de Generación IA (BLIP + LLM)...")
    create_dummy_image()
    
    options = webdriver.ChromeOptions()
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    options.add_argument('--window-size=1920,1080')
    driver = webdriver.Chrome(options=options)
    wait = WebDriverWait(driver, 15)

    try:
        # 1. Login Admin
        print("Iniciando sesión como Administrador...")
        driver.get(URL + "login")
        
        email_input = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='email'], input[name='email']")))
        password_input = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='password'], input[name='password']")))
        email_input.send_keys(ADMIN_EMAIL)
        password_input.send_keys(ADMIN_PASSWORD)
        
        login_submit = wait.until(EC.element_to_be_clickable(
            (By.XPATH, "//form//button[@type='submit'] | //button[contains(text(), 'Ingresar') or contains(text(), 'Iniciar')]")
        ))
        login_submit.click()
        
        WebDriverWait(driver, 15).until(EC.url_contains("/admin"))
        print("Sesión iniciada correctamente.")

        # 2. Añadir Mascota para disparar la IA en Backend
        driver.get(URL + "admin/pets/new")
        print("Navegando a registrar mascota...")
        
        # Esperar a que cargue el campo nombre
        wait.until(EC.presence_of_element_located((By.NAME, "nombre")))
        
        # Llenar datos básicos (basado en tu código de pytest)
        driver.find_element(By.NAME, "nombre").send_keys("IA-Test-Dog")
        driver.find_element(By.NAME, "raza").send_keys("Mestizo Virtual")
        driver.find_element(By.NAME, "edad").send_keys("1")
        driver.find_element(By.NAME, "peso").send_keys("5")
        driver.find_element(By.NAME, "ubicacion").send_keys("Laboratorio IA")
        
        # Biografía corta (Llama 3 usará esto para escribir una mejor)
        biografia_input = driver.find_element(By.NAME, "biografia")
        biografia_input.send_keys("Perrito de prueba para validar que Llama 3 funciona.")
        
        # Subir imagen
        imagen_input = driver.find_element(By.CSS_SELECTOR, 'input[type="file"][accept="image/*"]')
        firu_path = r"C:\Users\fabia\OneDrive\Imágenes\firu.jpg"
        ruta_imagen = firu_path if os.path.exists(firu_path) else DUMMY_PATH
        imagen_input.send_keys(ruta_imagen)
        print(f"Imagen seleccionada: {ruta_imagen}")
        
        # Guardar
        submit_btn = driver.find_element(By.CSS_SELECTOR, 'button[type="submit"]')
        driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", submit_btn)
        time.sleep(1)
        driver.execute_script("arguments[0].click();", submit_btn)
        
        # Esperar a que la IA procese la imagen (BLIP) y redacte (LLM)
        # Esto toma varios segundos en backend
        print("Enviando formulario (esperando que Backend ejecute Llama 3 y BLIP)...")
        wait_long = WebDriverWait(driver, 45) # Le damos hasta 45s a la IA
        wait_long.until(EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'Perfil Registrado con Éxito') or contains(text(), 'ya generó su biografía')]")))
        print("Mascota guardada y procesada por IA exitosamente.")
        
        # 3. Navegar a lista de mascotas y verificar botón autocompletar IA
        driver.get(URL + "admin/pets")
        time.sleep(3)
        print("Buscando a la mascota en la lista para verificar campos IA...")
        
        # Buscar "IA-Test-Dog" y dar clic
        pet_card = wait.until(EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'IA-Test-Dog')]")))
        driver.execute_script("arguments[0].click();", pet_card)
        
        time.sleep(2)
        driver.save_screenshot("e2e_tests/screenshots/ai_pet_details.png")
        
        # Probar el botón explícito de Regeneración IA
        print("Buscando funcionalidad 'Regenerar Textos con IA'...")
        regenerate_btn = wait.until(EC.element_to_be_clickable(
            (By.XPATH, "//*[contains(text(), 'Regenerar Textos con IA')]")
        ))
        
        # Hacemos clic para probar la regeneración
        print("Dando clic en 'Regenerar Textos con IA' (Testing autocompletado en caliente)...")
        driver.execute_script("arguments[0].click();", regenerate_btn)
        
        # Esperar a que el texto cambie a "Generando..." y vuelva a "Regenerar..."
        print("Esperando la respuesta del LLM...")
        wait_long.until(EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'Generando...')]")))
        wait_long.until(EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'Regenerar Textos con IA')]")))
        
        print("¡El autocompletado y regeneración por Inteligencia Artificial funcionó correctamente!")
        driver.save_screenshot("e2e_tests/screenshots/ai_regenerated.png")
        
    except Exception as e:
        print(f"Error en la prueba: {e}")
        driver.save_screenshot("e2e_tests/screenshots/ai_error_screenshot.png")
    finally:
        time.sleep(2)
        driver.quit()

if __name__ == "__main__":
    run_ai_test()
