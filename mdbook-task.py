import sys
import json
import re


TASK_START = re.compile(r"^\s*:::\s*task\s*$")
TASK_END = re.compile(r"^\s*:::\s*$")


def process_chapter(chapter, counter):
    content = chapter["Chapter"]["content"]

    lines = content.splitlines()
    output = []

    inside_task = False
    task_number = None

    for line in lines:

        # -------------------------
        # начало задачи
        # -------------------------
        if not inside_task and TASK_START.match(line):
            counter[0] += 1
            task_number = counter[0]

            inside_task = True

            # Anchor
            output.append(
                f'<a id="task-{task_number}"></a>'
            )

            # Заголовок задачи
            output.append("")
            output.append(
                f"> **Задача {task_number}.**"
            )
            output.append("")

            continue

        # -------------------------
        # конец задачи
        # -------------------------
        if inside_task and TASK_END.match(line):
            output.append("")
            inside_task = False
            task_number = None
            continue

        # -------------------------
        # содержимое задачи
        # -------------------------
        if inside_task:

            # Пустые строки сохраняем
            if line.strip() == "":
                output.append(">")
            else:
                output.append("> " + line)

        else:
            output.append(line)

    chapter["Chapter"]["content"] = "\n".join(output)

    # Рекурсивно обрабатываем вложенные главы
    for subchapter in chapter["Chapter"].get("sub_items", []):
        process_chapter(subchapter, counter)


def main():
    # mdBook передаёт JSON через stdin
    data = json.load(sys.stdin)

    # Общий счётчик на всю книгу
    counter = [0]

    for chapter in data["chapters"]:
        process_chapter(chapter, counter)

    # Возвращаем книгу mdBook
    json.dump(
        data,
        sys.stdout,
        ensure_ascii=False
    )


if __name__ == "__main__":
    main()