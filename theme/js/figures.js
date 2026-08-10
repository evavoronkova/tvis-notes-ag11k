document.addEventListener("DOMContentLoaded", function () {

    const figures = document.querySelectorAll(".figure");

    if (!figures.length) {
        return;
    }

    /*
     * Номер главы.
     *
     * Если у страницы есть:
     *
     * <body data-chapter="1">
     *
     * используется этот номер.
     *
     * Иначе определяется номером первого заголовка h1,
     * если он начинается с числа.
     */

    let chapterNumber = document.body.dataset.chapter;

    if (!chapterNumber) {

        const h1 = document.querySelector("h1");

        if (h1) {

            const match = h1.textContent.trim().match(/^(\d+)/);

            if (match) {
                chapterNumber = match[1];
            }
        }
    }

    /*
     * Если номер главы определить не удалось,
     * используем номер 1.
     */

    chapterNumber = chapterNumber || "1";

    figures.forEach(function (figure, index) {

        const number = chapterNumber + "." + (index + 1);

        figure.dataset.figureNumber = number;

        const caption = figure.querySelector("figcaption");

        if (caption) {
            caption.dataset.figureNumber = number;
        }
    });
});