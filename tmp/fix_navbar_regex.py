import re

path = r"c:\my-stuff\devops-hub\src\components\navbar.tsx"
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

pattern = r'(<DropdownMenuItem asChild>\s*<Link href="/dashboard"[^>]+>Dashboard</Link>\s*</DropdownMenuItem>)'

insert = r'''\1

                    {session?.user?.role === "MEMBER" && (
                      <DropdownMenuItem className="cursor-pointer text-amber-500 font-semibold" asChild>
                         <Link href="/request-admin" className="flex items-center w-full"><Shield className="mr-2 h-4 w-4" /> Apply for Admin</Link>
                      </DropdownMenuItem>
                    )}'''

content_new = re.sub(pattern, insert, content)

if content_new != content:
    with open(path, 'w', encoding='utf-8') as f:
         f.write(content_new)
    print("Success")
else:
    print("Failed")
