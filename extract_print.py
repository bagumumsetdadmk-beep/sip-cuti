import re

with open('components/CetakCutiView.tsx', 'r') as f:
    content = f.read()

# find printable-area
start_idx = content.find('<div id="printable-area"')
end_idx = content.find('{/* CATATAN KAKI */}', start_idx)
# find the end of the printable area div
rest = content[end_idx:]
end_div = rest.find('</div>\n              </div>') + 6
full_div = content[start_idx:end_idx + end_div]

print(f"Start: {start_idx}, Length: {len(full_div)}")
with open('printable.txt', 'w') as f:
    f.write(full_div)

