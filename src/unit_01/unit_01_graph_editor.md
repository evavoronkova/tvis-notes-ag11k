# Интерактивное создание графа

Создайте граф с помощью кнопок над полем. Множества вершин $V$ и рёбер $E$ обновляются автоматически.

<div class="graph-editor" id="graph-editor-1">
  <div class="graph-toolbar" role="group" aria-label="Режим редактирования графа">
    <button type="button" data-mode="select" class="active">↖ Перемещать</button>
    <button type="button" data-mode="vertex">＋ Вершина</button>
    <button type="button" data-mode="edge">／ Ребро</button>
    <button type="button" data-mode="delete">× Удалить</button>
    <button type="button" data-action="reset">Очистить граф</button>
  </div>

  <div class="graph-canvas">
    <svg viewBox="0 0 700 420" role="img" aria-label="Поле для создания графа">
      <text x="350" y="210" text-anchor="middle" fill="#8995a7" font-size="17">
        Выберите режим «Вершина» и нажмите на поле
      </text>
    </svg>
  </div>

  <p class="graph-status" aria-live="polite">Режим: перемещение вершин.</p>
  <p class="graph-selected-info" aria-live="polite">Щёлкните по вершине в режиме «Перемещать», чтобы увидеть её степень и соседей.</p>

  <div class="graph-info">
    <section class="graph-info-card">
      <h4>Множество вершин $V$</h4>
      <p class="graph-math-list graph-vertex-list">V = ∅</p>
      <p class="graph-hint graph-vertex-count">Число вершин: 0</p>
    </section>
    <section class="graph-info-card">
      <h4>Множество рёбер $E$</h4>
      <p class="graph-math-list graph-edge-list">E = ∅</p>
      <p class="graph-hint graph-edge-count">Число рёбер: 0</p>
    </section>
    <section class="graph-info-card graph-stats-card">
      <h4>Степени и соседи вершин</h4>
      <div class="graph-stats-wrap">
        <table class="graph-stats-table">
          <thead><tr><th>Вершина $v$</th><th>Степень $\deg(v)$</th><th>Соседи $N(v)$</th></tr></thead>
          <tbody class="graph-stats-body"><tr><td colspan="3">Добавьте вершины</td></tr></tbody>
        </table>
      </div>
      <p class="graph-hint">Степень вершины - число инцидентных ей рёбер; множество соседей - вершины, соединённые с ней ребром.</p>
    </section>
  </div>

  <p class="graph-hint">
    <strong>Как работать:</strong> в режиме «Вершина» нажимайте на свободное место;
    в режиме «Ребро» выберите две вершины; в режиме «Перемещать» щёлкните по вершине, чтобы увидеть её степень и подсветить соседей, либо перетаскивайте её;
    в режиме «Удалить» нажмите на вершину или ребро.
  </p>
</div>
