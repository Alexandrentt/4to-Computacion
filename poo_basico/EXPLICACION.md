# Programación Orientada a Objetos (POO) en Python — Guía para programadores estructurados


## 1. ¿Qué es la Programación Orientada a Objetos?

La **programación estructurada** organiza el código en **funciones** y **datos separados**:

```
datos  +  funciones  =  programa
```

La **programación orientada a objetos (POO)** une los **datos** y las **funciones** que los manipulan
en una misma unidad llamada **objeto**:

```
(datos + funciones)  +  (datos + funciones)  =  programa
```

Es decir, en vez de pensar "tengo datos y le aplico funciones", pensamos en **"objetos que entienden
mensajes"**. Un objeto **sabe** quién es (sus atributos) y **sabe hacer** cosas (sus métodos).

POO se basa en **4 pilares**:

| Pilar | Idea principal |
|-------|----------------|
| **Abstracción** | Modelamos solo lo relevante del mundo real. |
| **Encapsulamiento** | Los datos y su lógica se agrupan; algunos quedan ocultos. |
| **Herencia** | Una clase "hija" reutiliza y extiende una clase "padre". |
| **Polimorfismo** | Diferentes objetos pueden responder al mismo mensaje de forma distinta. |

A lo largo de esta guía veremos cada uno con el ejemplo de las cuentas bancarias.

---

## 2. Conceptos fundamentales

### 2.1 Clase vs. Objeto

- **Clase:** el *molde* o *plantilla*. Define qué atributos y qué métodos tendrán los objetos.
  No ocupa "existencia real"; es una receta.
- **Objeto (instancia):** una *copia concreta* hecha a partir de la clase, con sus propios valores.

```python
class CuentaBancaria:      # CLASE (el molde)
    def __init__(self, titular, saldo_inicial=0):
        self.titular = titular
        self.saldo = saldo_inicial

cuenta1 = CuentaBancaria("Ana", 100)   # OBJETO (una instancia del molde)
cuenta2 = CuentaBancaria("Luis", 500)  # OTRO objeto independiente
```

**Analogía:** la clase es el **plano** de una casa; los objetos son las **casas construidas** a partir
de ese plano. Puedes construir muchas casas del mismo plano, y cada una tiene su propio estado.

### 2.2 Atributos (datos)

Son las **variables que pertenecen a cada objeto**. Se definen normalmente dentro del constructor
`__init__` y se acceden con `self`.

```python
self.titular = titular   # atributo "titular"
self.saldo = saldo       # atributo "saldo"
```

Se leen y modifican con la notación de punto: `cuenta1.saldo`.

### 2.3 Métodos (funciones del objeto)

Son **funciones que pertenecen a la clase** y actúan sobre el objeto. Reciben `self` como primer
parámetro, que referencia al objeto que llama al método.

```python
def depositar(self, cantidad):
    self.saldo += cantidad
```

Se invocan con la notación de punto: `cuenta1.depositar(50)`.

### 2.4 El constructor `__init__` y `self`

- **`__init__`** es un **método especial** que Python ejecuta automáticamente **al crear un objeto**.
  Sirve para inicializar los atributos. Es el "método constructor".
- **`self`** es una referencia **al propio objeto**. Sin `self` la función no sabría **a qué objeto**
  está modificando sus datos.

```python
def __init__(self, titular, saldo_inicial=0):
    self.titular = titular
    self.saldo = saldo_inicial
```

### 2.5 Encapsulamiento

Es la idea de **agrupar atributos y métodos** dentro de un objeto, y **proteger** algunos datos para
que no se modifiquen por fuera sin pasar por la lógica correcta.

- Atributos públicos: `self.saldo` (se puede tocar desde fuera).
- Atributos "privados" (por **convención**): se escriben con guion bajo `self._movimientos`.
  En Python no hay privacidad estricta; el `_` indica "no lo toques desde fuera".
- Envuelve la lógica importante en **métodos** que validan (por ejemplo, no retirar más de lo que hay).

```python
def retirar(self, cantidad):
    if cantidad > self.saldo:          # validacion interna
        print("Saldo insuficiente")
    else:
        self.saldo -= cantidad
```

Así evitamos que el saldo se vuelva negativo por manipulación directa.

---

## 2.5.1 Encapsulamiento en profundidad

El encapsulamiento tiene **tres niveles** en Python:

### Nivel 1: Atributos Públicos (sin guion bajo)
```python
class Persona:
    def __init__(self, nombre):
        self.nombre = nombre  # Atributo público

p = Persona("Ana")
print(p.nombre)      # ✅ Se puede leer
p.nombre = "María"   # ✅ Se puede modificar
```

### Nivel 2: Atributos "Protegidos" (un guion bajo `_`)
```python
class CuentaBancaria:
    def __init__(self, titular, saldo):
        self.titular = titular
        self.saldo = saldo
        self._movimientos = []  # Atributo protegido (convención)

c = CuentaBancaria("Ana", 100)
print(c._movimientos)  # ⚠️ Técnicamente se puede, pero NO deberías
c._movimientos = []    # ⚠️ Python te deja, pero violas la convención
```
**El guion bajo `_` es una señal:** "esto es interno, no lo toques desde fuera".

### Nivel 3: Atributos "Privados" (doble guion bajo `__`)
```python
class CuentaSegura:
    def __init__(self, titular, saldo):
        self.titular = titular
        self.__saldo = saldo  # Atributo privado (name mangling)

c = CuentaSegura("Ana", 100)
print(c.__saldo)  # ❌ Error: AttributeError
# c.__saldo = 0  # ❌ Esto NO modifica el saldo original
```
**El doble guion bajo `__` activa el "name mangling":** Python renombra internamente el atributo a
`_CuentaSegura__saldo`. Esto hace difícil (no imposible) acceder desde fuera.

---

## 2.5.2 Getters y Setters (property)

En POO "clásica" (Java, C++), se usan métodos `get()` y `set()` para controlar el acceso a atributos.
En Python usamos **`@property`** para hacerlo de forma elegante:

### Sin property (métodos tradicionales):
```python
class Rectangulo:
    def __init__(self, ancho, alto):
        self._ancho = ancho
        self._alto = alto

    def get_ancho(self):
        return self._ancho

    def set_ancho(self, valor):
        if valor <= 0:
            raise ValueError("El ancho debe ser positivo")
        self._ancho = valor

r = Rectangulo(10, 5)
print(r.get_ancho())  # 10
r.set_ancho(20)
```

### Con property (forma Pythonica):
```python
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

r = Rectangulo(10, 5)
print(r.ancho)  # 10 (se ve como atributo, pero llama al getter)
r.ancho = 20    # se ve como asignación, pero llama al setter
# r.ancho = -5  # ❌ ValueError
```

**Ventajas de `@property`:**
- Se accede como si fuera un atributo normal: `r.ancho` en vez de `r.get_ancho()`
- Puedes agregar validación sin cambiar el código que usa la clase
- Puedes hacer que un atributo sea "solo lectura" (solo getter, sin setter)

---

## 2.5.3 Ejemplo práctico: Cuenta con encapsulamiento completo

```python
class CuentaBancaria:
    def __init__(self, titular, saldo_inicial=0):
        self.titular = titular              # Público (se puede leer)
        self.__saldo = saldo_inicial        # Privado (no se puede tocar directamente)
        self._movimientos = []              # Protegido (uso interno)

    @property
    def saldo(self):
        """Getter: permite leer el saldo de forma controlada"""
        return self.__saldo

    def depositar(self, cantidad):
        """Método público: controla cómo se modifica el saldo"""
        if cantidad <= 0:
            raise ValueError("El depósito debe ser positivo")
        self.__saldo += cantidad
        self._movimientos.append(f"Depósito: +{cantidad}")

    def retirar(self, cantidad):
        """Método público: valida antes de retirar"""
        if cantidad <= 0:
            raise ValueError("El retiro debe ser positivo")
        if cantidad > self.__saldo:
            raise ValueError("Saldo insuficiente")
        self.__saldo -= cantidad
        self._movimientos.append(f"Retiro: -{cantidad}")

    def ver_historial(self):
        """Método público: muestra los movimientos (interno)"""
        return self._movimientos.copy()  # Devuelve copia para proteger la lista original

# Uso
cuenta = CuentaBancaria("Ana", 100)

print(cuenta.saldo)    # ✅ 100 (usando el getter)
# cuenta.__saldo = 0   # ❌ No funciona (no modifica el saldo real)
cuenta.depositar(50)  # ✅ Método con validación
print(cuenta.saldo)    # 150

# cuenta.__saldo = 0   # Esto NO modifica el saldo original
# cuenta._CuentaBancaria__saldo = 0  # ⚠️ Sí funcionaría pero es HACK
```

---

## 2.5.4 ¿Por qué encapsular?

### Problema sin encapsulamiento:
```python
class CuentaSinEncapsular:
    def __init__(self, titular, saldo):
        self.titular = titular
        self.saldo = saldo  # Público, vulnerable

c = CuentaSinEncapsular("Ana", 100)
c.saldo = -1000  # ❌ Saldo negativo, inconsistencia lógica
```

### Solución con encapsulamiento:
```python
class CuentaConEncapsular:
    def __init__(self, titular, saldo):
        self.titular = titular
        self.__saldo = saldo  # Privado, protegido

    @property
    def saldo(self):
        return self.__saldo

    def retirar(self, cantidad):
        if cantidad > self.__saldo:
            raise ValueError("Saldo insuficiente")
        self.__saldo -= cantidad

c = CuentaConEncapsular("Ana", 100)
# c.__saldo = -1000  # ❌ No funciona
c.retirar(1000)  # ❌ Error: Saldo insuficiente
```

**Beneficios:**
1. **Protección de datos:** Evita modificaciones incorrectas
2. **Flexibilidad:** Puedes cambiar la implementación interna sin romper el código externo
3. **Validación:** Controlas cómo y cuándo se modifican los datos
4. **Mantenibilidad:** Easier to debug and maintain

---

## 3. Recorrido por el ejemplo (`ejemplo.py`)

El programa simula **cuentas bancarias**. Ejecútalo con:

```
python ejemplo.py
```

### Paso a paso

1. **Definimos la clase `CuentaBancaria`** con su constructor, que inicializa `titular`, `saldo` y
   `_movimientos`.
2. **Definimos métodos básicos:** `depositar`, `retirar`, `ver_saldo` y `__str__`.
   - `depositar` y `retirar` **validan** antes de tocar el saldo (encapsulamiento).
   - `ver_saldo` es un **getter** (devuelve el dato de forma segura).
   - `__str__` controla qué se muestra con `print(cuenta)`.
3. **Definimos la clase `CuentaAhorro` que hereda de `CuentaBancaria`** (herencia).
   - Usa `super().__init__(...)` para reutilizar el constructor del padre.
   - Añade un atributo nuevo (`interes_anual`) y un método nuevo (`aplicar_interes`).
4. **En `__main__` creamos objetos** (instancias) y los usamos:
   - `cuenta1 = CuentaBancaria("Ana", 100)`
   - `ahorro = CuentaAhorro("Luis", 1000, 10)`
   - Comprobamos que cada objeto **guarda sus propios datos** (independencia).

### Salida esperada

```
=== Cuenta sencilla ===
Cuenta de Ana - Saldo: 100
Ana deposito 50. Saldo: 150
Ana retiro 30. Saldo: 120
Saldo insuficiente. Saldo actual: 120
Saldo final de Ana: 120

=== Cuenta de ahorro (hereda de CuentaBancaria) ===
Cuenta de Luis - Saldo: 1000
Luis deposito 200. Saldo: 1200
Luis deposito 120.0. Saldo: 1320.0
  -> Interes aplicado: 120.00
Saldo final de Luis: 1320.0

=== Comprobacion de independencia entre objetos ===
Saldo de Ana : 120
Saldo de Luis: 1320.0
```

---

## 4. Correspondencia con la programación estructurada

Si ya sabes estructurado, esta tabla te ayudará a "traducir" mentalmente:

| Programación estructurada | Programación orientada a objetos |
|---------------------------|----------------------------------|
| Variable global / local | **Atributo** (`self.x`) |
| Función | **Método** |
| Llamar `funcion(dato)` | Llamar `objeto.metodo()` |
| `funcion(x)` — pasa el dato como argumento | `obj.metodo()` — el objeto ya *lleva* sus datos |
| Datos sueltos + funciones que los usan | Datos y funciones **unidos en el objeto** |
| Módulos que agrupan funciones | **Clases** que agrupan datos + métodos |

**Ejemplo concreto (estructurado vs. POO):**

```python
# ESTRUCTURADO (que ya conoces)
def crear_cuenta(titular, saldo):
    return {"titular": titular, "saldo": saldo}

def depositar(cuenta, cantidad):
    cuenta["saldo"] += cantidad

c = crear_cuenta("Ana", 100)
depositar(c, 50)
```

```python
# ORIENTADO A OBJETOS (la misma idea, agrupada)
class CuentaBancaria:
    def __init__(self, titular, saldo):
        self.titular = titular
        self.saldo = saldo

    def depositar(self, cantidad):
        self.saldo += cantidad

c = CuentaBancaria("Ana", 100)
c.depositar(50)
```

En POO **el objeto se pasa a sí mismo** (`self`); no tengo que mandárselo yo.

---

## 5. Los cuatro pilares en resumen

1. **Abstracción:** la clase `CuentaBancaria` solo modela lo necesario del banco (titular y saldo),
   no todo un banco real.
2. **Encapsulamiento:** `_movimientos` queda oculto y el saldo solo cambia vía métodos con validación.
3. **Herencia:** `CuentaAhorro` hereda todo de `CuentaBancaria` y añade el interés.
4. **Polimorfismo:** un método puede comportarse distinto según la clase (en el ejemplo lo vemos más
   en la idea de que `__str__` cambia por objeto; en proyectos mayores aparecerá con más claridad).

---

## 6. Comandos para probarlo

```bash
# Ir a la carpeta
cd poo_basico

# Ejecutar el ejemplo
python ejemplo.py

# Ver el resultado sin modificar el archivo
```

---

## 7. Ejercicios para practicar

1. Añade a `CuentaBancaria` un método `transferir(a_otra_cuenta, cantidad)`.
2. Crea una clase `CuentaCorriente` que herede de `CuentaBancaria` y permita un **descubierto**
   (saldo negativo hasta cierto límite).
3. Modifica `__str__` para que muestre también el número de movimientos.
4. Añade un atributo de **clase** (sin `self`) que cuente el total de cuentas creadas.

---

## 8. Glosario rápido

| Término | Definición |
|---------|------------|
| **Clase** | Molde o plantilla que define atributos y métodos. |
| **Objeto / instancia** | Copia concreta creada a partir de una clase. |
| **Atributo** | Variable que pertenece al objeto. |
| **Método** | Función que pertenece a la clase y actúa sobre el objeto. |
| **Constructor (`__init__`)** | Método que se ejecuta al crear un objeto e inicializa atributos. |
| **`self`** | Referencia al propio objeto dentro de sus métodos. |
| **Herencia** | Capacidad de una clase hija de reutilizar la clase padre. |
| **`super()`** | Permite llamar al constructor o métodos de la clase padre. |
| **Encapsulamiento** | Agrupar y proteger datos dentro del objeto. |
| **Método mágico** | Métodos especiales predefinidos como `__init__`, `__str__`, `__len__`… |
