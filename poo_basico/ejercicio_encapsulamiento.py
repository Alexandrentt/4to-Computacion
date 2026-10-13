"""
Ejercicio de encapsulamiento: Sistema de Gestión de Empleados
Demuestra el uso de atributos privados, protegidos y properties
"""

class Empleado:
    SALARIO_MINIMO = 300000  # Constante de clase

    def __init__(self, nombre, salario_base):
        self.nombre = nombre  # Público
        self.__salario_base = 0  # Privado, se inicializa en 0
        self._horas_extra = 0  # Protegido
        self.__tarifa_hora_extra = 0  # Privado

        # Usamos el método setter para validar
        self.asignar_salario_base(salario_base)

    @property
    def salario_base(self):
        """Getter: permite leer el salario base"""
        return self.__salario_base

    @property
    def horas_extra(self):
        """Getter: permite ver las horas extra"""
        return self._horas_extra

    @property
    def salario_anual(self):
        """Property calculada: salario anual estimado"""
        return self.calcular_salario_mensual() * 12

    def asignar_salario_base(self, salario):
        """Setter con validación: asigna el salario base"""
        if salario < 0:
            raise ValueError("El salario base no puede ser negativo")
        if salario < self.SALARIO_MINIMO:
            raise ValueError(f"El salario base debe ser mayor o igual a {self.SALARIO_MINIMO}")
        self.__salario_base = salario
        # Recalcular tarifa de hora extra (50% del salario por hora)
        self.__tarifa_hora_extra = salario / 160 * 1.5

    def registrar_horas_extra(self, cantidad):
        """Registra horas extra trabajadas"""
        if cantidad < 0:
            raise ValueError("Las horas extra no pueden ser negativas")
        self._horas_extra = cantidad

    def calcular_salario_mensual(self):
        """Calcula el salario total del mes (base + horas extra)"""
        pago_horas_extra = self._horas_extra * self.__tarifa_hora_extra
        return self.__salario_base + pago_horas_extra

    def dar_aumento(self, porcentaje):
        """Aumenta el salario base por un porcentaje"""
        if porcentaje < 0:
            raise ValueError("El porcentaje de aumento no puede ser negativo")
        nuevo_salario = self.__salario_base * (1 + porcentaje / 100)
        self.asignar_salario_base(nuevo_salario)

    def __str__(self):
        """Representación en string del empleado"""
        return (f"Nombre: {self.nombre}\n"
                f"Salario base: ${self.__salario_base:,.0f}\n"
                f"Horas extra: {self._horas_extra}\n"
                f"Salario mensual: ${self.calcular_salario_mensual():,.0f}\n"
                f"Salario anual: ${self.salario_anual:,.0f}")


# ==========================================
# DEMOSTRACIÓN
# ==========================================
if __name__ == "__main__":
    print("=" * 60)
    print("=== Empleado 1: Juan Pérez ===")
    print("=" * 60)

    juan = Empleado("Juan Pérez", 500000)
    juan.registrar_horas_extra(10)
    print(juan)
    print()

    print("=" * 60)
    print("=== Empleado 2: María García ===")
    print("=" * 60)

    maria = Empleado("María García", 400000)
    print(maria)
    print()

    print("=" * 60)
    print("=== Pruebas de validación ===")
    print("=" * 60)

    # Prueba 1: Salario negativo
    print("Intentando asignar salario negativo...")
    try:
        juan.asignar_salario_base(-100000)
    except ValueError as e:
        print(f"Error: {e}")
    print()

    # Prueba 2: Salario menor al mínimo
    print("Intentando asignar salario menor al mínimo...")
    try:
        juan.asignar_salario_base(200000)
    except ValueError as e:
        print(f"Error: {e}")
    print()

    # Prueba 3: Horas extra negativas
    print("Intentando registrar horas extra negativas...")
    try:
        juan.registrar_horas_extra(-5)
    except ValueError as e:
        print(f"Error: {e}")
    print()

    # Prueba 4: Aumento negativo
    print("Intentando dar aumento negativo...")
    try:
        juan.dar_aumento(-10)
    except ValueError as e:
        print(f"Error: {e}")
    print()

    print("=" * 60)
    print("=== Prueba de encapsulamiento ===")
    print("=" * 60)

    print(f"Salario base (vía getter): ${juan.salario_base:,.0f}")
    print("Intentando modificar __salario_base directamente...")
    juan.__salario_base = 0  # Esto NO modifica el atributo privado real
    print(f"El salario base sigue siendo: ${juan.salario_base:,.0f} (no se modificó)")
    print()

    print("=" * 60)
    print("=== Prueba de aumento ===")
    print("=" * 60)

    print(f"Salario actual de Juan: ${juan.salario_base:,.0f}")
    juan.dar_aumento(10)
    print(f"Salario después del 10% de aumento: ${juan.salario_base:,.0f}")
    print(f"Nuevo salario mensual: ${juan.calcular_salario_mensual():,.0f}")
