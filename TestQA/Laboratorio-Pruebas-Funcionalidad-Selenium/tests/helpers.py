"""
Funciones auxiliares para las pruebas funcionales con Selenium.

Centraliza la localización de elementos y acciones comunes,
aplicando el concepto de Page Object Model simplificado.
Soporta tanto Automation Exercise (data-qa) como SmartAdopt (name/label).
"""

import random
import string
import requests
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import Select
from selenium.webdriver.support import expected_conditions as EC
from conftest import BASE_URL, SMARTADOPT_URL


# ═══════════════════════════════════════════════════
#  SELECTORES — Automation Exercise (data-qa)
# ═══════════════════════════════════════════════════

SELECTORES = {
    "login_email":      'input[data-qa="login-email"]',
    "login_password":   'input[data-qa="login-password"]',
    "login_button":     'button[data-qa="login-button"]',
    "signup_name":      'input[data-qa="signup-name"]',
    "signup_email":     'input[data-qa="signup-email"]',
    "signup_button":    'button[data-qa="signup-button"]',
}


# ═══════════════════════════════════════════════════
#  SELECTORES — SmartAdopt (atributos name / texto visible)
# ═══════════════════════════════════════════════════

SA_SELECTORES = {
    "login_email":         'input[name="email"]',
    "login_password":      'input[name="password"]',
    "login_button":        'button[type="submit"]',
    "signup_firstname":    'input[name="first_name"]',
    "signup_lastname":     'input[name="last_name"]',
    "signup_email":        'input[name="email"]',
    "signup_phone":        'input[name="phone_number"]',
    "signup_password":     'input[name="password"]',
    "signup_confirm":      'input[name="confirmPassword"]',
    "signup_button":       'button[type="submit"]',
    "profile_firstname":   'input[name="firstName"]',
    "profile_lastname":    'input[name="lastName"]',
    "profile_email":       'input[name="email"]',
    "profile_phone":       'input[name="phone"]',
    "pet_name":            'input[name="nombre"]',
    "pet_breed":           'input[name="raza"]',
    "pet_age":             'input[name="edad"]',
    "pet_weight":          'input[name="peso"]',
    "pet_location":        'input[name="ubicacion"]',
    "pet_file_input":      'input[type="file"]',
    "pet_biography":       'textarea[name="biografia"]',
}


# ═══════════════════════════════════════════════════
#  FUNCIONES DE NAVEGACIÓN
# ═══════════════════════════════════════════════════

def ir_a_login(driver):
    """Navega a la página de login (usa BASE_URL de Automation Exercise)."""
    driver.get(f"{BASE_URL}#/login")


def ir_a_registro(driver):
    """Navega a la página de registro (usa BASE_URL de Automation Exercise)."""
    driver.get(f"{BASE_URL}#/register")


def cerrar_sesion(driver):
    """Cierra la sesión del usuario limpiando el almacenamiento local."""
    driver.execute_script("localStorage.clear(); sessionStorage.clear();")
    driver.get(f"{BASE_URL}#/login")


# ═══════════════════════════════════════════════════
#  NAVEGACIÓN — SmartAdopt
# ═══════════════════════════════════════════════════

def sa_ir_a(driver, ruta):
    """Navega a una ruta de SmartAdopt."""
    driver.get(f"{SMARTADOPT_URL or BASE_URL}#{ruta}")


def sa_ir_a_login(driver):
    sa_ir_a(driver, "/login")


def sa_ir_a_explorar(driver):
    sa_ir_a(driver, "/adopter/explore")


def sa_ir_a_solicitudes(driver):
    sa_ir_a(driver, "/adopter/requests")


def sa_ir_a_perfil(driver):
    sa_ir_a(driver, "/adopter/profile")


def sa_ir_a_admin_requests(driver):
    sa_ir_a(driver, "/admin/requests")


def sa_ir_a_admin_add_pet(driver):
    sa_ir_a(driver, "/admin/pets/new")


def sa_ir_a_admin_pets(driver):
    sa_ir_a(driver, "/admin/pets")


# ═══════════════════════════════════════════════════
#  FUNCIONES DE LOCALIZACIÓN DE ELEMENTOS
# ═══════════════════════════════════════════════════

def encontrar(wait, nombre_selector):
    """Localiza un elemento usando EC.presence_of_element_located (Automation Exercise)."""
    return wait.until(
        EC.presence_of_element_located(
            (By.CSS_SELECTOR, SELECTORES[nombre_selector])
        )
    )


def encontrar_clickable(wait, nombre_selector):
    """Localiza un elemento clickable (Automation Exercise)."""
    return wait.until(
        EC.element_to_be_clickable(
            (By.CSS_SELECTOR, SELECTORES[nombre_selector])
        )
    )


def encontrar_visible(wait, nombre_selector):
    """Localiza un elemento visible (Automation Exercise)."""
    return wait.until(
        EC.visibility_of_element_located(
            (By.CSS_SELECTOR, SELECTORES[nombre_selector])
        )
    )


def sa_encontrar(wait, nombre_selector):
    """Localiza un elemento SmartAdopt por CSS selector."""
    return wait.until(
        EC.presence_of_element_located(
            (By.CSS_SELECTOR, SA_SELECTORES[nombre_selector])
        )
    )


def sa_encontrar_clickable(wait, nombre_selector):
    """Localiza un elemento clickable SmartAdopt."""
    return wait.until(
        EC.element_to_be_clickable(
            (By.CSS_SELECTOR, SA_SELECTORES[nombre_selector])
        )
    )


def encontrar_xpath(wait, xpath):
    """Localiza un elemento por XPath cuando es visible."""
    return wait.until(
        EC.visibility_of_element_located((By.XPATH, xpath))
    )


def encontrar_clickable_xpath(wait, xpath):
    """Localiza un elemento clickable por XPath."""
    return wait.until(
        EC.element_to_be_clickable((By.XPATH, xpath))
    )


# ═══════════════════════════════════════════════════
#  FUNCIONES DE LLENADO DE FORMULARIOS
# ═══════════════════════════════════════════════════

def llenar_campo(wait, nombre_selector, texto):
    """Limpia un campo y escribe el texto indicado (Automation Exercise)."""
    campo = encontrar(wait, nombre_selector)
    campo.send_keys(Keys.CONTROL + "a")
    campo.send_keys(Keys.DELETE)
    campo.clear()
    campo.send_keys(texto)
    return campo


def sa_llenar_campo(wait, nombre_selector, texto):
    """Limpia un campo y escribe (SmartAdopt)."""
    campo = sa_encontrar(wait, nombre_selector)
    campo.send_keys(Keys.CONTROL + "a")
    campo.send_keys(Keys.DELETE)
    campo.clear()
    campo.send_keys(texto)
    return campo


def llenar_formulario_login(wait, email, password):
    """
    Llena el formulario de login (Automation Exercise).
    Retorna el botón de login listo para hacer click.
    """
    llenar_campo(wait, "login_email", email)
    llenar_campo(wait, "login_password", password)
    return encontrar_clickable(wait, "login_button")


def sa_llenar_formulario_login(wait, email, password):
    """Llena el formulario de login de SmartAdopt y retorna el botón."""
    sa_llenar_campo(wait, "login_email", email)
    sa_llenar_campo(wait, "login_password", password)
    return sa_encontrar_clickable(wait, "login_button")


def llenar_formulario_registro_completo(wait, nombre, apellido, email, telefono, password):
    """
    Llena el formulario completo de registro en #/register (Automation Exercise).
    """
    llenar_campo(wait, "signup_name", nombre)
    llenar_campo(wait, "signup_email", email)
    return encontrar_clickable(wait, "signup_button")


def sa_llenar_formulario_registro(wait, nombre, apellido, email, telefono, password):
    """Llena el formulario de registro de SmartAdopt y retorna el botón."""
    sa_llenar_campo(wait, "signup_firstname", nombre)
    sa_llenar_campo(wait, "signup_lastname", apellido)
    sa_llenar_campo(wait, "signup_email", email)
    sa_llenar_campo(wait, "signup_phone", telefono)
    sa_llenar_campo(wait, "signup_password", password)
    sa_llenar_campo(wait, "signup_confirm", password)
    return sa_encontrar_clickable(wait, "signup_button")


def sa_login(driver, wait, email, password):
    """Login completo en SmartAdopt: navega, llena y hace click."""
    sa_ir_a_login(driver)
    boton = sa_llenar_formulario_login(wait, email, password)
    boton.click()


def sa_logout(driver, wait):
    """Cierra sesión en SmartAdopt desde el sidebar."""
    xpath = '//button[contains(text(), "Cerrar Sesión")]'
    try:
        btn = encontrar_clickable_xpath(wait, xpath)
        btn.click()
        wait.until(EC.url_contains("login"))
    except Exception:
        driver.execute_script("localStorage.clear(); sessionStorage.clear();")
        sa_ir_a_login(driver)


# ═══════════════════════════════════════════════════
#  FUNCIONES UTILITARIAS
# ═══════════════════════════════════════════════════

def generar_email_unico():
    """Genera un email aleatorio para evitar duplicados al registrar."""
    sufijo = 8
    return f"testuser_{sufijo}@testmail.com"


def eliminar_cuenta_prueba(driver, wait):
    """No aplica para SmartAdopt (placeholder de compatibilidad)."""
    pass


def obtener_token(driver):
    """Obtiene el access_token de localStorage."""
    return driver.execute_script("return localStorage.getItem('access_token');")


def _api_base():
    return (SMARTADOPT_URL or BASE_URL).replace('/#', '').rstrip('/')


def llamada_api_get(access_token, ruta_relativa):
    """Ejecuta GET a la API de SmartAdopt."""
    url = f"{_api_base()}{ruta_relativa}"
    headers = {"Authorization": f"Bearer {access_token}"}
    return requests.get(url, headers=headers)


def esperar_url_contiene(wait, texto):
    """Espera a que la URL contenga el texto indicado."""
    wait.until(EC.url_contains(texto))
