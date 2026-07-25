import os
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys

# ---------------------------------------------------------
# Configuración
# ---------------------------------------------------------
URL = "http://smartadoptlocal.programacionwebuce.net/#/register"

def run_validation_test():
    print("Iniciando prueba de Validaciones y Manejo de Errores (Zod)...")
    
    options = webdriver.ChromeOptions()
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    options.add_argument('--window-size=1920,1080')
    driver = webdriver.Chrome(options=options)
    wait = WebDriverWait(driver, 10)

    try:
        # ==========================================
        # 1. Navegar al formulario de Registro
        # ==========================================
        print("\nNavegando a la página de Registro...")
        driver.get(URL)
        wait.until(EC.presence_of_element_located((By.NAME, "first_name")))
        print("Formulario cargado exitosamente.")

        # Obtener referencias a los campos
        first_name = driver.find_element(By.NAME, "first_name")
        email = driver.find_element(By.NAME, "email")
        password = driver.find_element(By.NAME, "password")
        submit_btn = driver.find_element(By.XPATH, "//button[@type='submit']")

        # Deshabilitar validación HTML5 (type="email", required) para forzar que Zod sea el que valide
        driver.execute_script("document.querySelector('form').noValidate = true;")

        # ==========================================
        # 2. Prueba de Datos Incompletos
        # ==========================================
        print("\n[Prueba 1] Enviando formulario vacío...")
        submit_btn.click()
        
        # Verificar que el esquema detenga la petición y muestre "Este campo es requerido"
        wait.until(EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'Este campo es requerido') or contains(text(), 'Debe tener al menos')]")))
        print("[Prueba 1] ÉXITO: El esquema Zod detuvo el envío de datos vacíos.")
        driver.save_screenshot("e2e_tests/screenshots/val_empty_form.png")

        # ==========================================
        # 3. Prueba de Email Inválido
        # ==========================================
        print("\n[Prueba 2] Probando validación de correo electrónico...")
        email.send_keys("usuario-malicioso<script>alert(1)</script>")
        submit_btn.click()
        
        # Verificar mensaje amigable de email
        wait.until(EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'Correo electrónico no válido')]")))
        print("[Prueba 2] ÉXITO: El esquema rechazó el correo malformado.")
        driver.save_screenshot("e2e_tests/screenshots/val_invalid_email.png")

        # ==========================================
        # 4. Prueba de Caracteres Maliciosos (XSS)
        # ==========================================
        print("\n[Prueba 3] Probando inyección de caracteres XSS en el Nombre...")
        first_name.send_keys("<img src=x onerror=alert(1)>")
        submit_btn.click()
        
        # Verificar Regex de Zod que restringe solo a letras
        wait.until(EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'Solo se permiten letras y espacios')]")))
        print("[Prueba 3] ÉXITO: El frontend bloqueó los caracteres especiales maliciosos.")
        driver.save_screenshot("e2e_tests/screenshots/val_xss_blocked.png")

        # ==========================================
        # 5. Prueba de Contraseña Débil
        # ==========================================
        print("\n[Prueba 4] Probando validación de contraseñas débiles...")
        password.send_keys("12345")
        submit_btn.click()
        
        # Verificar Regex de seguridad de contraseña
        wait.until(EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'Mínimo 8 caracteres') or contains(text(), '1 mayúscula')]")))
        print("[Prueba 4] ÉXITO: Las restricciones de contraseña actuaron correctamente.")
        driver.save_screenshot("e2e_tests/screenshots/val_weak_password.png")

        print("\nPrueba de Validaciones FINALIZADA EXITOSAMENTE. La UI protegió exitosamente la aplicación antes de enviar cualquier petición al backend.")

    except Exception as e:
        print(f"\nError durante la prueba de validaciones: {e}")
        driver.save_screenshot("e2e_tests/screenshots/val_error.png")
    finally:
        time.sleep(2)
        driver.quit()

if __name__ == "__main__":
    run_validation_test()
