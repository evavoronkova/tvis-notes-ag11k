
document.addEventListener("DOMContentLoaded", function () {

    const figures = document.querySelectorAll(".figure");

    if (!figures.length) {
        return;
    }

    /*
     * Нумерация рисунков
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

    chapterNumber = chapterNumber || "1";

    figures.forEach(function (figure, index) {

        const number = chapterNumber + "." + (index + 1);

        figure.dataset.figureNumber = number;

        const caption = figure.querySelector("figcaption");

        if (caption) {
            caption.dataset.figureNumber = number;
        }

        /*
         * Увеличение SVG по клику
         */

        const images = figure.querySelectorAll('img[src$=".svg"], img[src$=".SVG"]');

        images.forEach(function (img) {
            img.addEventListener("click", function () {
                img.classList.toggle("zoomed");
            });
        });
    });
});
