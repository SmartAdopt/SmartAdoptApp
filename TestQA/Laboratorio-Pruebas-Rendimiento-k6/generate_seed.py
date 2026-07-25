import os

file_path = "c:/Users/javie/Downloads/SmartAdoptApp/TestQA/Laboratorio-Pruebas-Rendimiento-k6/seed-users.sql"

with open(file_path, "w", encoding="utf-8") as f:
    f.write("-- seed-users.sql\n")
    f.write("-- Script para insertar 120 usuarios de prueba para k6 en PostgreSQL.\n")
    f.write("-- Contraseña para todos: password123\n\n")
    
    # First, insert into "user"
    f.write('INSERT INTO "user" (user_id, first_name, last_name, email, password_hash, type)\n')
    f.write("VALUES \n")
    
    user_values = []
    for i in range(1, 121):
        uid = 1000 + i # Explicit IDs to easily reference them for adopter table
        email = f"test_k6_{i}@example.com"
        hash_pw = "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW"
        user_values.append(f"  ({uid}, 'Test', 'User {i}', '{email}', '{hash_pw}', 'adopter')")
    
    f.write(",\n".join(user_values))
    f.write("\nON CONFLICT (email) DO NOTHING;\n\n")
    
    # Then insert into "adopter"
    f.write('INSERT INTO adopter (user_id)\n')
    f.write("VALUES \n")
    adopter_values = []
    for i in range(1, 121):
        uid = 1000 + i
        adopter_values.append(f"  ({uid})")
        
    f.write(",\n".join(adopter_values))
    f.write("\nON CONFLICT (user_id) DO NOTHING;\n")

print("File generated successfully.")
