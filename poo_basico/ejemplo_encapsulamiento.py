"""
Ejemplo de encapsulamiento en Python
Demuestra los tres niveles: público, protegido y privado
"""

# ==========================================
# NIVEL 1: Atributos Públicos
# ==========================================
class PersonaPublica:
    def __init__(self, nombre):
        self.nombre = nombre  # Atributo público

    def presentarse(self):
        return f"Hola, soy {self.nombre}"


# ==========================================
# NIVEL 2: Atributos Protegidos (un guion bajo)
# ==========================================
class CuentaProtegida:
    def __init__(self, titular, saldo):
        self.titular = titular
        self.saldo = saldo
        self._movimientos = []  # Atributo protegido (convención)

    def depositar(self, cantidad):
        self.saldo += cantidad
        self._movimientos.append(f"Depósito: +{cantidad}")

    def ver_movimientos(self):
        return self._movimientos


# ==========================================
# NIVEL 3: Atributos Privados (doble guion bajo)
# ==========================================
class CuentaPrivada:
    def __init__(self, titular, saldo):
        self.titular = titular
        self.__saldo = saldo  # Atributo privado (name mangling)

    @property
    def saldo(self):
        """Getter: obtiene el saldo"""
        return self.__saldo

    def depositar(self, cantidad):
        if cantidad <= 0:
            raise ValueError("El depósito debe ser positivo")
        self.__saldo += cantidad

    def retirar(self, cantidad):
        if cantidad <= 0:
            raise ValueError("El retiro debe ser positivo")
        if cantidad > self.__saldo:
            raise ValueError("Saldo insuficiente")
        self.__saldo -= cantidad


# ==========================================
# EJEMPLO COMPLETO con @property
# ==========================================
class Rectangulo:
    def __init__(self, ancho, alto):
        self._ancho = ancho
        self._alto = alto

    @property
    def ancho(self):
        """Getter: obtiene el ancho"""
        return self._ancho

    @ancho.setter
    def ancho(self, valor):
        """Setter: valida antes de asignar"""
        if valor <= 0:
            raise ValueError("El ancho debe ser positivo")
        self._ancho = valor

    @property
    def alto(self):
        """Getter: obtiene el alto"""
        return self._alto

    @alto.setter
    def alto(self, valor):
        """Setter: valida antes de asignar"""
        if valor <= 0:
            raise ValueError("El alto debe ser positivo")
        self._alto = valor

    @property
    def area(self):
        """Propiedad calculada (solo lectura)"""
        return self._ancho * self._alto


# ==========================================
# DEMOSTRACIÓN
# ==========================================
if __name__ == "__main__":
    print("=" * 60)
    print("NIVEL 1: Atributos Públicos")
    print("=" * 60)

    p = PersonaPublica("Ana")
    print(p.presentarse())
    print(f"Nombre (desde fuera): {p.nombre}")
    p.nombre = "María"
    print(f"Nombre modificado: {p.nombre}")
    print()

    print("=" * 60)
    print("NIVEL 2: Atributos Protegidos (_)")
    print("=" * 60)

    c_protegida = CuentaProtegida("Luis", 100)
    c_protegida.depositar(50)
    print(f"Saldo: {c_protegida.saldo}")
    print(f"Movimientos: {c_protegida.ver_movimientos()}")

    # ⚠️ Técnicamente se puede acceder, pero NO deberías
    print(f"Acceso directo a _movimientos: {c_protegida._movimientos}")
    print("(El guion bajo es una convención, no una restricción estricta)")
    print()

    print("=" * 60)
    print("NIVEL 3: Atributos Privados (__)")
    print("=" * 60)

    c_privada = CuentaPrivada("Carlos", 100)
    print(f"Saldo (vía getter): {c_privada.saldo}")

    c_privada.depositar(50)
    print(f"Saldo después de depósito: {c_privada.saldo}")

    try:
        c_privada.__saldo = 0  # ❌ Esto NO modifica el saldo real
        print(f"Intento de modificar __saldo directamente")
        print(f"Saldo real (sigue siendo): {c_privada.saldo}")
    except Exception as e:
        print(f"Error: {e}")

    print()
    print("=" * 60)
    print("EJEMPLO COMPLETO: Rectángulo con @property")
    print("=" * 60)

    r = Rectangulo(10, 5)
    print(f"Ancho: {r.ancho}, Alto: {r.alto}")
    print(f"Área: {r.area}")

    r.ancho = 20
    print(f"Nuevo ancho: {r.ancho}")
    print(f"Nueva área: {r.area}")

    try:
        r.ancho = -5  # ❌ ValueError
    except ValueError as e:
        print(f"Error al asignar ancho negativo: {e}")

    print()
    print("=" * 60)
    print("RESUMEN")
    print("=" * 60)
    print("1. Público (sin guion): se puede leer y modificar libremente")
    print("2. Protegido (_): convención de 'no tocar desde fuera'")
    print("3. Privado (__): name mangling, difícil acceder desde fuera")
    print("4. @property: getters/setters elegantes en Python")
