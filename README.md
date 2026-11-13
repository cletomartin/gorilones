# Gorilones

Juego de navegador del club de corredores: el viernes a las 6:00 se sale a correr
y se acaba en la churrería La Hormiga.

**Versión 0.4.** Los doce gorilones con su aspecto y su personalidad (quedan algunos pedidos por confirmar).

## Cómo jugar

Abre `index.html` en el navegador. No hace falta instalar nada ni usar servidor.

**En el móvil:** toca y mantén el dedo delante del jugador para adelantarte o detrás para
quedarte atrás (el jugador sigue al dedo); desliza hacia arriba para saltar; toca al
compañero que tiene el bocadillo «...» para hablar; toca el diálogo para avanzar. Se juega
en vertical o en horizontal.

**Con teclado:**

- ◀ ▶: colocarte en el grupo. Ir hacia delante gasta energía; ir hacia atrás la recupera.
- ▲: saltar charcos, baches y bordillos (en los caminos de tierra, piedras). Pisar un charco
  cansa; tropezar con un bache, un bordillo o una piedra cansa más y te deja atrás.
- Espacio / HABLAR: hablar con quien tengas al lado (le sale un bocadillo «...») y pasar el texto.
- L / LUZ: encender o apagar la frontal (en los tramos sin luz no se ven ni los charcos…
  pero a Emiliano y a César no les hace ninguna gracia: mientras esté encendida gritan,
  pierdes energía y baja su amistad).
- 1-3: elegir respuesta.

La portada empieza con una animación; se pulsa cualquier tecla o se toca la pantalla para
pasar a la elección de circuito.

Antes de empezar se elige circuito: **Urbano** (9 km) o **La Poblachuela** (12 km).
Cada sitio por el que se pasa tiene su dibujo (Parque de Gasset, Vía Verde, El Cerrillo,
cementerio, UCLM, estación del AVE, Go Fit…). Cada viernes puede
faltar alguno (con su excusa); siempre salen al menos 6.

Hablar y pisar charcos cansa; en los tramos duros (el barro) la energía baja más rápido. Si llegas a cero,
te da una pájara y te quedas atrás. Al final hay un sprint y **el último paga los churros**.

## Dónde se cambia cada cosa

| Archivo | Qué contiene |
|---|---|
| `js/personajes.js` | Los gorilones: nombre, aspecto (pelo, barba, gafas, pantalón, zapatillas…), sitio en el grupo, sprint y lo que piden en La Hormiga |
| `js/conversaciones.js` | Conversaciones de cada uno, frases sueltas, gritos por la luz, excusas para faltar y la quedada |
| `js/circuitos.js` | Los circuitos: distancia, tramos (paisaje), sitios por los que se pasa, tramos sin luz y sucesos del recorrido |
| `js/dibujo.js` | El pixel art (generado con código, sin imágenes) |
| `js/juego.js` | La lógica del juego |

## Ficha de cada gorilón (para rellenar)

```
Nombre / mote:
Cómo es (pelo, barba, gafas, altura, pantalón, color de zapatillas):
Personalidad (2-3 líneas):
Frase típica o muletilla:
Cómo corre (tira del grupo / va atrás / habla sin parar / va callado…):
Manía o anécdota conocida:
Qué pide en La Hormiga:
```
