
## Свойства дисперсии



<div class="math-block theorem" id="variation-property-1">
<div class="math-block-title">Свойство 1.</div>
Дисперсия постоянной величины $C$ равна нулю: 
$$D(C) = 0.$$
</div>   

<div class="math-block proof" id="variation-property-1-proof">
<details>
<summary><span class="math-block-title" style="display:inline-block; cursor:pointer;">Доказательство свойства 1</span></summary>

- Распишем по определению выражение для дисперсии: 
 
 $$ D(C)=E\big((C−EC)^2\big) = E\big((C−C)^2\big) = E(0) = 0.$$
 
При  выводе было учтено, что математическое ожидание постоянной равно самой постоянной.
</details>
</div>

<div class="math-block theorem" id="variation-property-2">

<div class="math-block-title">Свойство 2.</div>

Постоянный множитель можно выносить за знак дисперсии, возводя его в квадрат:
$$D(C\cdot X) = C^2 \cdot DX.$$
</div>   

<div class="math-block proof" id="variation-property-2-proof">
<details>
<summary><span class="math-block-title" style="display:inline-block; cursor:pointer;">Доказательство свойства 2</span></summary>



- Вопользуемся [формулой](unit_07_01_variation.md#variation-formula) для вычисления дисперсии и [линейностью](../unit_06/unit_06_03_properties.md) математического ожидания
 
 $$ D(C\cdot X) = E(C\cdot X)^2 - \big(E(C\cdot X)\big)^2 = C^2 \cdot EX^2 - C^2\cdot (EX)^2 = c^2\cdot DX .$$

</details>
</div>


<div class="math-block remark">

<div class="math-block-title">Замечание</div>

- Дисперсия *не является* линейной величиной!

- При $|C| > 1$ значения величины $Y = CX$ рассеяны вокруг
математического ожидания $EY = E(CX)$ *больше*, чем возможные значения $X$ вокруг $EX$, т.е. $D (C X )> DX$.
- Наоборот, при $0 <|C| < 1$  значения величины $Y = CX$ "ближе" к $E(CX)$, чем $X$ к $EX$, т.е. $D(CX) < DX$.
</div>


<div class="math-block theorem" id="variation-property-3">

<div class="math-block-title">Свойство 3.</div>

Дисперсия суммы двух ***независимых*** случайных величин равна сумме дисперсий этих величин:

$$ D(X+Y) = DX + DY. $$
</div>   

<div class="math-block proof" id="variation-property-3-proof">
<details>
<summary><span class="math-block-title" style="display:inline-block; cursor:pointer;">Доказательство свойства 3</span></summary>


- По [формуле](unit_07_01_variation.md#variation-formula)
 
$$ D(X+Y) = E(X+Y)^2 - \big(E(X+Y)\big)^2 = $$ 

- воспользуемся [линейностью](../unit_06/unit_06_03_properties.md) математического ожидания
$$ = E(X^2+2 X  Y + Y^2) - (EX)^2 - 2\cdot EX\cdot EY -(EY)^2=$$
$$ =EX^2+2\cdot E(X\cdot Y)+EY^2-(EX)^2-2\cdot EX\cdot EY - (EY)^2 = $$ 
- т.к.  $X$ и $Y$ независимы, то [$E(X\cdot Y) = EX\cdot EY$](../unit_06/unit_06_03_properties.md#expectation-independence), и
	$$ =EX^2 - (EX)^2 + EY^2 - (EY)^2 = DX+ DY.$$

</details>
</div>

Последнее свойство верно для произвольного количества попарно независимых случайных величин.
<div class="math-block remark">

<div class="math-block-title">Замечание (следствия из свойств 1-3)</div>

- Дисперсия суммы постоянной величины и случайной равна дисперсии случайной величины: $$ D(X+C) = DX. $$ 
- Это утверждение следует из независимости постоянной случайной величины и любой другой случайной величиной и свойства $3$.
- Величины $X$ $X +C$ отличаются лишь началом отсчета и, значит, рассеяны вокруг своих математических ожиданий
одинаково.
- В общем случае, дисперсия величины $Y = a \cdot X + b$, где $a, b \in \mathbb{R}$, равна  $$ DY = a^2\cdot DX. $$
</div>


<div class="math-block theorem" id="variation-property-4">

<div class="math-block-title">Свойство 4.</div>

Дисперсия разности двух ***независимых*** случайных величин равна сумме дисперсий этих величин:

$$ D(X-Y) = DX + DY. $$
</div>   

<div class="math-block proof" id="variation-property-4-proof">
<details>
<summary><span class="math-block-title" style="display:inline-block; cursor:pointer;">Доказательство свойства 4</span></summary>


- По свойствам [2](#variation-property-2) и [3](#variation-property-3)
 
$$ D(X+Y) =D(X) + D(-Y) = DX + (-1)^2 \cdot DY = DX + DY.$$ 


</details>
</div>


<div class="math-block example">
<div class="math-block-title">Пример</div>

Найти дисперсию случайной величины $Z = 8X - 5Y + 7$, если известно, что случайные величины $X$ и $Y$  независимы и $DX = 1.5,\,  DY = 1$. 

<details>
<summary><span class="math-block-title" style="display:inline-block; cursor:pointer;">Посмотреть решение</span></summary>

$DZ = D(8 X - 5 Y + 7) = D(8 X) + D(5Y) + D(7) = 8^2 \cdot DX + 5^2 \cdot DY + 0 = 121.$

</details>

</div>


