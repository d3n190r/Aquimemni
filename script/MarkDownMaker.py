import os
import json


def generate_tree_markdown(directory, ignored_dirs, indent=""):
    tree = ""
    items = sorted(os.listdir(directory))
    for index, item in enumerate(items):
        item_path = os.path.join(directory, item)
        is_last = (index == len(items) - 1)
        prefix = "└── " if is_last else "├── "

        if os.path.isdir(item_path):
            if any(os.path.commonpath([item_path]).startswith(ignored) for ignored in ignored_dirs):
                continue
            tree += f"{indent}{prefix}{item}/\n"
            tree += generate_tree_markdown(item_path, ignored_dirs, indent + ("    " if is_last else "│   "))
        else:
            tree += f"{indent}{prefix}{item}\n"
    return tree


def extract_files_with_extension(directory, extensions, ignored_dirs):
    files = []
    for root, _, filenames in os.walk(directory):
        if any(os.path.commonpath([root]).startswith(ignored) for ignored in ignored_dirs):
            continue
        for filename in filenames:
            if any(filename.endswith(ext) for ext in extensions):
                files.append(os.path.join(root, filename))
    return files


def generate_markdown_output(directory, extensions, ignored_dirs, output_file="output.md"):
    markdown_content = f"# File Structure of {directory}\n\n"
    markdown_content += "```\n" + generate_tree_markdown(directory, ignored_dirs) + "```\n\n"

    files = extract_files_with_extension(directory, extensions, ignored_dirs)

    for file_path in files:
        relative_path = os.path.relpath(file_path, directory)
        markdown_content += f"## {relative_path}\n\n```\n"
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()
            markdown_content += content + "\n```\n\n"
        except Exception as e:
            markdown_content += f"Error reading file: {e}\n\n```\n\n"

    with open(output_file, "w", encoding="utf-8") as f:
        f.write(markdown_content)

    print(f"Markdown output saved to {output_file}")


if __name__ == "__main__":
    config_file = input("Enter the path to the configuration JSON file: ").strip()

    try:
        with open(config_file, "r", encoding="utf-8") as f:
            config = json.load(f)

        folder = config.get("folder", "").strip()
        extensions = config.get("extensions", [])
        ignored_dirs = config.get("ignored_dirs", [])
        output_file = config.get("output_file", "output.md")

        if not os.path.isdir(folder):
            print("Invalid folder path. Please enter a valid directory.")
        else:
            generate_markdown_output(folder, extensions, ignored_dirs, output_file)
    except Exception as e:
        print(f"Error reading config file: {e}")
