import re

with open('components/CetakCutiView.tsx', 'r') as f:
    content = f.read()

start = content.find('<div id="printable-area"')
end = content.find('</div>\n            </div>\n          </div>\n        );')

if start != -1 and end != -1:
    printable_div = content[start:end]
    print(f"Extracted length: {len(printable_div)}")
    with open('printable.txt', 'w') as f:
        f.write(printable_div)
else:
    print("Not found")

