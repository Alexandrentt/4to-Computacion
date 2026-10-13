class CuentaProtegida:
    def __init__(self, titular, saldo):
        self.titular = titular
        self.saldo = saldo
        self._movimientos = []
    #Atributos protegidos por convencion
        
    def depositar(self, cantidad):
        self.saldo += cantidad
        self._movimientos.append(f"Depósito: +{cantidad}")
        
    def ver_movimientos(self):
        return self._movimientos

class CuentaPrivada:
    def __init__(self, titular, saldo):
        self.titular = titular
        self.__saldo = saldo
        #Atributo privado
    
    @property
    def saldo(self):
        #Obtener el saldo. 
        return self.__saldo
    
    def depositar(self, cantidad):
        if cantidad <= 0:
            raise ValueError("La cantidad debe ser mayor a 0")
        self.__saldo += cantidad
    
    def retirar(self, cantidad):
        if cantidad <= 0:
            raise ValueError("La cantidad debe ser mayor a 0")
        elif cantidad > self.__saldo:
            raise ValueError("Saldo insuficiente")
        self.__saldo -= cantidad
print("________________________________________")
class rectangulo:
    def __init__(self, base, altura):
        self._base = base
        self.__altura = altura
    
    def calcular_area(self):
        return self.__base * self.__altura
    
    def calcular_perimetro(self):
        return 2 * (self._base + self.__altura)
    @property
    def base(self):
        #Esta funcion es para obtener la base
        return self.__base
    @base.setter
    def base(self, base):
        #Esta funcion es para establecer la base
        if base <= 0:
            raise ValueError("La base debe ser mayor a 0")
        self.__base = base
    @property
    def altura(self):
        #Esta funcion es para obtener la altura
        return self.__altura
    @altura.setter
    def altura(self, altura):
        #Esta funcion es para establecer la altura
        if altura <= 0:
            raise ValueError("La altura debe ser mayor a 0")
        self.__altura = altura
    @altura.setter
    def altura(self, altura):
        #Esta funcion es para establecer la altura
        if altura <= 0:
            raise ValueError("La altura debe ser mayor a 0")
        self.__altura = altura
    @property
    def area(self):
        #Esta funcion es para obtener el area
        return self._base * self.__altura

print("________________________________________")
print("Rectangulo, largo=5, ancho=3")
print("Area:", rectangulo(5, 3).area)

# Ejercicio: Sistema de Gestión de Empleados

## Enunciado

Crea una clase `Empleado` que represente a un empleado de una empresa con las siguientes características:

### Requisitos:

1. **Atributos:**
   - `nombre` (público): nombre del empleado
   - `__salario_base` (privado): salario mensual base del empleado
   - `_horas_extra` (protegido): cantidad de horas extra trabajadas en el mes
   - `__tarifa_hora_extra` (privado): tarifa por hora extra (por defecto 50% del salario base / 160)

2. **Métodos públicos:**
   - `asignar_salario_base(salario)`: asigna el salario base con validación (no puede ser negativo ni menor al salario mínimo)
   - `registrar_horas_extra(cantidad)`: registra horas extra trabajadas (no puede ser negativo)
   - `calcular_salario_mensual()`: calcula el salario total del mes (base + horas extra)
   - `dar_aumento(porcentaje)`: aumenta el salario base por un porcentaje dado (no puede ser negativo)

3. **Properties:**
   - `salario_base` (getter): permite leer el salario base sin modificarlo directamente
   - `horas_extra` (getter): permite ver las horas extra registradas
   - `salario_anual` (property calculada): retorna el salario anual estimado (salario mensual * 12)

4. **Validaciones:**
   - El salario base no puede ser menor a 0 ni menor al salario mínimo (ej: 300000)
   - Las horas extra no pueden ser negativas
   - El porcentaje de aumento no puede ser negativo

### Salida esperada al ejecutar:

```
=== Empleado 1: Juan Pérez ===
Nombre: Juan Pérez
Salario base: $500,000
Horas extra: 10
Salario mensual: $531,250
Salario anual: $6,375,000

=== Empleado 2: María García ===
Nombre: María García
Salario base: $400,000
Horas extra: 0
Salario mensual: $400,000
Salario anual: $4,800,000

=== Pruebas de validación ===
Intentando asignar salario negativo...
Error: El salario base debe ser mayor o igual a 300000

Intentando asignar salario menor al mínimo...
Error: El salario base debe ser mayor o igual a 300000

Intentando registrar horas extra negativas...
Error: Las horas extra no pueden ser negativas

Intentando dar aumento negativo...
Error: El porcentaje de aumento no puede ser negativo

=== Prueba de encapsulamiento ===
Salario base (vía getter): $500,000
Intentando modificar __salario_base directamente...
El salario base sigue siendo: $500,000 (no se modificó)
```