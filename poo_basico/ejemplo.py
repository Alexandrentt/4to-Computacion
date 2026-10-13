# =========================================================================
#  EJEMPLO SENCILLO DE PROGRAMACION ORIENTADA A OBJETOS (POO) EN PYTHON
#  Un programa sobre "Cuentas Bancarias" para ilustrar los conceptos base.
# =========================================================================

# -------------------------------------------------------------------------
# 1. DEFINIR UNA CLASE
#    La clase es como un "molde" o "plantilla". Define atributos (datos) y
#    metodos (acciones) que tendran los objetos creados a partir de ella.
#    Las clases se escriben con la palabra clave "class".
# -------------------------------------------------------------------------
class CuentaBancaria:
    # CONSTRUCTOR (__init__): se ejecuta automaticamente al crear un objeto.
    # Sirve para inicializar los atributos con valores de arranque.
    # "self" es una referencia al propio objeto.
    def __init__(self, titular, saldo_inicial=0):
        self.titular = titular          # atributo publico
        self.saldo = saldo_inicial      # atributo publico
        self._movimientos = []          # atributo "privado" (convencion)

    # METODO: una funcion que pertenece a la clase y actua sobre el objeto.
    def depositar(self, cantidad):
        if cantidad > 0:
            self.saldo += cantidad
            self._movimientos.append(f"Deposito: +{cantidad}")
            print(f"{self.titular} deposito {cantidad}. Saldo: {self.saldo}")
        else:
            print("La cantidad debe ser positiva.")

    # METODO: retirar dinero (usa self para leer/modificar el objeto).
    def retirar(self, cantidad):
        if cantidad <= 0:
            print("La cantidad debe ser positiva.")
        elif cantidad > self.saldo:
            print(f"Saldo insuficiente. Saldo actual: {self.saldo}")
        else:
            self.saldo -= cantidad
            self._movimientos.append(f"Retiro: -{cantidad}")
            print(f"{self.titular} retiro {cantidad}. Saldo: {self.saldo}")

    # METODO "getter": devuelve un dato sin exponer internals.
    def ver_saldo(self):
        return self.saldo

    # METODO magico __str__: define el texto al imprimir el objeto.
    def __str__(self):
        return f"Cuenta de {self.titular} - Saldo: {self.saldo}"


# -------------------------------------------------------------------------
# 2. HERENCIA
#    Una clase hija reutiliza y extiende la clase padre.
#    "CuentaAhorro" hereda todo de "CuentaBancaria" y anade algo nuevo.
# -------------------------------------------------------------------------
class CuentaAhorro(CuentaBancaria):
    def __init__(self, titular, saldo_inicial=0, interes_anual=5):
        # super() llama al constructor de la clase padre.
        super().__init__(titular, saldo_inicial)
        self.interes_anual = interes_anual

    # METODO EXTRA propio de la clase hija.
    def aplicar_interes(self):
        interes = self.saldo * (self.interes_anual / 100)
        self.depositar(interes)
        print(f"  -> Interes aplicado: {interes:.2f}")


# -------------------------------------------------------------------------
# 3. CREAR OBJETOS (INSTANCIAS) Y USARLOS
#    Un objeto es una copia concreta de la clase, con sus propios datos.
# -------------------------------------------------------------------------
if __name__ == "__main__":
    print("=== Cuenta sencilla ===")
    # Crear un objeto (instancia). Se llama al constructor.
    cuenta1 = CuentaBancaria("Ana", 100)
    print(cuenta1)                    # usa __str__
    cuenta1.depositar(50)
    cuenta1.retirar(30)
    print(f"Saldo a retirar: 999")           # fallara: saldo insuficiente
    cuenta1.retirar(999)   
    print(f"Saldo final de Ana: {cuenta1.ver_saldo()}")

    print("\n=== Cuenta de ahorro (hereda de CuentaBancaria) ===")
    # Crear un segundo objeto, de la clase hija.
    ahorro = CuentaAhorro("Luis", 1000, interes_anual=10)
    print(ahorro)
    ahorro.depositar(200)
    ahorro.aplicar_interes()
    print(f"Saldo final de Luis: {ahorro.ver_saldo()}")

    # Cada objeto guarda sus propios datos (no se comparten).
    print("\n=== Comprobacion de independencia entre objetos ===")
    print(f"Saldo de Ana : {cuenta1.ver_saldo()}")
    print(f"Saldo de Luis: {ahorro.ver_saldo()}")
