import sys

path = r"c:\my-stuff\devops-hub\error.log"
with open(path, 'r', encoding='utf-16le') as f:
    print(f.read())
